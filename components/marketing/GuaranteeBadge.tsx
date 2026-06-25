import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

// §9 guarantee + §8 final CTA. The guarantee is stated identically here, on
// checkout, and on the thank-you page. One-time payment, no subscription, never a
// medical/cure guarantee.
export function GuaranteeBadge() {
  return (
    <Section>
      <div className="rounded-3xl border border-line bg-surface p-6 text-center">
        <h2 className="text-2xl sm:text-3xl">
          The &ldquo;Break the Loop or It&apos;s Free&rdquo; Guarantee.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Use the program for up to 30 days. If it&apos;s not helping you — for any
          reason or no reason — email us within 30 days of purchase and we&apos;ll
          refund you in full. No forms, no hoops, no &ldquo;prove you did the
          work.&rdquo;
        </p>
        <p className="mt-3 text-sm text-ink-soft">
          One-time payment. No subscription. No auto-renewal.
        </p>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl sm:text-3xl">See your Spiral Score in 2 minutes.</h2>
        <div className="mt-5">
          <ButtonLink href="/assessment" size="lg">
            Start the free assessment →
          </ButtonLink>
        </div>
        <p className="mt-3 text-sm text-ink-soft">
          Free · No signup to start · 30-day money-back guarantee on the program
        </p>
      </div>
    </Section>
  );
}
