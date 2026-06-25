import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getDay } from "@/content/program";
import { isDayAvailable } from "@/lib/drip";
import { CheckInForm } from "@/components/dashboard/CheckInForm";
import { Day1Pixel } from "@/components/dashboard/Day1Pixel";
import type { CheckIn } from "@/lib/checkin";

export const metadata: Metadata = { robots: { index: false } };
export const dynamic = "force-dynamic";

// The LESSON (Idea + Practice) is the hero — it's what's new each day. The
// repeated evening check-in is a quiet, collapsed step at the bottom (see
// CheckInForm). Day 1 fires day_1_started on open and day_1_completed on
// completion.
export default async function DayPage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const { n } = await params;
  const day = Number(n);
  const content = getDay(day);
  if (!content) notFound();

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
  const enrollment = profile?.enrollment_date
    ? new Date(profile.enrollment_date as string)
    : new Date();

  if (!isDayAvailable(day, enrollment)) {
    return (
      <main className="px-5 py-10">
        <div className="mx-auto max-w-content space-y-3">
          <p className="text-ink-soft">This day isn&apos;t unlocked yet.</p>
          <Link href="/dashboard" className="text-primary underline underline-offset-4">
            ← Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  // One read for this day's check-in + the score trajectory.
  const { data: allProg } = await ssr
    .from("daily_progress")
    .select("day_number, completed_at, spiral_score, reflection")
    .eq("user_id", user.id);
  const rows = allProg ?? [];
  const thisDay = rows.find((r) => r.day_number === day);
  const completed = !!thisDay?.completed_at;
  const reflection = (thisDay?.reflection as CheckIn | null) ?? null;
  const savedScore = (thisDay?.spiral_score as number | null) ?? null;

  let latestDay: number | null = null;
  let latestScore: number | null = null;
  for (const r of rows) {
    if (r.spiral_score != null && (latestDay == null || (r.day_number as number) > latestDay)) {
      latestDay = r.day_number as number;
      latestScore = r.spiral_score as number;
    }
  }
  const baseline = (profile?.baseline_score as number | null) ?? null;

  return (
    <main className="px-5 py-8">
      {day === 1 ? <Day1Pixel /> : null}
      <article className="mx-auto max-w-content space-y-8">
        <Link href="/dashboard" className="text-sm text-ink-soft hover:text-ink">
          ← Dashboard
        </Link>

        {/* ── Lesson hero (loud — what's new today) ── */}
        <header>
          <p className="text-sm font-medium text-primary-deep">{content.phase}</p>
          <h1 className="mt-1 text-3xl leading-tight sm:text-4xl">
            Day {day} — {content.title}
          </h1>
        </header>

        <section className="space-y-7">
          <div>
            <h2 className="font-display text-xl text-ink">The idea</h2>
            <p className="mt-2 text-lg leading-relaxed text-ink-soft">{content.idea}</p>
          </div>
          <div>
            <h2 className="font-display text-xl text-ink">The practice</h2>
            <p className="mt-2 text-lg leading-relaxed text-ink-soft">{content.practice}</p>
          </div>
          {content.safety ? (
            <div className="rounded-2xl border border-warn/30 bg-warn/5 p-4">
              <h3 className="text-sm font-medium text-ink">Safety note</h3>
              <p className="mt-1 text-sm text-ink-soft">{content.safety}</p>
            </div>
          ) : null}
        </section>

        <hr className="border-line" />

        {/* ── Quiet, collapsed tracker (repeated each day) ── */}
        <CheckInForm
          day={day}
          initial={reflection}
          initiallyCompleted={completed}
          initialScore={savedScore}
          baseline={baseline}
          latestDay={latestDay}
          latestScore={latestScore}
        />
      </article>
    </main>
  );
}
