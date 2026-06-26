import "server-only";
import { Resend } from "resend";

// Transactional email via Resend. (Supabase Auth also sends OTP emails — point
// its SMTP at Resend in the Supabase dashboard for branded, deliverable codes.)
// Bodies below are minimal; final copy comes from the funnel deck.

// Lazy singleton: the Resend constructor THROWS when RESEND_API_KEY is unset, so
// we defer creating it until an email is actually sent. Without this, importing
// this module (e.g. via an API route during `next build` or dev) crashes when the
// key isn't configured.
let _resend: Resend | null = null;
function client(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}
const FROM = process.env.EMAIL_FROM ?? "The Symptom Spiral Reset <hello@yourdomain.com>";

function wrap(inner: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;color:#16242B;line-height:1.55">${inner}<hr style="border:none;border-top:1px solid #E4E6E1;margin:24px 0"/><p style="font-size:12px;color:#51616A">This program is psychoeducational self-help, not medical advice or treatment, and does not replace professional care. If you're in crisis, contact your local emergency number or a crisis line.</p></div>`;
}

export async function sendResultsEmail(to: string, score: number, band: string) {
  return client().emails.send({
    from: FROM,
    to,
    subject: `Your Spiral Score: ${score}/100 — and the first step`,
    html: wrap(
      `<h2>Your Spiral Score: ${score}/100</h2><p>You're showing a <strong>${band}</strong> pattern. This is your Day-0 baseline — common, not a sign of weakness, and trainable.</p><p>The single most important idea in the whole program: the relief from checking lasts about four minutes, then trains the loop to come back stronger. Tomorrow, try delaying just one urge by ten minutes and watch it pass on its own.</p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/checkout">Start your 14-day reset →</a></p>`
    ),
  });
}

export async function sendFreeDay1Email(to: string) {
  return client().emails.send({
    from: FROM,
    to,
    subject: "Here's Day 1, free — map your spiral",
    html: wrap(
      `<h2>Day 1 — Map your spiral</h2><p>Every spiral has the same five links: trigger → catastrophic thought → anxiety → safety behavior → brief relief → rebound. Today, just write out your most recent one, link by link. Seeing it is the first step to interrupting it.</p><p>When you're ready to start breaking the loop in 14 days → <a href="${process.env.NEXT_PUBLIC_SITE_URL}/checkout">start your reset</a>.</p>`
    ),
  });
}

export async function sendPurchaseConfirmation(to: string) {
  return client().emails.send({
    from: FROM,
    to,
    subject: "You're in — Day 0 starts now",
    html: wrap(
      `<h2>You're in.</h2><p>Your Symptom Spiral Reset is ready and all 14 days are unlocked. Open Day 1 and map your spiral — it takes five minutes and it's where this starts working.</p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard">Go to your dashboard →</a></p><p>If you ever need to log back in, use your email at <a href="${process.env.NEXT_PUBLIC_SITE_URL}/login">the login page</a> — we'll send a 6-digit code. 30-day money-back guarantee.</p>`
    ),
  });
}

export async function sendAbandonedCheckout(to: string) {
  return client().emails.send({
    from: FROM,
    to,
    subject: "You were one step from Day 0",
    html: wrap(
      `<p>You started checking out and didn't finish — no pressure, just making sure nothing broke. Your Day-0 score is saved, and the founding price is still open. With the 30-day guarantee, the only risk is staying in the loop another month.</p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/checkout">Finish in 30 seconds →</a></p>`
    ),
  });
}

export async function sendRefundConfirmation(to: string) {
  return client().emails.send({
    from: FROM,
    to,
    subject: "Your refund is on its way",
    html: wrap(
      `<h2>Your refund is being processed.</h2><p>We've received your refund request for The Symptom Spiral Reset. The amount will be returned to your original payment method within a few business days, and your access to the program ends once the refund completes.</p><p>No hard feelings — if there's anything we could have done better, just reply to this email; a real person reads it.</p>`
    ),
  });
}

// Sign-in OTP code — delivered via the Supabase "Send Email" auth hook so the code
// goes out through Resend's API (which works) instead of Supabase SMTP.
export async function sendOtpEmail(to: string, token: string) {
  return client().emails.send({
    from: FROM,
    to,
    subject: `Your sign-in code: ${token}`,
    html: wrap(
      `<h2>Your sign-in code</h2><p>Enter this code to sign in to The Symptom Spiral Reset:</p><p style="font-size:30px;font-weight:700;letter-spacing:6px;color:#16242B;margin:16px 0">${token}</p><p style="font-size:13px;color:#51616A">This code expires shortly. If you didn't request it, you can ignore this email.</p>`
    ),
  });
}
