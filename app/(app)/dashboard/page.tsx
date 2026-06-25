import type { Metadata } from "next";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { DayList } from "@/components/dashboard/DayList";
import { RefundRequest } from "@/components/account/RefundRequest";
import { ButtonLink } from "@/components/ui/Button";
import { PROGRAM, TOTAL_DAYS, getDay } from "@/content/program";
import { isDayAvailable } from "@/lib/drip";

export const metadata: Metadata = { title: "Your dashboard", robots: { index: false } };
export const dynamic = "force-dynamic";

// Content + completion + the Spiral Score in PLAIN TEXT (no charts/gamification):
// the Day-0 baseline (from the assessment) and the latest day's score — the number
// the user paid to move.
export default async function DashboardPage() {
  const ssr = await createServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!user) return null; // guarded by the (app) layout

  const { data: profile } = await ssr
    .from("profiles")
    .select("enrollment_date, baseline_score")
    .eq("user_id", user.id)
    .maybeSingle();
  const { data: progress } = await ssr
    .from("daily_progress")
    .select("day_number, completed_at, spiral_score")
    .eq("user_id", user.id);

  const rows = progress ?? [];
  const completed = new Set(
    rows.filter((p) => p.completed_at).map((p) => p.day_number as number)
  );
  const scores = new Map<number, number>(
    rows
      .filter((p) => p.spiral_score != null)
      .map((p) => [p.day_number as number, p.spiral_score as number])
  );
  const enrollment = profile?.enrollment_date
    ? new Date(profile.enrollment_date as string)
    : new Date();
  const available = (day: number) => isDayAvailable(day, enrollment);

  // Latest scored day (highest day number that has a Spiral Score).
  let latest: { day: number; score: number } | null = null;
  for (const [day, score] of scores) {
    if (!latest || day > latest.day) latest = { day, score };
  }
  const baseline = profile?.baseline_score ?? null;

  // Today's session = first available, not-yet-completed day.
  let currentDay = TOTAL_DAYS;
  for (const d of PROGRAM) {
    if (available(d.day) && !completed.has(d.day)) {
      currentDay = d.day;
      break;
    }
  }
  const todays = getDay(currentDay)!;
  const allDone = completed.size >= TOTAL_DAYS;

  return (
    <main className="px-5 py-8">
      <div className="mx-auto max-w-content space-y-8">
        {/* Spiral Score — plain text */}
        <section className="rounded-3xl border border-line bg-surface p-6">
          <h1 className="font-display text-lg text-ink">Your Spiral Score</h1>
          <p className="mt-2 text-2xl text-ink">
            Day 0: {baseline ?? "—"}
            {latest ? (
              <>
                {"  →  "}
                <span className="text-primary-deep">
                  Day {latest.day}: {latest.score}
                </span>
              </>
            ) : null}
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            {completed.size} of {TOTAL_DAYS} days complete · lower is better
            {latest == null
              ? " · complete a day to log your first score"
              : ""}
          </p>
        </section>

        {allDone ? (
          <section className="rounded-3xl border border-primary/30 bg-primary/5 p-6">
            <h2 className="text-xl">You&apos;ve finished all 14 days.</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Revisit any day below, and keep your maintenance routine going.
            </p>
          </section>
        ) : (
          <section className="rounded-3xl border border-primary/30 bg-primary/5 p-6">
            <p className="text-sm text-primary-deep">Today&apos;s session</p>
            <h2 className="mt-1 text-xl">
              Day {currentDay} — {todays.title}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">{todays.phase}</p>
            <div className="mt-4">
              <ButtonLink href={`/dashboard/day/${currentDay}`}>
                Open Day {currentDay} →
              </ButtonLink>
            </div>
          </section>
        )}

        <div>
          <h2 className="mb-3 font-display text-lg text-ink">All days</h2>
          <DayList
            completed={completed}
            currentDay={currentDay}
            isAvailable={available}
            scores={scores}
          />
        </div>

        <section className="rounded-3xl border border-line bg-surface p-6">
          <h2 className="font-display text-lg text-ink">Guarantee &amp; help</h2>
          <p className="mt-2 text-sm text-ink-soft">
            30-day money-back guarantee — if it&apos;s not for you, get a full refund,
            no questions. Questions? Email us at rakshit1352@gmail.com.
          </p>
          <div className="mt-3">
            <RefundRequest />
          </div>
        </section>
      </div>
    </main>
  );
}
