import { NextResponse, type NextRequest } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay/verify";
import { provisionPaidOrder, mintSession } from "@/lib/razorpay/provision";

export const runtime = "nodejs";

// Client callback after a successful Razorpay payment. Verifies the signature
// SERVER-SIDE (never trusts the client), idempotently provisions, then mints the
// session so the buyer lands signed in. On a signature failure → reject. On a
// session-mint failure → still provisioned; client falls back to OTP via the
// thank-you poll. Access is NEVER granted from client state.
export async function POST(req: NextRequest) {
  let body: {
    razorpay_order_id?: unknown;
    razorpay_payment_id?: unknown;
    razorpay_signature?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const orderId = body.razorpay_order_id;
  const paymentId = body.razorpay_payment_id;
  const signature = body.razorpay_signature;
  if (
    typeof orderId !== "string" ||
    typeof paymentId !== "string" ||
    typeof signature !== "string"
  ) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!verifyPaymentSignature(orderId, paymentId, signature)) {
    return NextResponse.json(
      { error: "Payment verification failed." },
      { status: 400 }
    );
  }

  const { userId, email } = await provisionPaidOrder({
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
  });
  if (!userId || !email) {
    return NextResponse.json(
      { error: "Could not finalize your purchase." },
      { status: 500 }
    );
  }

  const sessionEstablished = await mintSession(email);
  return NextResponse.json({ ok: true, sessionEstablished });
}
