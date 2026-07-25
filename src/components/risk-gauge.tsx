import { RISK_LABELS, type RiskCategory } from "@/lib/risk-engine";

/** Circular gauge for the daily risk score with category label + color. */
export function RiskGauge({ score, category }: { score: number; category: RiskCategory }) {
  const size = 180;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = circumference * pct;

  const tokenVar: Record<RiskCategory, string> = {
    low: "var(--risk-low)",
    moderate: "var(--risk-moderate)",
    high: "var(--risk-high)",
    critical: "var(--risk-critical)",
  };
  const color = tokenVar[category];

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="animate-breathe">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-semibold" style={{ color }}>
          {score}
        </div>
        <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          {RISK_LABELS[category]}
        </div>
      </div>
    </div>
  );
}
