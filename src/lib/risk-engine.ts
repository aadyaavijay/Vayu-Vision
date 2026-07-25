/**
 * Vayu Vision — transparent rule-based asthma risk engine.
 *
 * Inputs are all optional; contributions are only counted for signals we have.
 * Output score is 0-100 and comes with a human-readable factor list so users
 * can see exactly why they got a given score. Designed so an ML model can be
 * swapped in later behind the same `computeRisk` interface.
 */

export type RiskCategory = "low" | "moderate" | "high" | "critical";

export interface RiskInputs {
  aqi?: number | null;
  pm25?: number | null;
  humidity?: number | null;
  temperature_c?: number | null;
  pollen?: number | null;
  medication_adherence?: number | null; // 0-1 (fraction of scheduled doses taken)
  peak_flow_pct?: number | null; // % of personal best
  recent_symptom_severity?: number | null; // 0-10, worst of last 24h
  sleep_hours?: number | null;
  exercise_minutes?: number | null;
  outdoor_exposure_hours?: number | null;
}

export interface RiskFactor {
  key: string;
  label: string;
  impact: number; // points added
  detail: string;
  direction: "up" | "down" | "neutral";
}

export interface RiskResult {
  score: number;
  category: RiskCategory;
  factors: RiskFactor[];
  inputs: RiskInputs;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function categorize(score: number): RiskCategory {
  if (score >= 75) return "critical";
  if (score >= 55) return "high";
  if (score >= 30) return "moderate";
  return "low";
}

/**
 * Convert a raw AQI value (US EPA scale) into a 0-30 point contribution.
 * Good (0-50) → 0 pts, Moderate → up to 8, Unhealthy for sensitive → 16,
 * Unhealthy → 22, Very unhealthy → 27, Hazardous → 30.
 */
function scoreAqi(aqi: number): number {
  if (aqi <= 50) return (aqi / 50) * 3;
  if (aqi <= 100) return 3 + ((aqi - 50) / 50) * 5;
  if (aqi <= 150) return 8 + ((aqi - 100) / 50) * 8;
  if (aqi <= 200) return 16 + ((aqi - 150) / 50) * 6;
  if (aqi <= 300) return 22 + ((aqi - 200) / 100) * 5;
  return 30;
}

export function computeRisk(inputs: RiskInputs): RiskResult {
  const factors: RiskFactor[] = [];
  let score = 8; // baseline

  if (inputs.aqi != null) {
    const impact = scoreAqi(inputs.aqi);
    factors.push({
      key: "aqi",
      label: "Air quality",
      impact,
      direction: impact > 5 ? "up" : "neutral",
      detail:
        inputs.aqi <= 50
          ? `AQI ${Math.round(inputs.aqi)} — clean air, minimal impact.`
          : inputs.aqi <= 100
            ? `AQI ${Math.round(inputs.aqi)} — moderate; sensitive groups may notice symptoms.`
            : inputs.aqi <= 150
              ? `AQI ${Math.round(inputs.aqi)} — unhealthy for people with asthma.`
              : `AQI ${Math.round(inputs.aqi)} — unhealthy; limit outdoor exposure.`,
    });
    score += impact;
  }

  if (inputs.humidity != null) {
    // Comfort band 35-55%. Outside adds up to 8 points.
    const dist = inputs.humidity < 35 ? 35 - inputs.humidity : inputs.humidity > 55 ? inputs.humidity - 55 : 0;
    const impact = clamp(dist / 5, 0, 8);
    if (impact > 0) {
      factors.push({
        key: "humidity",
        label: "Humidity",
        impact,
        direction: "up",
        detail:
          inputs.humidity < 35
            ? `Air is dry (${Math.round(inputs.humidity)}%) — can irritate airways.`
            : `Air is humid (${Math.round(inputs.humidity)}%) — can promote allergens and mold.`,
      });
      score += impact;
    }
  }

  if (inputs.temperature_c != null) {
    const t = inputs.temperature_c;
    const impact = t < 5 ? clamp((5 - t) / 3, 0, 6) : t > 30 ? clamp((t - 30) / 3, 0, 5) : 0;
    if (impact > 0) {
      factors.push({
        key: "temperature",
        label: "Temperature",
        impact,
        direction: "up",
        detail:
          t < 5
            ? `Cold air (${Math.round(t)}°C) — a common trigger for exercise-induced asthma.`
            : `High heat (${Math.round(t)}°C) — can worsen airway inflammation.`,
      });
      score += impact;
    }
  }

  if (inputs.pollen != null && inputs.pollen > 0) {
    const impact = clamp(inputs.pollen * 1.5, 0, 8);
    factors.push({
      key: "pollen",
      label: "Pollen",
      impact,
      direction: "up",
      detail: `Pollen index ${inputs.pollen.toFixed(1)} — allergen load in the air.`,
    });
    score += impact;
  }

  if (inputs.medication_adherence != null) {
    const missed = 1 - inputs.medication_adherence;
    const impact = clamp(missed * 15, 0, 15);
    if (missed > 0.1) {
      factors.push({
        key: "medication",
        label: "Medication adherence",
        impact,
        direction: "up",
        detail: `You've taken ${Math.round(inputs.medication_adherence * 100)}% of scheduled doses recently.`,
      });
      score += impact;
    } else {
      factors.push({
        key: "medication",
        label: "Medication adherence",
        impact: -3,
        direction: "down",
        detail: "Great — you're keeping up with your controller schedule.",
      });
      score -= 3;
    }
  }

  if (inputs.peak_flow_pct != null) {
    const pct = inputs.peak_flow_pct;
    const impact = pct < 60 ? 20 : pct < 80 ? 10 : pct < 90 ? 4 : -3;
    factors.push({
      key: "peak_flow",
      label: "Peak flow",
      impact,
      direction: impact > 0 ? "up" : "down",
      detail:
        pct < 60
          ? `Peak flow at ${Math.round(pct)}% of your best — red zone.`
          : pct < 80
            ? `Peak flow at ${Math.round(pct)}% — yellow zone, take extra care.`
            : `Peak flow at ${Math.round(pct)}% — green zone.`,
    });
    score += impact;
  }

  if (inputs.recent_symptom_severity != null) {
    const impact = inputs.recent_symptom_severity * 2;
    if (impact > 0) {
      factors.push({
        key: "symptoms",
        label: "Recent symptoms",
        impact,
        direction: "up",
        detail: `Recent symptom severity ${inputs.recent_symptom_severity}/10.`,
      });
      score += impact;
    }
  }

  if (inputs.sleep_hours != null && inputs.sleep_hours < 7) {
    const impact = clamp((7 - inputs.sleep_hours) * 1.5, 0, 6);
    factors.push({
      key: "sleep",
      label: "Sleep",
      impact,
      direction: "up",
      detail: `Only ${inputs.sleep_hours.toFixed(1)}h of sleep — recovery is limited.`,
    });
    score += impact;
  }

  if (inputs.exercise_minutes != null && inputs.aqi != null && inputs.aqi > 100 && inputs.exercise_minutes > 20) {
    const impact = clamp((inputs.exercise_minutes / 20) * 3, 0, 6);
    factors.push({
      key: "exercise",
      label: "Outdoor exercise",
      impact,
      direction: "up",
      detail: `${Math.round(inputs.exercise_minutes)} min of exercise while AQI is elevated.`,
    });
    score += impact;
  }

  if (inputs.outdoor_exposure_hours != null && inputs.aqi != null && inputs.aqi > 100) {
    const impact = clamp(inputs.outdoor_exposure_hours * 1.5, 0, 8);
    factors.push({
      key: "outdoor",
      label: "Outdoor exposure",
      impact,
      direction: "up",
      detail: `${inputs.outdoor_exposure_hours.toFixed(1)}h outdoors in poor air.`,
    });
    score += impact;
  }

  const finalScore = Math.round(clamp(score, 0, 100));
  factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return {
    score: finalScore,
    category: categorize(finalScore),
    factors,
    inputs,
  };
}

export const RISK_LABELS: Record<RiskCategory, string> = {
  low: "Low risk",
  moderate: "Moderate",
  high: "High risk",
  critical: "Critical",
};

export const RISK_TOKENS: Record<RiskCategory, string> = {
  low: "risk-low",
  moderate: "risk-moderate",
  high: "risk-high",
  critical: "risk-critical",
};
