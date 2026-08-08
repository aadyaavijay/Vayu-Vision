import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Wind,
  Activity,
  LineChart,
  Sparkles,
  ShieldCheck,
  Cloud,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vayu Vision — Breathe Smarter. Live Better." },
      {
        name: "description",
        content:
          "Personalized respiratory intelligence for people with asthma. Live AQI, symptom tracking, and a transparent risk score you can actually understand.",
      },
      { property: "og:title", content: "Vayu Vision — Breathe Smarter. Live Better." },
      {
        property: "og:description",
        content:
          "Live air quality, symptom insights, and an explainable asthma risk engine — in one calm, beautiful interface.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <Hero />
      <FeatureGrid />
      <ArchitecturePreview />
      <CTASection />
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark className="h-8 w-8" />
          <span className="text-lg font-semibold tracking-tight">Vayu Vision</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          <a href="#architecture" className="transition-colors hover:text-foreground">Architecture</a>
          <a href="#cta" className="transition-colors hover:text-foreground">Get started</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full">
            <Link to="/auth">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 gradient-hero opacity-90" />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-20 -z-10 h-[520px] w-[520px] rounded-full blur-3xl animate-airflow"
        style={{ background: "radial-gradient(circle, oklch(0.72 0.14 190 / 0.35), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-[420px] w-[420px] rounded-full blur-3xl animate-airflow"
        style={{
          background: "radial-gradient(circle, oklch(0.72 0.16 160 / 0.3), transparent 70%)",
          animationDelay: "-4s",
        }}
      />
      <div className="mx-auto max-w-7xl px-6 pb-28 pt-24 md:pt-32">
        <div className="mx-auto max-w-3xl text-center text-primary-foreground">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white/80 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Personalized respiratory intelligence
          </div>
          <h1 className="mt-6 text-balance font-serif text-5xl leading-[1.05] text-white md:text-7xl">
            Breathe Smarter. <span className="italic text-teal">Live Better.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/70">
            Vayu Vision turns live air quality, your symptoms, medication and peak flow into a single,
            explainable risk score — so you always know when to slow down, pre-medicate, or step outside.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-full text-base shadow-glow">
              <Link to="/auth">
                Get started <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/20 bg-white/5 text-base text-white hover:bg-white/10 hover:text-white"
            >
              <a href="#features">See live demo</a>
            </Button>
          </div>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto mt-16 max-w-5xl">
      <div className="glass rounded-3xl p-2 shadow-glow">
        <div className="rounded-[1.35rem] bg-card/70 p-6 backdrop-blur-md">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              icon={<Wind className="h-4 w-4" />}
              label="Air quality"
              value="AQI 62"
              tone="risk-moderate"
              hint="Moderate — sensitive groups take care"
            />
            <StatCard
              icon={<Activity className="h-4 w-4" />}
              label="Today's risk"
              value="34"
              tone="risk-low"
              hint="Low — good day for outdoor walks"
            />
            <StatCard
              icon={<Cloud className="h-4 w-4" />}
              label="Humidity"
              value="47%"
              tone="teal"
              hint="Comfortable band"
            />
          </div>
          <div className="mt-4 rounded-2xl border border-border/70 bg-background/50 p-4 text-sm text-muted-foreground">
            <span className="mr-2 inline-flex items-center rounded-full bg-emerald/15 px-2 py-0.5 text-xs font-medium text-emerald">
              Air Story
            </span>
            "The air feels clean this morning — a good window to run errands before the pollen count peaks around 4 PM."
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "risk-low" | "risk-moderate" | "risk-high" | "risk-critical" | "teal";
  hint: string;
}) {
  const toneClass: Record<string, string> = {
    "risk-low": "text-risk-low",
    "risk-moderate": "text-risk-moderate",
    "risk-high": "text-risk-high",
    "risk-critical": "text-risk-critical",
    teal: "text-teal",
  };
  return (
    <div className="rounded-2xl border border-border/70 bg-background/60 p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={`mt-2 text-3xl font-semibold ${toneClass[tone]}`}>{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

const features = [
  {
    icon: <Activity className="h-5 w-5" />,
    title: "Explainable risk engine",
    body:
      "A transparent 0–100 score built from AQI, humidity, symptoms, peak flow and medication — every factor shown, nothing hidden.",
  },
  {
    icon: <Wind className="h-5 w-5" />,
    title: "Live air & weather",
    body:
      "Real-time AQI, PM2.5, pollen and humidity for your location — pulled continuously from Open-Meteo.",
  },
  {
    icon: <LineChart className="h-5 w-5" />,
    title: "Symptom & medication tracking",
    body:
      "Log symptoms, controller doses and peak flow in seconds. Weekly and monthly trends surface patterns.",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Vayu Yatra trigger profile",
    body:
      "A personalized radar of what actually sets off your symptoms: pollen, cold air, exercise, sleep debt and more.",
  },
  {
    icon: <Cloud className="h-5 w-5" />,
    title: "Air Story daily brief",
    body:
      "A warm, natural-language summary of your day — supportive, informative, never diagnostic.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Private by design",
    body:
      "Row-level security, encrypted storage, and no third-party analytics on your health data.",
  },
];

function FeatureGrid() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-teal">Features</p>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl">Everything you need to breathe easier.</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Vayu Vision quietly does the work in the background so you can focus on your day.
        </p>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-teal/40"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal/15 text-teal">
              {f.icon}
            </div>
            <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ArchitecturePreview() {
  return (
    <section id="architecture" className="border-y border-border/60 bg-secondary/50">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-teal">Under the hood</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">Built for reliability, designed for trust.</h2>
          <p className="mt-4 text-muted-foreground">
            A modern full-stack architecture: TanStack Start with typed server functions, PostgreSQL with
            row-level security, and a rule-based risk engine that's easy to reason about and easy to swap for
            ML later.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "PostgreSQL with row-level security on every table",
              "Typed server RPCs — no leaky client secrets",
              "Open-Meteo for live AQI, weather and pollen",
              "Explainable rule engine, ML-ready interface",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="glass rounded-3xl p-6 shadow-soft">
          <pre className="overflow-x-auto rounded-2xl bg-background/70 p-5 text-xs leading-relaxed text-muted-foreground">
{`Browser
  ↓ typed RPC (Zod-validated)
TanStack server functions
  ↓ Supabase JS w/ user JWT
PostgreSQL (RLS)
  ↑
Open-Meteo AQI + weather
  ↑
Rule-based risk engine ⇢ ML-ready`}
          </pre>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section id="cta" className="mx-auto max-w-7xl px-6 py-24">
      <div className="relative overflow-hidden rounded-3xl gradient-brand p-10 text-center shadow-glow md:p-16">
        <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white blur-3xl" />
        </div>
        <h2 className="relative font-serif text-4xl text-primary-foreground md:text-5xl">
          Your lungs deserve a better dashboard.
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-primary-foreground/80">
          Start tracking in under a minute. Free to try, private by default.
        </p>
        <div className="relative mt-8 flex justify-center">
          <Button asChild size="lg" variant="secondary" className="rounded-full text-base">
            <Link to="/auth">
              Create your account <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <div className="flex items-center gap-2.5">
          <BrandMark className="h-6 w-6" />
          <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} Vayu Vision</span>
        </div>
        <p className="max-w-lg text-center text-xs text-muted-foreground md:text-right">
          Vayu Vision is a wellness tool. It does not provide medical diagnosis. Always follow your
          clinician's advice.
        </p>
      </div>
    </footer>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl gradient-brand ${className ?? ""}`}
    >
      <Wind className="h-4 w-4 text-white" strokeWidth={2.5} />
    </div>
  );
}
