import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Thank-you polling for lost client callbacks. Keyed on the (non-guessable enough,
// non-secret) razorpay_order_id; returns only the status enum — never PII. Once
// 'paid', the thank-you page proceeds (sign in via OTP if no session was minted).
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("order_id");
  if (!orderId) {
    return NextResponse.json({ error: "missing order_id" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("orders")
    .select("status")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();

  return NextResponse.json({ status: data?.status ?? "unknown" });
}
