import type { Band } from "@/lib/assessment/scoring";
import { BAND_LABEL } from "@/lib/assessment/scoring";

// A calm semicircular gauge. Intentionally a single hopeful teal — no red "danger"
// zone — because a high score must read as "this is the pattern we break," not fear.
export function ScoreGauge({ score, band }: { score: number; band: Band }) {
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <div className="mx-auto w-full max-w-[280px] text-center">
      <svg viewBox="0 0 200 116" className="w-full" role="img" aria-label={`Spiral Score ${clamped} out of 100`}>
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="var(--line)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="14"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${clamped} 100`}
        />
        <text x="100" y="86" textAnchor="middle" className="fill-ink" style={{ fontSize: 40, fontFamily: "var(--font-display)" }}>
          {clamped}
        </text>
        <text x="100" y="104" textAnchor="middle" className="fill-ink-soft" style={{ fontSize: 11 }}>
          / 100
        </text>
      </svg>
      <p className="-mt-1 font-display text-lg text-primary-deep">{BAND_LABEL[band]}</p>
    </div>
  );
}
