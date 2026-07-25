import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Wind, Loader2 } from "lucide-react";
import { BrandMark } from "./index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Vayu Vision" },
      { name: "description", content: "Sign in to Vayu Vision to access your respiratory dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const location = useRouterState({ select: (s) => s.location });
  const search = new URLSearchParams(location.search);
  const redirectTo = search.get("redirect") || "/dashboard";

  useEffect(() => {
    // If already signed in, bounce to dashboard.
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: redirectTo, replace: true });
    });
  }, [navigate, redirectTo]);

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="pointer-events-none absolute inset-0 gradient-hero opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full blur-3xl animate-airflow"
        style={{ background: "radial-gradient(circle, oklch(0.72 0.14 190 / 0.35), transparent 70%)" }}
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-primary-foreground">
          <BrandMark className="h-11 w-11" />
          <h1 className="mt-4 font-serif text-3xl text-white">Welcome to Vayu Vision</h1>
          <p className="mt-1 text-sm text-white/70">Sign in to open your respiratory dashboard</p>
        </div>
        <div className="glass rounded-3xl p-6 shadow-glow">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="mb-5 grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <EmailForm mode="signin" redirectTo={redirectTo} />
            </TabsContent>
            <TabsContent value="signup">
              <EmailForm mode="signup" redirectTo={redirectTo} />
            </TabsContent>
          </Tabs>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>
          <GoogleButton redirectTo={redirectTo} />
        </div>
        <p className="mt-6 text-center text-xs text-white/60">
          By continuing you agree to Vayu Vision's terms and privacy notice.
        </p>
      </div>
    </div>
  );
}

function EmailForm({ mode, redirectTo }: { mode: "signin" | "signup"; redirectTo: string }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + redirectTo },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        navigate({ to: redirectTo, replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
        />
      </div>
      <Button type="submit" className="w-full rounded-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {mode === "signup" ? "Create account" : "Sign in"}
      </Button>
    </form>
  );
}

function GoogleButton({ redirectTo }: { redirectTo: string }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  async function onGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth",
    });
    if (result.error) {
      toast.error(result.error.message ?? "Google sign-in failed");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    toast.success("Signed in with Google");
    navigate({ to: redirectTo, replace: true });
  }
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full rounded-full"
      onClick={onGoogle}
      disabled={loading}
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wind className="mr-2 h-4 w-4" />}
      Continue with Google
    </Button>
  );
}
