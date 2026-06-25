import Link from "next/link";
import { Section } from "@/components/ui/Section";

// §6 — handles the real objections. Verbatim from the deck ("42-day" adapted to
// "14-day"). The privacy answer links to the published policy.
const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Is this therapy?",
    a: "No — it's a structured self-help program built on the same CBT/ERP methods therapists use. It's not a replacement for a therapist or doctor, and if your worry is severe we'll tell you to work with one.",
  },
  {
    q: "Is this just a chatbot?",
    a: "No. It's a finite, sequenced 14-day program with daily exercises, a progress score, and a maintenance plan — designed to end with you not needing it.",
  },
  {
    q: "Will it make me more obsessive?",
    a: "It's engineered to do the opposite. The whole method reduces checking and reassurance-seeking — the behaviors that keep health anxiety running.",
  },
  {
    q: "What if I'm actually sick?",
    a: "The program never asks you to ignore your health. On Day 3 you set up a sensible care plan and a red-flag list. It targets the excess checking, not appropriate care.",
  },
  {
    q: "What about my privacy?",
    a: (
      <>
        Your answers are private and never sold.{" "}
        <Link href="/legal/privacy" className="text-primary underline underline-offset-4">
          Read our privacy policy
        </Link>
        .
      </>
    ),
  },
  {
    q: "What if it doesn't work for me?",
    a: "30-day money-back guarantee. If it's not for you, email us and we refund you.",
  },
];

export function FAQ() {
  return (
    <Section>
      <h2 className="text-2xl sm:text-3xl">Questions, answered.</h2>
      <div className="mt-6 divide-y divide-line">
        {FAQS.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg text-ink">
              {f.q}
              <span className="text-ink-soft transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-2 text-ink-soft">{f.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
