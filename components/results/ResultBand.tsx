import type { Band } from "@/lib/assessment/scoring";

// Verbatim band copy from the deck §4 ("42-day" adapted to "14-day"). Hopeful,
// validating, never fear — a high score reads as "this is the pattern we break."
const BAND_COPY: Record<Band, string> = {
  occasional:
    "Your loop is real but intermittent — you catch yourself searching or checking, but it hasn't taken over. This is the best possible time to retrain it, before it grooves deeper. The 14-day reset gives you the tools to catch it and cut the checking early.",
  active:
    "The loop runs regularly, and it's quietly costing you — time, sleep, and mental energy that should be going elsewhere. The good news: a regular pattern is a predictable pattern, which means it responds well to a structured method. You'll learn to interrupt it, day by day, and watch this number drop.",
  strong:
    "Your loop is well-grooved — it's shaping daily decisions and showing up in your sleep and your plans. That's exhausting, and it's also exactly the pattern this program was built to break. Strong loops have a clear structure to interrupt, and the ERP-based method works directly on the checking and reassurance-seeking that keep it running.",
  intense:
    "Your loop is demanding and frequent — it's taking a real daily toll. Read this clearly: a high score is not a sign that something is medically wrong with you. It's a sign the anxiety habit is strong — and strong habits respond especially well to a structured, evidence-based reset, because there's so much pattern to work with.",
};

export function ResultBand({ band }: { band: Band }) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-6">
      <p className="text-ink-soft">{BAND_COPY[band]}</p>
    </div>
  );
}
