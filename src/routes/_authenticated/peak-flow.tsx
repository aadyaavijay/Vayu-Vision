import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Suspense, useState } from "react";
import { logPeakFlow, listPeakFlow } from "@/lib/logs.functions";
import { PageHeader, EmptyState } from "@/components/ui-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/peak-flow")({
  head: () => ({
    meta: [
      { title: "Peak flow — Vayu Vision" },
      { name: "description", content: "Track peak expiratory flow over time." },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(pfQ()),
  component: PFPage,
});
const pfQ = () => queryOptions({ queryKey: ["peakflow"], queryFn: () => listPeakFlow() });

function PFPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Peak flow" subtitle="Your lungs, measured — one gentle blow at a time." />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <PFForm />
        </div>
        <div className="lg:col-span-3">
          <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
            <PFHistory />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function PFForm() {
  const [value, setValue] = useState(400);
  const [best, setBest] = useState("");
  const [tod, setTod] = useState<"morning" | "afternoon" | "evening" | "night">("morning");
  const fn = useServerFn(logPeakFlow);
  const queryClient = useQueryClient();
  const mut = useMutation({
    mutationFn: fn,
    onSuccess: () => {
      toast.success("Peak flow saved");
      queryClient.invalidateQueries({ queryKey: ["peakflow"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>New reading</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="v">Peak flow (L/min)</Label>
          <Input id="v" type="number" min={1} max={1199} value={value} onChange={(e) => setValue(Number(e.target.value))} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="b">Personal best (optional)</Label>
          <Input id="b" type="number" min={1} max={1199} value={best} onChange={(e) => setBest(e.target.value)} placeholder="e.g. 550" />
        </div>
        <div className="space-y-1.5">
          <Label>Time of day</Label>
          <Select value={tod} onValueChange={(v) => setTod(v as typeof tod)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Morning</SelectItem>
              <SelectItem value="afternoon">Afternoon</SelectItem>
              <SelectItem value="evening">Evening</SelectItem>
              <SelectItem value="night">Night</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          className="w-full rounded-full"
          disabled={mut.isPending}
          onClick={() =>
            mut.mutate({
              data: {
                value_lpm: value,
                personal_best: best ? Number(best) : null,
                time_of_day: tod,
              },
            })
          }
        >
          {mut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save reading
        </Button>
      </CardContent>
    </Card>
  );
}

function PFHistory() {
  const { data } = useSuspenseQuery(pfQ());
  if (data.length === 0)
    return <EmptyState title="No readings yet" description="A daily reading is enough to spot patterns." />;
  const chart = [...data]
    .slice(0, 30)
    .reverse()
    .map((p) => ({ t: new Date(p.logged_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }), value: p.value_lpm }));
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="t" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
              />
              <Line type="monotone" dataKey="value" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
