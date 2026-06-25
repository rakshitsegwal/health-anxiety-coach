// Order summary + the stack + value anchor + honest price block. Price appears
// here for the first time in the funnel (₹999, one-time, no subscription). No
// fabricated original price / countdown — honest founding framing only.
const STACK = [
  "The full 14-day program — 15 minutes a day, five guided phases",
  "CBT toolkit — thought records and decatastrophizing",
  "ERP ladder — graded exposures that retrain your response to fear",
  "Your Spiral Score tracker — a daily check-in that shows your number moving from Day 0",
  "The reassurance script + a sensible-health-plan setup so you stay safe",
  "A flare-up & maintenance plan you keep",
  "30-day money-back guarantee",
];

export function CheckoutSummary() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl">
          The Symptom Spiral Reset — your 14-day program
        </h1>
        <p className="mt-2 text-ink-soft">
          Built to help you start breaking the loop and keep the gains.
        </p>
      </div>

      <ul className="space-y-2">
        {STACK.map((item) => (
          <li key={item} className="flex gap-3 text-ink-soft">
            <span aria-hidden className="mt-0.5 text-primary">
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="rounded-2xl border border-line bg-bg p-5 text-sm text-ink-soft">
        A single therapy session usually costs more than this entire program — and
        most people need many. This is the same evidence-based method, sequenced
        into a program you can start today, with no waitlist.
      </div>

      <div className="rounded-3xl border border-line bg-surface p-6">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-4xl text-ink">₹999</span>
          <span className="text-ink-soft">one-time</span>
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          Founding-member price while the first cohort is open.
        </p>
        <p className="mt-3 text-sm text-ink-soft">
          One-time payment. No subscription. No auto-renewal.
        </p>
      </div>

      <p className="text-sm text-ink-soft">
        🔒 Secure checkout · ↩️ 30-day money-back · 📱 Works on any phone · 🧠 CBT &amp;
        ERP-based
      </p>
    </div>
  );
}
