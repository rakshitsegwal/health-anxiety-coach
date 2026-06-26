"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MetaPixel } from "@/lib/metaPixel";
import { Button } from "@/components/ui/Button";
import {
  type CheckIn,
  TIME_BUCKETS,
  COUNT_FIELDS,
  EMPTY_CHECKIN,
  computeSpiralScore,
} from "@/lib/checkin";

// The evening check-in is the repeated tracker — kept QUIET and secondary. By
// default it's a compact strip showing the moving Spiral Score (Day 0 → latest)
// behind a "Log today's check-in" action. Expanding reveals the 7-field form
// (slider/steppers/buttons, minimal typing). One submit saves the fields +
// score + completes the day, then collapses back to the score summary.
export function CheckInForm({
  day,
  initial,
  initiallyCompleted,
  initialScore,
  baseline,
  latestDay,
  latestScore,
}: {
  day: number;
  initial: CheckIn | null;
  initiallyCompleted: boolean;
  initialScore: number | null;
  baseline: number | null;
  latestDay: number | null;
  latestScore: number | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [c, setC] = useState<CheckIn>(initial ?? EMPTY_CHECKIN);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedScore, setSavedScore] = useState<number | null>(initialScore);
  const [done, setDone] = useState(initiallyCompleted);

  const livePreview = computeSpiralScore(c);
  const set = <K extends keyof CheckIn>(k: K, v: CheckIn[K]) =>
    setC((prev) => ({ ...prev, [k]: v }));

  // Plain-text trajectory: Day 0 baseline → most recent logged score (this day if
  // it's been logged, else the latest prior day).
  const effDay = done ? day : latestDay;
  const effScore = done ? savedScore : latestScore;
  const parts: string[] = [];
  if (baseline != null) parts.push(`Day 0: ${baseline}`);
  if (effScore != null && effDay != null) parts.push(`Day ${effDay}: ${effScore}`);
  const trajectory = parts.join("  →  ");

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, checkin: c }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      if (day === 1) MetaPixel.dayCompleted();
      setSavedScore(typeof data.spiralScore === "number" ? data.spiralScore : livePreview);
      setDone(true);
      setOpen(false); // collapse back to the (now-updated) score summary
      router.refresh();
    } catch {
      setError("Couldn't save just now — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Collapsed: quiet score strip + the action ──────────────────────────────
  if (!open) {
    return (
      <section className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">
              Evening check-in
              {done ? <span className="text-primary-deep"> · logged ✓</span> : null}
            </p>
            {trajectory ? (
              <p className="mt-0.5 truncate text-sm text-ink-soft">
                Spiral Score — {trajectory}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-ink-soft">
                Your Spiral Score appears after your first check-in.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-xl border border-line px-3 py-2 text-sm font-medium text-primary hover:border-primary"
          >
            {done ? "Edit" : "Log today's check-in"}
          </button>
        </div>
      </section>
    );
  }

  // ── Expanded: the 7-field form ─────────────────────────────────────────────
  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-medium text-ink">Tonight&apos;s check-in</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-ink-soft hover:text-ink"
        >
          Hide
        </button>
      </div>

      <div className="space-y-6">
        <Field label="Peak anxiety today" hint="0 = calm · 10 = worst">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={c.peakAnxiety}
              onChange={(e) => set("peakAnxiety", Number(e.target.value))}
              className="h-2 w-full accent-primary"
              aria-label="Peak anxiety 0 to 10"
            />
            <span className="w-8 shrink-0 text-right font-display text-xl text-ink">
              {c.peakAnxiety}
            </span>
          </div>
        </Field>

        <Field label="Time lost to health worry">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {TIME_BUCKETS.map((b) => (
              <button
                key={b.value}
                type="button"
                onClick={() => set("timeLost", b.value)}
                aria-pressed={c.timeLost === b.value}
                className={`rounded-xl border px-2 py-2 text-sm transition-colors ${
                  c.timeLost === b.value
                    ? "border-primary bg-primary/10 text-ink"
                    : "border-line bg-surface text-ink-soft hover:border-primary"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </Field>

        {COUNT_FIELDS.map((f) => (
          <Field key={f.key} label={f.label}>
            <Stepper value={c[f.key]} onChange={(n) => set(f.key, n)} />
          </Field>
        ))}

        <Field label="Did health fear make you avoid anything today?">
          <div className="flex gap-2">
            {[
              { v: false, l: "No" },
              { v: true, l: "Yes" },
            ].map((opt) => (
              <button
                key={opt.l}
                type="button"
                onClick={() => set("avoided", opt.v)}
                aria-pressed={c.avoided === opt.v}
                className={`flex-1 rounded-xl border px-4 py-2 text-sm transition-colors ${
                  c.avoided === opt.v
                    ? "border-primary bg-primary/10 text-ink"
                    : "border-line bg-surface text-ink-soft hover:border-primary"
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>
          {c.avoided ? (
            <input
              type="text"
              value={c.avoidedWhat}
              onChange={(e) => set("avoidedWhat", e.target.value)}
              placeholder="What did you avoid? (optional)"
              className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          ) : null}
        </Field>

        <div className="rounded-2xl border border-line bg-bg p-4 text-center">
          <p className="text-sm text-ink-soft">Today&apos;s Spiral Score</p>
          <p className="font-display text-3xl text-primary-deep">{livePreview}</p>
          <p className="mt-1 text-xs text-ink-soft">
            Lower is better — resisting urges brings it down even on a hard day.
          </p>
        </div>

        <Button onClick={submit} size="lg" disabled={submitting}>
          {submitting ? "Saving…" : done ? "Update check-in" : "Save check-in & complete day"}
        </Button>
        {error ? <p className="text-sm text-warn">{error}</p> : null}
      </div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-ink">{label}</span>
        {hint ? <span className="text-xs text-ink-soft">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const step = (d: number) => onChange(Math.max(0, value + d));
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => step(-1)}
        aria-label="decrease"
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface text-xl text-ink hover:border-primary disabled:opacity-40"
        disabled={value === 0}
      >
        −
      </button>
      <span className="w-10 text-center font-display text-2xl text-ink tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label="increase"
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface text-xl text-ink hover:border-primary"
      >
        +
      </button>
    </div>
  );
}
