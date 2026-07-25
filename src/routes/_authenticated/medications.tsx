import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Suspense, useState } from "react";
import { logMedication, listMedications } from "@/lib/logs.functions";
import { PageHeader, EmptyState } from "@/components/ui-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/medications")({
  head: () => ({
    meta: [
      { title: "Medications — Vayu Vision" },
      { name: "description", content: "Track inhaler and controller doses." },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(medsQ()),
  component: MedsPage,
});
const medsQ = () => queryOptions({ queryKey: ["medications"], queryFn: () => listMedications() });

function MedsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Medication tracker" subtitle="Consistency is the quiet superpower." />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <MedForm />
        </div>
        <div className="lg:col-span-3">
          <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
            <MedList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function MedForm() {
  const [name, setName] = useState("");
  const [type, setType] = useState<"rescue_inhaler" | "controller_inhaler" | "oral" | "nebulizer" | "other">("controller_inhaler");
  const [dose, setDose] = useState("");
  const fn = useServerFn(logMedication);
  const queryClient = useQueryClient();
  const mut = useMutation({
    mutationFn: fn,
    onSuccess: () => {
      toast.success("Dose logged");
      setName("");
      setDose("");
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Log a dose</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="medname">Medication</Label>
          <Input id="medname" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ventolin, Symbicort" />
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="rescue_inhaler">Rescue inhaler</SelectItem>
              <SelectItem value="controller_inhaler">Controller inhaler</SelectItem>
              <SelectItem value="oral">Oral</SelectItem>
              <SelectItem value="nebulizer">Nebulizer</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dose">Dose</Label>
          <Input id="dose" value={dose} onChange={(e) => setDose(e.target.value)} placeholder="e.g. 2 puffs" />
        </div>
        <Button
          className="w-full rounded-full"
          disabled={mut.isPending || !name.trim()}
          onClick={() =>
            mut.mutate({
              data: {
                medication_name: name.trim(),
                medication_type: type,
                dose: dose || null,
              },
            })
          }
        >
          {mut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save dose
        </Button>
      </CardContent>
    </Card>
  );
}

function MedList() {
  const { data } = useSuspenseQuery(medsQ());
  if (data.length === 0)
    return <EmptyState title="No doses yet" description="Log your inhaler and controller doses to power adherence tracking." />;
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Recent doses</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {data.slice(0, 30).map((m) => (
            <li key={m.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <div className="font-medium">{m.medication_name}</div>
                <div className="text-xs text-muted-foreground">
                  {m.medication_type?.replace("_", " ")} {m.dose ? `· ${m.dose}` : ""}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(m.taken_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
