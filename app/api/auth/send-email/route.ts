import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendOtpEmail } from "@/lib/email/send";

export const runtime = "nodejs";

// Supabase "Send Email" auth hook. When enabled (Authentication → Hooks → Send
// Email Hook → HTTPS → this URL + secret), Supabase POSTs the auth email payload
// (including the OTP token) here INSTEAD of sending via SMTP. We deliver the code
// through Resend's API — which is verified and working — sidestepping the flaky
// SMTP path entirely. The login flow (signInWithOtp → verifyOtp type 'email') is
// unchanged; only delivery is rerouted. generateLink (the seamless post-payment
// session mint) doesn't send email, so it never reaches this hook.
//
// Verified with the Standard Webhooks signature (the same scheme Supabase uses).
function verifySignature(rawBody: string, headers: Headers, secret: string): boolean {
  try {
    const id = headers.get("webhook-id");
    const ts = headers.get("webhook-timestamp");
    const sigHeader = headers.get("webhook-signature");
    if (!id || !ts || !sigHeader) return false;

    // Supabase shows the secret as "v1,whsec_<base64>"; the key is the base64 part.
    const base64Key = secret.replace(/^v1,/, "").replace(/^whsec_/, "");
    const key = Buffer.from(base64Key, "base64");
    const signed = `${id}.${ts}.${rawBody}`;
    const expected = crypto.createHmac("sha256", key).update(signed).digest("base64");

    // webhook-signature is a space-separated list of "v1,<base64sig>".
    const provided = sigHeader.split(" ").map((p) => p.split(",")[1] ?? p);
    return provided.some((p) => {
      const a = Buffer.from(p);
      const b = Buffer.from(expected);
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    });
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const secret = process.env.SEND_EMAIL_HOOK_SECRET;
  if (!secret) {
    console.error("[send-email hook] SEND_EMAIL_HOOK_SECRET is not set");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const raw = await req.text();
  if (!verifySignature(raw, req.headers, secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: {
    user?: { email?: string };
    email_data?: { token?: string; email_action_type?: string };
  };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const email = payload.user?.email;
  const token = payload.email_data?.token;
  const action = payload.email_data?.email_action_type ?? "unknown";
  if (!email || !token) {
    console.error(`[send-email hook] missing email/token (action=${action})`);
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  try {
    await sendOtpEmail(email, token);
  } catch (e) {
    console.error("[send-email hook] Resend send failed:", e);
    return NextResponse.json({ error: "send failed" }, { status: 500 });
  }

  console.log(`[send-email hook] sent ${action} code to ${email}`);
  return NextResponse.json({});
}
