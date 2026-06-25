import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { verifyWebhookSignature } from "@/lib/razorpay/verify";
import { createAdminClient } from "@/lib/supabase/admin";
import { provisionPaidOrder } from "@/lib/razorpay/provision";

export const runtime = "nodejs";

// Async source-of-truth reconciliation. Verifies the webhook signature over the
// RAW body, dedupes via processed_webhooks (first writer wins), then reconciles.
// Returns 200 fast; all work is idempotent. Covers the lost-client-callback case
// (payment.captured/order.paid ensures provisioning even if /verify never ran).
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  if (!signature || !verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  let event: RazorpayEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true }); // unparseable but signed — ack
  }

  const admin = createAdminClient();
  const eventId =
    req.headers.get("x-razorpay-event-id") || `${event.event}:${raw.length}`;

  // Idempotency gate: insert the event id; a duplicate delivery is a no-op.
  const { error: dupErr } = await admin
    .from("processed_webhooks")
    .insert({ razorpay_event_id: eventId, type: event.event ?? "unknown" });
  if (dupErr) {
    if (dupErr.code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true }); // already handled
    }
    console.error("[webhook] dedupe insert failed:", dupErr.message);
    return NextResponse.json({ error: "retry" }, { status: 500 }); // let RZP retry
  }

  try {
    await reconcile(admin, event);
  } catch (e) {
    console.error("[webhook] reconcile error:", e);
    // Already deduped above; ack so Razorpay doesn't hammer us. Reconciliation is
    // idempotent, and a captured payment will also arrive via order.paid.
  }
  return NextResponse.json({ ok: true });
}

async function reconcile(admin: SupabaseClient, event: RazorpayEvent) {
  const type = event.event;
  const p = event.payload ?? {};

  if (type === "payment.captured" || type === "order.paid") {
    const orderId = p.payment?.entity?.order_id ?? p.order?.entity?.id;
    const paymentId = p.payment?.entity?.id ?? null;
    if (orderId) {
      await provisionPaidOrder({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
      });
    }
  } else if (type === "payment.failed") {
    const orderId = p.payment?.entity?.order_id;
    if (orderId) {
      await admin
        .from("orders")
        .update({ status: "failed" })
        .eq("razorpay_order_id", orderId)
        .eq("status", "created");
    }
  } else if (type === "refund.processed" || type === "refund.created") {
    const orderId = p.refund?.entity?.order_id ?? p.payment?.entity?.order_id;
    if (orderId) {
      // Mark refunded → access (a paid, non-refunded order) is revoked on the
      // next server check. See lib/access.ts.
      await admin
        .from("orders")
        .update({ status: "refunded", refunded_at: new Date().toISOString() })
        .eq("razorpay_order_id", orderId)
        .neq("status", "refunded");
    }
  }
}

type RazorpayEntity = { id?: string; order_id?: string };
type RazorpayEvent = {
  event: string;
  payload?: {
    payment?: { entity?: RazorpayEntity };
    order?: { entity?: RazorpayEntity };
    refund?: { entity?: RazorpayEntity };
  };
};
