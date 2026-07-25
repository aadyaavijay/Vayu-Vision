import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/ui-bits";
import { RiskGauge } from "@/components/risk-gauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { computeRisk } from "@/lib/risk-engine";

export const Route = createFileRoute("/_authenticated/what-if")({
  head: () => ({
    meta: [
      { title: "What-if Lab — Vayu Vision" },
      { name: "description", content: "Simulate your asthma risk under different conditions." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WhatIfPage,
});

function WhatIfPage() {
  const [aqi, setAqi] = useState(60);
  const [humidity, setHumidity] = useState(45);
  const [temp, setTemp] = useState(22);
  const [adherence, setAdherence] = useState(0.9);
  const [sleep, setSleep] = useState(7);
  const [outdoor, setOutdoor] = useState(1);

  const risk = computeRisk({
    aqi,
    humidity,
    temperature_c: temp,
    medication_adherence: adherence,
    sleep_hours: sleep,
    outdoor_exposure_hours: outdoor,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="What-if Lab™"
        subtitle="Move the dials, see the day. Powered by the same transparent risk engine."
      />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="shadow-soft lg:col-span-3">
          <CardHeader>
            <CardTitle>Scenario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SliderRow label="AQI" value={aqi} min={0} max={300} step={1} onChange={setAqi} suffix="" />
            <SliderRow label="Humidity" value={humidity} min={0} max={100} step={1} onChange={setHumidity} suffix="%" />
            <SliderRow label="Temperature" value={temp} min={-10} max={45} step={1} onChange={setTemp} suffix="°C" />
            <SliderRow
              label="Medication adherence"
              value={Math.round(adherence * 100)}
              min={0}
              max={100}
              step={5}
              onChange={(v) => setAdherence(v / 100)}
              suffix="%"
            />
            <SliderRow label="Sleep" value={sleep} min={0} max={12} step={0.5} onChange={setSleep} suffix="h" />
            <SliderRow label="Outdoor exposure" value={outdoor} min={0} max={10} step={0.5} onChange={setOutdoor} suffix="h" />
          </CardContent>
        </Card>
        <Card className="shadow-soft lg:col-span-2">
          <CardHeader>
            <CardTitle>Projected risk</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <RiskGauge score={risk.score} category={risk.category} />
            <ul className="mt-6 w-full space-y-2 text-sm">
              {risk.factors.slice(0, 5).map((f) => (
                <li key={f.key} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background/50 px-3 py-2">
                  <span className="min-w-0 text-muted-foreground">{f.label}</span>
                  <span className="shrink-0 font-medium">
                    {f.impact > 0 ? "+" : ""}
                    {f.impact.toFixed(1)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix: string;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <Label>{label}</Label>
        <span className="font-semibold">
          {value}
          {suffix}
        </span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} />
    </div>
  );
}
