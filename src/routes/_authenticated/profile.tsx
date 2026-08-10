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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateProfile } from "@/lib/logs.functions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Vayu Vision" },
      { name: "description", content: "Manage your health profile." },
      { name: "robots", content: "noindex" },
    ],
  }),
  errorComponent: () => (
    <div className="py-6">
      <DataErrorState onRetry={() => window.location.reload()} />
    </div>
  ),
  component: ProfilePage,
});

function ProfilePage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [severity, setSeverity] = useState<"mild" | "moderate" | "severe">("mild");
  const [triggers, setTriggers] = useState("");
  const [loaded, setLoaded] = useState(false);

  const fn = useServerFn(updateProfile);
  const mut = useMutation({
    mutationFn: fn,
    onSuccess: () => toast.success("Profile updated"),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      setEmail(userData.user?.email ?? "");
      if (userData.user) {
        const { data: p } = await supabase
          .from("profiles")
          .select("display_name, age, asthma_severity, known_triggers")
          .eq("id", userData.user.id)
          .maybeSingle();
        if (p) {
          setName(p.display_name ?? "");
          setAge(p.age?.toString() ?? "");
          setSeverity((p.asthma_severity as typeof severity) ?? "mild");
          setTriggers((p.known_triggers ?? []).join(", "));
        }
      }
      setLoaded(true);
    })();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader title="Your profile" subtitle="Tune Vayu Vision to your body." />
      <Card className="max-w-2xl shadow-soft">
        <CardHeader>
          <CardTitle>Health profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={email} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" min={0} max={120} value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Asthma severity</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as typeof severity)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="trig">Known triggers (comma-separated)</Label>
            <Input
              id="trig"
              value={triggers}
              onChange={(e) => setTriggers(e.target.value)}
              placeholder="pollen, dust mites, cold air"
            />
          </div>
          <Button
            className="rounded-full"
            disabled={!loaded || mut.isPending}
            onClick={() =>
              mut.mutate({
                data: {
                  display_name: name.trim() || undefined,
                  age: age ? Number(age) : null,
                  asthma_severity: severity,
                  known_triggers: triggers
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .slice(0, 20),
                  onboarded: true,
                },
              })
            }
          >
            {mut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
