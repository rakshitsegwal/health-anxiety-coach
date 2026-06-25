import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendFreeDay1Email } from "@/lib/email/send";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Exit-intent "get Day 1 free". Idempotent: if this lead already received it, we
// don't resend. Best-effort if there's no matching lead (direct nav) — we still
// send the sample but can't set the suppression flag.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email =
    typeof (body as { email?: unknown })?.email === "string"
      ? (body as { email: string }).email.trim().toLowerCase()
      : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: lead } = await admin
    .from("leads")
    .select("id, got_free_day1")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lead?.got_free_day1) {
    return NextResponse.json({ ok: true, alreadySent: true });
  }

  try {
    await sendFreeDay1Email(email);
  } catch (e) {
    console.error("[free-day1] email failed:", e);
    return NextResponse.json(
      { error: "Could not send Day 1. Please try again." },
      { status: 500 }
    );
  }

  if (lead?.id) {
    await admin.from("leads").update({ got_free_day1: true }).eq("id", lead.id);
  }

  return NextResponse.json({ ok: true });
}
