import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { scoreAssessment, BAND_LABEL } from "@/lib/assessment/scoring";
import { SCORED_IDS } from "@/lib/assessment/questions";
import { signLeadId, LEAD_COOKIE, LEAD_COOKIE_MAX_AGE } from "@/lib/leadCookie";
import { sendResultsEmail } from "@/lib/email/send";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Email gate → create lead. Scores server-side (never trusts a client score),
// writes via the service role (leads are server-only under RLS), sets the signed
// lead_id cookie, sends the results email, and fires nothing here — the client
// fires Pixel `Lead` on success.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const b = (body ?? {}) as {
    email?: unknown;
    answers?: unknown;
    utm?: unknown;
  };

  const email =
    typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const answers = (b.answers ?? {}) as Record<string, unknown>;
  const clean: Record<string, number> = {};
  for (const id of SCORED_IDS) {
    const v = answers[id];
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 4) {
      return NextResponse.json(
        { error: "Please answer every question." },
        { status: 400 }
      );
    }
    clean[id] = Math.round(v);
  }

  // Persist the (unscored) context answer too, if present and valid.
  const stored: Record<string, number> = { ...clean };
  if (typeof answers.context_duration === "number") {
    stored.context_duration = Math.round(answers.context_duration);
  }

  const result = scoreAssessment(clean);
  const utm =
    b.utm && typeof b.utm === "object" && !Array.isArray(b.utm) ? b.utm : null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("leads")
    .insert({
      email,
      assessment_score: result.score,
      band: result.band,
      dominant_driver: result.driver,
      safety_branch: result.safetyBranch,
      answers: stored,
      utm,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[lead] insert failed:", error?.message);
    return NextResponse.json(
      { error: "Could not save your results. Please try again." },
      { status: 500 }
    );
  }

  // Results email is best-effort — a delivery hiccup must not block the funnel.
  try {
    await sendResultsEmail(email, result.score, BAND_LABEL[result.band]);
  } catch (e) {
    console.error("[lead] results email failed:", e);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(LEAD_COOKIE, signLeadId(data.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: LEAD_COOKIE_MAX_AGE,
  });
  return res;
}
