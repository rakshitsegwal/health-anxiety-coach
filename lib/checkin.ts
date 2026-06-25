// The evening Daily Check-In + Spiral Score. Pure (client + server safe). The
// score formula is verbatim from docs PROGRAM-14DAY.md:
//   Compulsions = (Googles + Reassurance + Body-checks) × 4   (cap 40)
//   Distress    = Peak anxiety (0–10) × 3                      (0–30)
//   Time lost   = none:0 | <15m:5 | 15–60m:10 | 1–3h:15 | >3h:20
//   Avoidance   = no:0 | yes:10
//   RAW         = sum of the above                             (0–100)
//   Resilience  = (Urges resisted × 2, cap 20) + (5 if today's exercise done)
//   SPIRAL SCORE = RAW − Resilience    (floor 0, lower is better)

export type TimeBucket = "none" | "lt15" | "15to60" | "1to3h" | "gt3h";

export interface CheckIn {
  peakAnxiety: number; // 0–10
  timeLost: TimeBucket;
  googles: number;
  reassurance: number;
  bodyChecks: number;
  urgesResisted: number;
  avoided: boolean;
  avoidedWhat: string;
}

export const TIME_BUCKETS: { value: TimeBucket; label: string; points: number }[] = [
  { value: "none", label: "Almost none", points: 0 },
  { value: "lt15", label: "Under 15 min", points: 5 },
  { value: "15to60", label: "15–60 min", points: 10 },
  { value: "1to3h", label: "1–3 hours", points: 15 },
  { value: "gt3h", label: "Over 3 hours", points: 20 },
];

export const COUNT_FIELDS = [
  { key: "googles", label: "Symptom-Google episodes" },
  { key: "reassurance", label: "Reassurance requests" },
  { key: "bodyChecks", label: "Body-checking episodes" },
  { key: "urgesResisted", label: "Urges you noticed and resisted" },
] as const;

export const EMPTY_CHECKIN: CheckIn = {
  peakAnxiety: 0,
  timeLost: "none",
  googles: 0,
  reassurance: 0,
  bodyChecks: 0,
  urgesResisted: 0,
  avoided: false,
  avoidedWhat: "",
};

// Validate/clamp untrusted input into a CheckIn. Returns null only if the shape
// is unusable; otherwise coerces to safe values (so the score can't be gamed).
export function sanitizeCheckIn(input: unknown): CheckIn | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  const clamp = (v: unknown, max: number) => {
    const n = typeof v === "number" ? Math.floor(v) : NaN;
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.min(n, max);
  };
  const timeLost = TIME_BUCKETS.find((b) => b.value === o.timeLost)?.value ?? "none";
  return {
    peakAnxiety: clamp(o.peakAnxiety, 10),
    timeLost,
    googles: clamp(o.googles, 999),
    reassurance: clamp(o.reassurance, 999),
    bodyChecks: clamp(o.bodyChecks, 999),
    urgesResisted: clamp(o.urgesResisted, 999),
    avoided: o.avoided === true,
    avoidedWhat: typeof o.avoidedWhat === "string" ? o.avoidedWhat.slice(0, 500) : "",
  };
}

// exerciseDone defaults true: the check-in is submitted together with marking the
// day complete, so the day's exercise is done (+5 resilience).
export function computeSpiralScore(c: CheckIn, exerciseDone = true): number {
  const compulsions = Math.min((c.googles + c.reassurance + c.bodyChecks) * 4, 40);
  const distress = c.peakAnxiety * 3; // 0–30
  const timeLost = TIME_BUCKETS.find((b) => b.value === c.timeLost)?.points ?? 0;
  const avoidance = c.avoided ? 10 : 0;
  const raw = compulsions + distress + timeLost + avoidance;
  const resilience = Math.min(c.urgesResisted * 2, 20) + (exerciseDone ? 5 : 0);
  return Math.max(0, raw - resilience);
}
