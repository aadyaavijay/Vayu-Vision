import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Suspense, useState } from "react";
import { logSymptom, listSymptoms } from "@/lib/logs.functions";
import { PageHeader, EmptyState, DataErrorState } from "@/components/ui-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/symptoms")({
  head: () => ({
    meta: [
      { title: "Symptoms — Vayu Vision" },
      { name: "description", content: "Log respiratory symptoms and see recent history." },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(symptomsQ()),
  errorComponent: () => (
    <div className="py-6">
      <DataErrorState onRetry={() => window.location.reload()} />
    </div>
  ),
  component: SymptomsPage,
});

const symptomsQ = () => queryOptions({ queryKey: ["symptoms"], queryFn: () => listSymptoms() });

function SymptomsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Symptom logger" subtitle="Small, honest signals build a clear picture." />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <SymptomForm />
        </div>
        <div className="lg:col-span-3">
          <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
            <RecentSymptoms />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function SymptomForm() {
  const [severity, setSeverity] = useState(3);
  const [flags, setFlags] = useState({ cough: false, wheeze: false, breathlessness: false, chest_tightness: false });
  const [trigger, setTrigger] = useState("");
  const [notes, setNotes] = useState("");
  const submitFn = useServerFn(logSymptom);
  const queryClient = useQueryClient();
  const mut = useMutation({
    mutationFn: submitFn,
    onSuccess: () => {
      toast.success("Symptom logged");
      setSeverity(3);
      setFlags({ cough: false, wheeze: false, breathlessness: false, chest_tightness: false });
      setTrigger("");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["symptoms"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>New entry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <Label>Severity</Label>
            <span className="font-semibold">{severity}/10</span>
          </div>
          <Slider value={[severity]} min={0} max={10} step={1} onValueChange={(v) => setSeverity(v[0])} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(["cough", "wheeze", "breathlessness", "chest_tightness"] as const).map((k) => (
            <label key={k} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm">
              <Checkbox
                checked={flags[k]}
                onCheckedChange={(v) => setFlags((f) => ({ ...f, [k]: !!v }))}
              />
              {k.replace("_", " ")}
            </label>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="trigger">Suspected trigger</Label>
          <Input id="trigger" value={trigger} onChange={(e) => setTrigger(e.target.value)} placeholder="pollen, cold air, exercise…" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={500} />
        </div>
        <Button
          className="w-full rounded-full"
          disabled={mut.isPending}
          onClick={() =>
            mut.mutate({
              data: {
                severity,
                ...flags,
                suspected_trigger: trigger || null,
                notes: notes || null,
              },
            })
          }
        >
          {mut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save entry
        </Button>
      </CardContent>
    </Card>
  );
}

function RecentSymptoms() {
  const { data } = useSuspenseQuery(symptomsQ());
  if (data.length === 0)
    return <EmptyState title="No symptoms logged yet" description="Your entries will appear here as a running timeline." />;
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Recent entries</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {data.slice(0, 25).map((s) => (
            <li key={s.id} className="flex items-start justify-between gap-3 py-3 text-sm">
              <div className="min-w-0">
                <div className="font-medium">Severity {s.severity}/10</div>
                <div className="mt-0.5 flex flex-wrap gap-1.5">
                  {[
                    s.cough && "cough",
                    s.wheeze && "wheeze",
                    s.breathlessness && "breathlessness",
                    s.chest_tightness && "chest tightness",
                  ]
                    .filter(Boolean)
                    .map((tag) => (
                      <span key={String(tag)} className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                        {tag}
                      </span>
                    ))}
                </div>
                {s.suspected_trigger && (
                  <div className="mt-1 text-xs text-muted-foreground">Trigger: {s.suspected_trigger}</div>
                )}
                {s.notes && <div className="mt-1 text-xs text-muted-foreground">{s.notes}</div>}
              </div>
              <div className="shrink-0 text-xs text-muted-foreground">
                {new Date(s.logged_at).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
