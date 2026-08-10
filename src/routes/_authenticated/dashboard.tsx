import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { Suspense, useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Activity, Wind, Droplets, Thermometer, Pill, Gauge, MapPin, Plus, Loader2 } from "lucide-react";

import { getDashboardData } from "@/lib/dashboard.functions";
import { getLiveEnvironment } from "@/lib/environment.functions";
import { updateSettings } from "@/lib/logs.functions";
import { PageHeader, StatTile, EmptyState, DataErrorState } from "@/components/ui-bits";
import { RiskGauge } from "@/components/risk-gauge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { RISK_LABELS } from "@/lib/risk-engine";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Vayu Vision" },
      { name: "description", content: "Your daily respiratory risk, air quality, and health snapshot." },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQueryOptions()),
  errorComponent: () => (
    <div className="py-6">
      <DataErrorState onRetry={() => window.location.reload()} />
    </div>
  ),
  component: DashboardPage,
});

const dashboardQueryOptions = () =>
  queryOptions({
    queryKey: ["dashboard"],
    queryFn: () => getDashboardData(),
  });

function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardInner />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}

function DashboardInner() {
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(dashboardQueryOptions());
  const queryClient = useQueryClient();
  const fetchEnv = useServerFn(getLiveEnvironment);
  const saveSettings = useServerFn(updateSettings);
  const [locating, setLocating] = useState(false);

  // If we have a home location but no recent snapshot, fetch on mount.
  useEffect(() => {
    const stale =
      !data.latestEnv ||
      Date.now() - new Date(data.latestEnv.captured_at).getTime() > 60 * 60 * 1000;
    if (stale && data.settings.home_latitude != null && data.settings.home_longitude != null) {
      fetchEnv({
        data: {
          latitude: data.settings.home_latitude,
          longitude: data.settings.home_longitude,
          label: data.settings.home_label ?? undefined,
        },
      })
        .then(() => queryClient.invalidateQueries({ queryKey: ["dashboard"] }))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const useMyLocation = useMutation({
    mutationFn: async () => {
      if (!("geolocation" in navigator)) throw new Error("Location not available");
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      await saveSettings({
        data: {
          home_latitude: pos.coords.latitude,
          home_longitude: pos.coords.longitude,
          home_label: "Current location",
        },
      });
      const res = await fetchEnv({
        data: {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          label: "Current location",
        },
      });
      if (res.error) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      toast.success("Location updated");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not get location"),
    onSettled: () => setLocating(false),
  });

  const greeting = getGreeting();
  const firstName = data.profile.display_name?.split(" ")[0] ?? "there";

  const env = data.latestEnv;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${greeting}, ${firstName}.`}
        subtitle="Here's a calm read of your day."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/symptoms" })}>
              <Plus className="mr-1 h-4 w-4" /> Log symptom
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/medications" })}>
              <Pill className="mr-1 h-4 w-4" /> Log dose
            </Button>
            <Button size="sm" onClick={() => navigate({ to: "/peak-flow" })}>
              <Gauge className="mr-1 h-4 w-4" /> Peak flow
            </Button>
          </>
        }
      />

      {data.settings.home_latitude == null && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal/40 bg-teal/10 p-5 text-sm">
          <div>
            <div className="font-medium">Set your location to see live air quality</div>
            <p className="text-muted-foreground">
              We use Open-Meteo to fetch AQI, weather, and pollen for your area.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setLocating(true);
              useMyLocation.mutate();
            }}
            disabled={locating}
          >
            {locating ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <MapPin className="mr-1 h-4 w-4" />}
            Use my location
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <StatTile
          label="AQI"
          value={env?.aqi ?? "—"}
          hint={env?.weather_summary ?? "No reading yet"}
          icon={<Wind className="h-4 w-4" />}
          toneClass={aqiTone(env?.aqi)}
        />
        <StatTile
          label="PM 2.5"
          value={env?.pm25 != null ? `${env.pm25.toFixed(0)}` : "—"}
          hint="µg/m³"
          icon={<Activity className="h-4 w-4" />}
        />
        <StatTile
          label="Temperature"
          value={env?.temperature_c != null ? `${env.temperature_c.toFixed(0)}°C` : "—"}
          hint="Feels calm"
          icon={<Thermometer className="h-4 w-4" />}
        />
        <StatTile
          label="Humidity"
          value={env?.humidity != null ? `${env.humidity.toFixed(0)}%` : "—"}
          hint="Comfort band 35–55%"
          icon={<Droplets className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Today's risk</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <RiskGauge score={data.risk.score} category={data.risk.category} />
            <p className="mt-4 text-center text-xs text-muted-foreground">
              {data.risk.factors[0]?.detail ?? "Log a few days of activity to sharpen the score."}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Why this score</CardTitle>
          </CardHeader>
          <CardContent>
            {data.risk.factors.length === 0 ? (
              <EmptyState
                title="No contributing factors yet"
                description="Start logging symptoms, medication and peak flow — the engine will surface what's driving your risk."
              />
            ) : (
              <ul className="space-y-2.5">
                {data.risk.factors.slice(0, 6).map((f) => (
                  <li
                    key={f.key}
                    className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background/50 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{f.label}</div>
                      <div className="text-xs text-muted-foreground">{f.detail}</div>
                    </div>
                    <div
                      className={
                        f.direction === "up"
                          ? "text-sm font-semibold text-risk-high"
                          : f.direction === "down"
                            ? "text-sm font-semibold text-risk-low"
                            : "text-sm font-semibold text-muted-foreground"
                      }
                    >
                      {f.impact > 0 ? "+" : ""}
                      {f.impact.toFixed(1)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Symptom trend — last 7 days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.weeklySymptoms}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickFormatter={(d: string) => new Date(d).toLocaleDateString(undefined, { weekday: "short" })}
                />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={[0, 10]} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="avg"
                  stroke="var(--chart-1)"
                  fill="url(#grad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <RecentList
          title="Recent symptoms"
          items={data.recentSymptoms.map((s) => ({
            id: s.id,
            primary: `Severity ${s.severity}/10`,
            secondary: s.suspected_trigger ?? "No trigger noted",
            time: s.logged_at,
          }))}
          empty="No symptoms logged yet."
        />
        <RecentList
          title="Recent medications"
          items={data.recentMeds.map((m) => ({
            id: m.id,
            primary: m.medication_name,
            secondary: m.medication_type ?? "medication",
            time: m.taken_at,
          }))}
          empty="No doses logged yet."
        />
        <RecentList
          title="Recent peak flow"
          items={data.recentPeakFlow.map((p) => ({
            id: p.id,
            primary: `${p.value_lpm} L/min`,
            secondary: "Peak expiratory flow",
            time: p.logged_at,
          }))}
          empty="No peak flow logged yet."
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-teal">Air Story</div>
            <h3 className="mt-1 font-serif text-2xl">Your day, in a breath.</h3>
          </div>
          <div className="text-xs text-muted-foreground">
            {RISK_LABELS[data.risk.category]}
          </div>
        </div>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          {buildAirStory(data)}
        </p>
      </div>
    </div>
  );
}

function RecentList({
  title,
  items,
  empty,
}: {
  title: string;
  items: Array<{ id: string; primary: string; secondary: string; time: string }>;
  empty: string;
}) {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.id} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium">{i.primary}</div>
                  <div className="truncate text-xs text-muted-foreground">{i.secondary}</div>
                </div>
                <div className="shrink-0 text-xs text-muted-foreground">
                  {new Date(i.time).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Rest well";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function aqiTone(aqi: number | null | undefined): string {
  if (aqi == null) return "text-foreground";
  if (aqi <= 50) return "text-risk-low";
  if (aqi <= 100) return "text-risk-moderate";
  if (aqi <= 150) return "text-risk-high";
  return "text-risk-critical";
}

function buildAirStory(data: Awaited<ReturnType<typeof getDashboardData>>): string {
  const env = data.latestEnv;
  const parts: string[] = [];
  if (env?.aqi != null) {
    if (env.aqi <= 50) parts.push("The air outside is clean today — a good window for time outdoors.");
    else if (env.aqi <= 100) parts.push("Air quality is moderate — sensitive lungs may notice a subtle tightness.");
    else parts.push("Air quality is elevated — keep outdoor time short and pre-medicate if you exercise.");
  } else {
    parts.push("Set your location to start seeing real-time air insights.");
  }
  if (env?.humidity != null) {
    if (env.humidity < 30) parts.push("It's a dry day — sip water and warm up before intense breathing.");
    else if (env.humidity > 65) parts.push("Humidity is high, which can amplify mold and dust triggers.");
  }
  if (data.risk.category === "low") parts.push("Your risk is low — a great day to keep the streak going.");
  else if (data.risk.category === "moderate") parts.push("Your risk is moderate — a good day to be gentle with yourself.");
  else parts.push("Your risk is elevated — keep your rescue inhaler close and pace your activity.");
  return parts.join(" ");
}
