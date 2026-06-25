import { NextResponse, type NextRequest } from "next/server";
import { getRazorpay } from "@/lib/razorpay/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { LEAD_COOKIE, verifyLeadCookie } from "@/lib/leadCookie";
import { PRICE_PAISE, CURRENCY } from "@/lib/types";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Create a Razorpay order (amount fixed server-side) + an `orders` row in
// 'created'. The buyer's email is taken from the signed lead cookie when present
// (authoritative), falling back to the request body for direct checkout.
export async function POST(req: NextRequest) {
  const admin = createAdminClient();

  let email = "";
  let leadId: string | null = null;

  const cookieLeadId = verifyLeadCookie(req.cookies.get(LEAD_COOKIE)?.value);
  if (cookieLeadId) {
    const { data: lead } = await admin
      .from("leads")
      .select("email")
      .eq("id", cookieLeadId)
      .maybeSingle();
    if (lead?.email) {
      email = lead.email;
      leadId = cookieLeadId;
    }
  }

  if (!email) {
    try {
      const body = (await req.json()) as { email?: unknown };
      if (typeof body?.email === "string") email = body.email.trim().toLowerCase();
    } catch {
      /* no body — handled by validation below */
    }
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Take the assessment first." },
      { status: 400 }
    );
  }

  try {
    const order = await getRazorpay().orders.create({
      amount: PRICE_PAISE,
      currency: CURRENCY,
      notes: { email, lead_id: leadId ?? "" },
    });

    const { error } = await admin.from("orders").insert({
      email,
      razorpay_order_id: order.id,
      amount: PRICE_PAISE,
      currency: CURRENCY,
      status: "created",
    });
    if (error) {
      console.error("[order] insert failed:", error.message);
      return NextResponse.json(
        { error: "Could not start checkout." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: order.id,
      amount: PRICE_PAISE,
      currency: CURRENCY,
      keyId: process.env.RAZORPAY_KEY_ID,
      email,
    });
  } catch (e) {
    console.error("[order] razorpay create failed:", e);
    return NextResponse.json(
      { error: "Could not start checkout." },
      { status: 500 }
    );
  }
}
