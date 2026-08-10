import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, DataErrorState } from "@/components/ui-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { updateSettings } from "@/lib/logs.functions";
import { toast } from "sonner";
import { Loader2, MapPin } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Vayu Vision" },
      { name: "description", content: "Manage app preferences and location." },
      { name: "robots", content: "noindex" },
    ],
  }),
  errorComponent: () => (
    <div className="py-6">
      <DataErrorState onRetry={() => window.location.reload()} />
    </div>
  ),
  component: SettingsPage,
});

function SettingsPage() {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [label, setLabel] = useState("");
  const [notif, setNotif] = useState(true);
  const [locating, setLocating] = useState(false);
  const fn = useServerFn(updateSettings);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data: s, error } = await supabase
        .from("user_settings")
        .select("home_latitude, home_longitude, home_label, notifications_enabled")
        .eq("user_id", userData.user.id)
        .maybeSingle();
      if (error) toast.error("Could not load your settings. Please try again.");
      if (s) {
        setLat(s.home_latitude?.toString() ?? "");
        setLng(s.home_longitude?.toString() ?? "");
        setLabel(s.home_label ?? "");
        setNotif(s.notifications_enabled ?? true);
      }
    })();
  }, []);

  const mut = useMutation({
    mutationFn: fn,
    onSuccess: () => toast.success("Settings saved"),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  function useLocation() {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(4));
        setLng(pos.coords.longitude.toFixed(4));
        setLocating(false);
      },
      () => {
        toast.error("Could not get location");
        setLocating(false);
      },
      { timeout: 10000 }
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Settings" subtitle="Tell us where you breathe and how you like to be nudged." />
      <Card className="max-w-2xl shadow-soft">
        <CardHeader>
          <CardTitle>Home location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="lat">Latitude</Label>
              <Input id="lat" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="12.97" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lng">Longitude</Label>
              <Input id="lng" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="77.59" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="label">Label</Label>
            <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Home" />
          </div>
          <Button variant="outline" size="sm" onClick={useLocation} disabled={locating}>
            {locating ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <MapPin className="mr-1 h-4 w-4" />}
            Use current location
          </Button>

          <div className="flex items-center justify-between rounded-xl border border-border bg-background/50 px-4 py-3">
            <div>
              <div className="text-sm font-medium">Notifications</div>
              <div className="text-xs text-muted-foreground">Occasional nudges when air changes.</div>
            </div>
            <Switch checked={notif} onCheckedChange={setNotif} />
          </div>

          <Button
            className="rounded-full"
            disabled={mut.isPending}
            onClick={() =>
              mut.mutate({
                data: {
                  home_latitude: lat ? Number(lat) : null,
                  home_longitude: lng ? Number(lng) : null,
                  home_label: label || null,
                  notifications_enabled: notif,
                },
              })
            }
          >
            {mut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
