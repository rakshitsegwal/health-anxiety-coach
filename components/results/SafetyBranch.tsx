// Shown when the safety branch fires (Spiral Score >= 76 OR Q6/Q7/Q8 maxed).
// Gentle, supportive — recommends a therapist alongside the program + the crisis
// note. The opening is generalized from the deck's intense-band line so it reads
// correctly for the Q6/Q7/Q8-maxed cases that can occur below score 76.
export function SafetyBranch() {
  return (
    <div className="rounded-3xl border border-warn/30 bg-warn/5 p-6">
      <h3 className="text-lg text-ink">A note on getting support</h3>
      <p className="mt-2 text-ink-soft">
        Some of your answers point to a real daily toll. Consider running this
        program alongside a licensed therapist trained in CBT/ERP — it&apos;s the
        most effective combination. And if you&apos;re ever in crisis or thinking of
        harming yourself, contact your local emergency number or a crisis line right
        away.
      </p>
    </div>
  );
}
