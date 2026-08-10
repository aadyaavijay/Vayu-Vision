import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { computeRisk, type RiskResult } from "./risk-engine";

export type DashboardData = {
  profile: {
    display_name: string | null;
    onboarded: boolean;
    known_triggers: string[];
    asthma_severity: string | null;
  };
  settings: {
    home_latitude: number | null;
    home_longitude: number | null;
    home_label: string | null;
  };
  latestEnv: {
    aqi: number | null;
    pm25: number | null;
    temperature_c: number | null;
    humidity: number | null;
    weather_summary: string | null;
    captured_at: string;
  } | null;
  recentSymptoms: Array<{ id: string; severity: number; logged_at: string; suspected_trigger: string | null }>;
  recentMeds: Array<{ id: string; medication_name: string; medication_type: string | null; taken_at: string }>;
  recentPeakFlow: Array<{ id: string; value_lpm: number; logged_at: string }>;
  risk: RiskResult;
  weeklySymptoms: Array<{ date: string; avg: number }>;
};

export const getDashboardData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DashboardData> => {
    const { supabase, userId } = context;

    const [profileRes, settingsRes, envRes, symptomsRes, medsRes, pfRes] = await Promise.all([
      supabase.from("profiles").select("display_name, onboarded, known_triggers, asthma_severity").eq("id", userId).maybeSingle(),
      supabase.from("user_settings").select("home_latitude, home_longitude, home_label").eq("user_id", userId).maybeSingle(),
      supabase.from("environment_snapshots").select("aqi, pm25, temperature_c, humidity, weather_summary, captured_at").eq("user_id", userId).order("captured_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("symptom_logs").select("id, severity, logged_at, suspected_trigger, cough, wheeze, breathlessness, chest_tightness").eq("user_id", userId).order("logged_at", { ascending: false }).limit(30),
      supabase.from("medication_logs").select("id, medication_name, medication_type, taken_at").eq("user_id", userId).order("taken_at", { ascending: false }).limit(10),
      supabase.from("peakflow_logs").select("id, value_lpm, personal_best, logged_at").eq("user_id", userId).order("logged_at", { ascending: false }).limit(10),
    ]);

    // A failed read is NOT an empty dataset: surface it instead of scoring on partial data.
    const failures = (
      [
        ["profile", profileRes.error],
        ["settings", settingsRes.error],
        ["environment", envRes.error],
        ["symptoms", symptomsRes.error],
        ["medications", medsRes.error],
        ["peak flow", pfRes.error],
      ] as const
    ).filter(([, e]) => e);

    if (failures.length > 0) {
      throw new Error(
        `DB_READ_FAILED: could not load ${failures.map(([n]) => n).join(", ")} — ${failures[0]![1]!.message}`,
      );
    }

    const symptoms = symptomsRes.data ?? [];
    const meds = medsRes.data ?? [];
    const pf = pfRes.data ?? [];


    // Medication adherence proxy: doses in past 3 days / expected 6.
    const threeDaysAgo = Date.now() - 3 * 24 * 3600 * 1000;
    const recentMeds = meds.filter((m) => new Date(m.taken_at).getTime() > threeDaysAgo).length;
    const adherence = Math.min(1, recentMeds / 6);

    const latestPf = pf[0];
    const peakFlowPct = latestPf?.personal_best
      ? (latestPf.value_lpm / latestPf.personal_best) * 100
      : null;

    // Worst symptom in last 24h.
    const dayAgo = Date.now() - 24 * 3600 * 1000;
    const recent24 = symptoms.filter((s) => new Date(s.logged_at).getTime() > dayAgo);
    const worst = recent24.reduce((m, s) => Math.max(m, s.severity), 0);

    const risk = computeRisk({
      aqi: envRes.data?.aqi ?? null,
      humidity: envRes.data?.humidity ?? null,
      temperature_c: envRes.data?.temperature_c ?? null,
      medication_adherence: adherence,
      peak_flow_pct: peakFlowPct,
      recent_symptom_severity: worst,
    });

    // Persist prediction (best-effort).
    await supabase.from("risk_predictions").insert({
      user_id: userId,
      score: risk.score,
      category: risk.category,
      factors: risk.factors as unknown as never,
      inputs: risk.inputs as unknown as never,
    });

    // Weekly symptom aggregate.
    const weekBuckets = new Map<string, { total: number; count: number }>();
    const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
    for (const s of symptoms) {
      const t = new Date(s.logged_at).getTime();
      if (t < sevenDaysAgo) continue;
      const day = new Date(s.logged_at).toISOString().slice(0, 10);
      const cur = weekBuckets.get(day) ?? { total: 0, count: 0 };
      cur.total += s.severity;
      cur.count += 1;
      weekBuckets.set(day, cur);
    }
    const weeklySymptoms: DashboardData["weeklySymptoms"] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 3600 * 1000).toISOString().slice(0, 10);
      const bucket = weekBuckets.get(d);
      weeklySymptoms.push({ date: d, avg: bucket ? bucket.total / bucket.count : 0 });
    }

    return {
      profile: {
        display_name: profileRes.data?.display_name ?? null,
        onboarded: profileRes.data?.onboarded ?? false,
        known_triggers: profileRes.data?.known_triggers ?? [],
        asthma_severity: profileRes.data?.asthma_severity ?? null,
      },
      settings: {
        home_latitude: settingsRes.data?.home_latitude ?? null,
        home_longitude: settingsRes.data?.home_longitude ?? null,
        home_label: settingsRes.data?.home_label ?? null,
      },
      latestEnv: envRes.data
        ? {
            aqi: envRes.data.aqi,
            pm25: envRes.data.pm25,
            temperature_c: envRes.data.temperature_c,
            humidity: envRes.data.humidity,
            weather_summary: envRes.data.weather_summary,
            captured_at: envRes.data.captured_at,
          }
        : null,
      recentSymptoms: symptoms.slice(0, 5).map((s) => ({
        id: s.id,
        severity: s.severity,
        logged_at: s.logged_at,
        suspected_trigger: s.suspected_trigger,
      })),
      recentMeds: meds.slice(0, 5),
      recentPeakFlow: pf.slice(0, 5).map((p) => ({ id: p.id, value_lpm: p.value_lpm, logged_at: p.logged_at })),
      risk,
      weeklySymptoms,
    };
  });
