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

  const tStart = Date.now();
  if (!verifyPaymentSignature(orderId, paymentId, signature)) {
    console.warn(`[verify] bad signature for order ${orderId}`);
    return NextResponse.json(
      { error: "Payment verification failed." },
      { status: 400 }
    );
  }

  const tProv = Date.now();
  const { userId, email } = await provisionPaidOrder({
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
  });
  console.log(`[verify] provision ${Date.now() - tProv}ms user=${!!userId}`);
  if (!userId || !email) {
    return NextResponse.json(
      { error: "Could not finalize your purchase." },
      { status: 500 }
    );
  }

  const tMint = Date.now();
  const mint = await mintSession(email);
  console.log(
    `[verify] mint ${Date.now() - tMint}ms ok=${mint.ok}; TOTAL ${Date.now() - tStart}ms`
  );

  // Set the captured session cookies EXPLICITLY on this response so the browser
  // is signed in on the success redirect (the webhook is only a backup).
  const response = NextResponse.json({ ok: true, sessionEstablished: mint.ok });
  for (const c of mint.cookies) {
    response.cookies.set(c.name, c.value, c.options);
  }
  return response;
}
