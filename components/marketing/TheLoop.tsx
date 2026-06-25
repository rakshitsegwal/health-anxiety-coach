import { Section } from "@/components/ui/Section";

// §2 — the problem in their own words, kept compliant (first-person/educational).
export function TheLoop() {
  return (
    <Section className="border-y border-line bg-surface">
      <h2 className="text-2xl sm:text-3xl">You already know how this goes.</h2>
      <div className="mt-4 space-y-4 text-ink-soft">
        <p>
          A sensation shows up. Your mind jumps to the worst case. You search it,
          check it, or ask someone &ldquo;does this seem serious?&rdquo; — and for a
          few minutes, you feel better. Then the doubt comes back, usually louder.
          Search again. Check again. Ask again.
        </p>
        <p>
          Here&apos;s the part nobody tells you:{" "}
          <strong className="text-ink">
            the checking isn&apos;t calming the loop. It&apos;s feeding it.
          </strong>{" "}
          Every check quietly trains your brain that checking was necessary — so the
          urge comes back stronger and more often. This has a name, and a way out.
        </p>
      </div>
    </Section>
  );
}
