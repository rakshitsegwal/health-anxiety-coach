// Day-unlock logic.
// LAUNCH SETTING: DRIP_ENABLED = false -> all 14 days unlock immediately on
// purchase. Flip to true later to drip one day per calendar day from enrollment.

export const DRIP_ENABLED = false;
export const TOTAL_DAYS = 14;

const DAY_MS = 86_400_000;

export function unlockedThroughDay(
  enrollmentDate: Date,
  now: Date = new Date()
): number {
  if (!DRIP_ENABLED) return TOTAL_DAYS;
  const daysSince = Math.floor((now.getTime() - enrollmentDate.getTime()) / DAY_MS);
  return Math.min(TOTAL_DAYS, daysSince + 1);
}

export function isDayAvailable(
  day: number,
  enrollmentDate: Date,
  now: Date = new Date()
): boolean {
  return day >= 1 && day <= unlockedThroughDay(enrollmentDate, now);
}
