import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpay } from "@/lib/razorpay/client";
import { sendRefundConfirmation } from "@/lib/email/send";

export const runtime = "nodejs";

// User-initiated refund under the 30-day guarantee (one click). Triggers the
// Razorpay refund on the buyer's paid payment; the refund.processed webhook then
// flips the order to 'refunded' and access is revoked on the next request (see
// lib/access.ts). The client fires the refund_requested event. Best-effort: if the
// refund can't be auto-initiated, we still confirm + log for manual handling.
export async function POST() {
  const ssr = await createServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("razorpay_order_id, razorpay_payment_id, email")
    .eq("user_id", user.id)
    .eq("status", "paid")
    .order("paid_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!order) {
    return NextResponse.json(
      { error: "No active purchase to refund." },
      { status: 400 }
    );
  }

  let refundInitiated = false;
  if (order.razorpay_payment_id) {
    try {
      await getRazorpay().payments.refund(order.razorpay_payment_id, {
        speed: "optimum",
      });
      refundInitiated = true;
    } catch (e) {
      console.error(
        "[refund] Razorpay refund failed — needs manual handling:",
        e instanceof Error ? e.message : e
      );
    }
  }

  try {
    await sendRefundConfirmation(order.email);
  } catch (e) {
    console.error("[refund] confirmation email failed:", e);
  }

  if (!refundInitiated) {
    console.warn(
      `[refund] MANUAL ACTION NEEDED — refund order ${order.razorpay_order_id} (${order.email})`
    );
  }

  return NextResponse.json({ ok: true, refundInitiated });
}
