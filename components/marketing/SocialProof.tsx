import { Section } from "@/components/ui/Section";

// §5 — social proof. PRE-LAUNCH, HONEST: no fabricated reviews or user counts
// (those are FTC-illegal, Meta-rejectable). Per the deck, the pre-launch slot is
// the founder note (§7) + an honest "founding cohort" line. Swap in real,
// process-based testimonials once you have them (with permission).
export function SocialProof() {
  return (
    <Section className="border-y border-line bg-surface">
      <h2 className="text-2xl sm:text-3xl">
        People who got off the symptom-search treadmill.
      </h2>

      <figure className="mt-5 rounded-3xl border border-line bg-bg p-6">
        <blockquote className="space-y-4 text-ink-soft">
          <p>
            I built The Symptom Spiral Reset because I lived inside the loop — the
            2am searches, the constant checking, the &ldquo;just one more
            opinion.&rdquo; What finally worked wasn&apos;t more reassurance. It was
            learning the actual method clinicians use to break the cycle. I turned
            that method into a day-by-day program so you don&apos;t have to find the
            right therapist first to get started.
          </p>
        </blockquote>
        <figcaption className="mt-4 text-sm font-medium text-ink">
          — The founder
        </figcaption>
      </figure>

      <p className="mt-5 text-ink-soft">
        We&apos;re pre-launch and we won&apos;t fake reviews. The founding cohort is
        open now — you&apos;d be one of the first to go through it, at the founding
        price.
      </p>
    </Section>
  );
}
