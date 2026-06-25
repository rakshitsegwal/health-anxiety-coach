import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { LEAD_COOKIE, verifyLeadCookie } from "@/lib/leadCookie";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";
import { RazorpayButton } from "@/components/checkout/RazorpayButton";
import { ViewContentPixel } from "@/components/marketing/ViewContentPixel";

export const metadata: Metadata = {
  title: "Checkout — The Symptom Spiral Reset",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  // Email is prefilled from the lead captured at the gate. No lead → no checkout.
  const store = await cookies();
  const leadId = verifyLeadCookie(store.get(LEAD_COOKIE)?.value);
  if (!leadId) redirect("/assessment");

  const admin = createAdminClient();
  const { data: lead } = await admin
    .from("leads")
    .select("email")
    .eq("id", leadId)
    .maybeSingle();
  if (!lead?.email) redirect("/assessment");

  return (
    <main className="px-5 py-8">
      <ViewContentPixel name="offer" />
      <div className="mx-auto w-full max-w-content space-y-8">
        <CheckoutSummary />
        <RazorpayButton email={lead.email as string} />
        <p className="text-center text-xs text-ink-soft">
          ✓ 30-day money-back guarantee. Not for you? One email, full refund.
        </p>
      </div>
    </main>
  );
}
