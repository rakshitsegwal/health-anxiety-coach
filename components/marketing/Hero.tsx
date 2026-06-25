import { ButtonLink } from "@/components/ui/Button";

// Above the fold. Comprehension < 10s, one CTA: start the assessment. No price.
// Copy from the funnel deck §1 ("42-day" adapted to the 14-day reset per FINAL-SPEC).
export function Hero() {
  return (
    <header className="px-5 pt-12 pb-10 sm:pt-16">
      <div className="mx-auto w-full max-w-content">
        <p className="text-sm font-medium text-ink-soft">
          Built on the CBT &amp; ERP methods clinicians use · Not medical advice
        </p>

        <h1 className="mt-4 text-4xl leading-[1.1] sm:text-5xl">
          The relief from Googling your symptoms lasts about four minutes.
        </h1>

        <p className="mt-5 text-lg text-ink-soft">
          There&apos;s a reason checking never makes the worry stop — and a
          structured, 14-day way to start breaking the loop. Start with a free
          2-minute
          assessment and see your Spiral Score.
        </p>

        <div className="mt-7">
          <ButtonLink href="/assessment" size="lg">
            Take the free 2-minute assessment →
          </ButtonLink>
          <p className="mt-3 text-sm text-ink-soft">
            No signup to start · See your score instantly · 100% private
          </p>
        </div>

        <p className="mt-8 rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink-soft">
          Built on the same methods used in clinical treatment for health anxiety ·
          Founding cohort now open · 30-day money-back guarantee
        </p>
      </div>
    </header>
  );
}
