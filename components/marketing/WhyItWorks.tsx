import { Section } from "@/components/ui/Section";

// §4 — why this works when reassurance didn't. Verbatim from the deck.
export function WhyItWorks() {
  return (
    <Section className="border-y border-line bg-surface">
      <h2 className="text-2xl sm:text-3xl">
        It&apos;s built to do the opposite of what you&apos;ve been doing.
      </h2>
      <p className="mt-4 text-ink-soft">
        Most apps soothe you. That&apos;s the trap — soothing <em>is</em> reassurance,
        and reassurance is what keeps the loop alive. This program is built on{" "}
        <strong className="text-ink">Exposure &amp; Response Prevention (ERP)</strong>{" "}
        and <strong className="text-ink">CBT</strong>: the evidence-based methods that
        work by helping you need reassurance <em>less</em>, not more. It doesn&apos;t
        try to convince you you&apos;re fine. It teaches your nervous system to carry
        &ldquo;I can&apos;t be 100% certain — and I can live fully anyway.&rdquo;
      </p>
    </Section>
  );
}
