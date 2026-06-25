import { Section } from "@/components/ui/Section";

// §3 — three scannable steps. Step 2/3 adapted to the 14-day reset and softened
// per the FINAL-SPEC honesty note (no promise of an in-app day-by-day score trend;
// the Day-0 baseline on the results page still holds).
const STEPS = [
  {
    n: 1,
    title: "Take the 2-minute assessment.",
    body: "Get your Spiral Score and see exactly where your loop is strongest — searching, checking, or reassurance-seeking.",
  },
  {
    n: 2,
    title: "Start your 14-day reset.",
    body: "A daily, 15-minute program: you map the loop, loosen the catastrophic thoughts, then cut the checking, Googling, and reassurance-seeking that keep it running.",
  },
  {
    n: 3,
    title: "Watch your Spiral Score move.",
    body: "Your assessment is your Day-0 baseline. Each day you do a 60-second check-in and the app tracks your score — so you watch it come down as you cut the checking, Googling, and reassurance-seeking.",
  },
];

export function HowItWorks() {
  return (
    <Section>
      <h2 className="text-2xl sm:text-3xl">
        A clear path out, not endless content to scroll.
      </h2>
      <ol className="mt-6 space-y-5">
        {STEPS.map((s) => (
          <li key={s.n} className="flex gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-lg text-primary">
              {s.n}
            </span>
            <div>
              <h3 className="text-lg text-ink">{s.title}</h3>
              <p className="mt-1 text-ink-soft">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
