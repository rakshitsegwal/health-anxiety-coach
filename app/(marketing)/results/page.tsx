import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { LEAD_COOKIE, verifyLeadCookie } from "@/lib/leadCookie";
import {
  BAND_LABEL,
  DRIVER_LABEL,
  type Band,
  type Driver,
} from "@/lib/assessment/scoring";
import { ScoreGauge } from "@/components/results/ScoreGauge";
import { ResultBand } from "@/components/results/ResultBand";
import { SafetyBranch } from "@/components/results/SafetyBranch";
import { ResultsCta } from "@/components/results/ResultsCta";
import { ExitIntentModal } from "@/components/results/ExitIntentModal";
import { ViewContentPixel } from "@/components/marketing/ViewContentPixel";

export const metadata: Metadata = {
  title: "Your Spiral Score",
  robots: { index: false },
};

// Dynamic: reads the signed lead cookie at request time.
export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const store = await cookies();
  const leadId = verifyLeadCookie(store.get(LEAD_COOKIE)?.value);
  if (!leadId) redirect("/assessment");

  const admin = createAdminClient();
  // Deliberately fetch ONLY what the results screen needs (+ email for the
  // exit-intent prefill) — never the raw answers.
  const { data: lead } = await admin
    .from("leads")
    .select("email, assessment_score, band, dominant_driver, safety_branch")
    .eq("id", leadId)
    .single();

  if (!lead) redirect("/assessment");

  const score = lead.assessment_score as number;
  const band = lead.band as Band;
  const driver = lead.dominant_driver as Driver;

  return (
    <main className="px-5 py-8">
      <ViewContentPixel name="results" />
      <div className="mx-auto w-full max-w-content space-y-6">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl">
            Your Spiral Score: {score}/100 — {BAND_LABEL[band]}
          </h1>
        </div>

        <ScoreGauge score={score} band={band} />

        <p className="text-center text-ink-soft">
          This is your Day-0 baseline — the number you&apos;ll watch fall.
        </p>

        <p className="text-ink-soft">
          Your strongest driver right now is{" "}
          <strong className="text-ink">{DRIVER_LABEL[driver]}.</strong> That&apos;s
          the habit we&apos;d interrupt first.
        </p>

        <p className="text-ink-soft">
          Whatever your score, this pattern is common, it is not a sign of weakness,
          and it is <em>trainable.</em> You&apos;re not broken — your brain has
          over-learned a habit, and habits can be un-learned.
        </p>

        <ResultBand band={band} />

        {lead.safety_branch ? <SafetyBranch /> : null}

        <div className="rounded-3xl border border-line bg-surface p-6">
          <h2 className="text-xl sm:text-2xl">Here&apos;s how you move that number.</h2>
          <p className="mt-3 text-ink-soft">
            The relief from searching and checking will always be temporary —
            that&apos;s the loop. The Symptom Spiral Reset helps you start breaking
            it in 14 days using the methods clinicians use: not by giving you more
            certainty, but by
            teaching you to need less of it. Your assessment today is Day 0 — and
            inside, a 60-second daily check-in tracks your Spiral Score, so you can
            watch the number move from here.
          </p>
          <div className="mt-5">
            <ResultsCta />
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            30-day money-back guarantee · Starts today
          </p>
        </div>
      </div>

      <ExitIntentModal email={lead.email as string} />
    </main>
  );
}
