import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasPaidAccess } from "@/lib/access";
import { TOTAL_DAYS } from "@/content/program";
import { sanitizeCheckIn, computeSpiralScore } from "@/lib/checkin";

export const runtime = "nodejs";

// One submit: marks the day complete AND saves the evening check-in. Authed (RLS —
// user writes only their own rows) and gated on paid access. The Spiral Score is
// computed SERVER-SIDE from the 7 fields (never trusts a client score) and stored.
// Idempotent — re-submitting updates the check-in/score.
export async function POST(req: Request) {
  const ssr = await createServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!(await hasPaidAccess(admin, user.id))) {
    return NextResponse.json({ error: "No active access." }, { status: 403 });
  }

  let body: { day?: unknown; checkin?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const day = typeof body.day === "number" ? Math.round(body.day) : NaN;
  if (!Number.isInteger(day) || day < 1 || day > TOTAL_DAYS) {
    return NextResponse.json({ error: "Invalid day." }, { status: 400 });
  }

  const checkin = sanitizeCheckIn(body.checkin);
  if (!checkin) {
    return NextResponse.json({ error: "Missing check-in." }, { status: 400 });
  }
  const spiralScore = computeSpiralScore(checkin, true); // submitting => exercise done

  // Upsert via the user's own RLS-enforced client.
  const { error } = await ssr.from("daily_progress").upsert(
    {
      user_id: user.id,
      day_number: day,
      completed_at: new Date().toISOString(),
      reflection: checkin,
      spiral_score: spiralScore,
    },
    { onConflict: "user_id,day_number" }
  );
  if (error) {
    console.error("[progress] upsert failed:", error.message);
    return NextResponse.json({ error: "Could not save." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, spiralScore });
}
