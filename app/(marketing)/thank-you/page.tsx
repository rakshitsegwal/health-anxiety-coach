import type { Metadata } from "next";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ButtonLink } from "@/components/ui/Button";
import { ThankYouPoller } from "@/components/checkout/ThankYouPoller";

export const metadata: Metadata = {
  title: "You're in — The Symptom Spiral Reset",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

// Reduce buyer's remorse: confirm, set expectations, give an immediate first
// action. Three states: signed-in (seamless session) → confirmed; paid-but-no-
// session (lost callback) → OTP sign-in; pending → poll. No upsell anywhere.
export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string; pending?: string }>;
}) {
  const sp = await searchParams;
  const orderId = typeof sp.order_id === "string" ? sp.order_id : undefined;

  const ssr = await createServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();

  if (user) {
    const { data: profile } = await ssr
      .from("profiles")
      .select("baseline_score")
      .eq("user_id", user.id)
      .maybeSingle();
    return <Confirmed baselineScore={profile?.baseline_score ?? null} />;
  }

  // Not signed in — was the order already settled (e.g. by the webhook)?
  let status = "unknown";
  let email: string | null = null;
  if (orderId) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("orders")
      .select("status, email")
      .eq("razorpay_order_id", orderId)
      .maybeSingle();
    status = data?.status ?? "unknown";
    email = (data?.email as string) ?? null;
  }

  if (status === "paid") return <PaidNeedsSignIn email={email} />;

  return <Pending orderId={orderId} />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="px-5 py-10">
      <div className="mx-auto w-full max-w-content space-y-6">{children}</div>
    </main>
  );
}

function GuaranteeAndSafety() {
  return (
    <p className="text-sm text-ink-soft">
      Remember: 30-day money-back guarantee — one email to claim. And a gentle
      reminder: this complements professional care. If your worry is severe, work
      with a therapist alongside the program.
    </p>
  );
}

function Confirmed({ baselineScore }: { baselineScore: number | null }) {
  return (
    <Shell>
      <h1 className="text-3xl sm:text-4xl">You&apos;re in. Day 0 starts now.</h1>
      <p className="text-ink-soft">
        Your purchase is confirmed and your Symptom Spiral Reset is ready.
        Here&apos;s what happens next:
      </p>
      <ol className="space-y-3">
        <li className="text-ink-soft">
          <strong className="text-ink">Your Day-0 Spiral Score is saved</strong> as
          your baseline{baselineScore != null ? ` — ${baselineScore}/100` : ""}. This
          is the number you&apos;ll watch fall.
        </li>
        <li className="text-ink-soft">
          <strong className="text-ink">All 14 days are unlocked today.</strong> Go at
          a steady pace — no overwhelm, no need to rush ahead.
        </li>
        <li className="text-ink-soft">
          <strong className="text-ink">15 minutes a day.</strong> The same simple
          structure daily: a short idea, one practice, a quick check-in.
        </li>
      </ol>

      <div className="rounded-3xl border border-line bg-surface p-6">
        <p className="text-ink">
          <strong>Open Day 1 and map your spiral.</strong> It takes five minutes and
          it&apos;s the moment this starts working.
        </p>
        <div className="mt-4">
          <ButtonLink href="/dashboard/day/1" size="lg">
            Start Day 1 →
          </ButtonLink>
        </div>
      </div>

      <p className="text-sm text-ink-soft">
        We&apos;ve signed you in. Next time, log in with your email at{" "}
        <a href="/login" className="underline underline-offset-4">
          the login page
        </a>{" "}
        — we&apos;ll send a 6-digit code (no password to remember).
      </p>
      <GuaranteeAndSafety />
    </Shell>
  );
}

function PaidNeedsSignIn({ email }: { email: string | null }) {
  const loginHref = email
    ? `/login?email=${encodeURIComponent(email)}`
    : "/login";
  return (
    <Shell>
      <h1 className="text-3xl sm:text-4xl">Payment confirmed.</h1>
      <p className="text-ink-soft">
        Your Symptom Spiral Reset is ready. Sign in with a one-time code to start —
        we&apos;ll send it{email ? ` to ${email}` : " to your email"}.
      </p>
      <div>
        <ButtonLink href={loginHref} size="lg">
          Sign in to start →
        </ButtonLink>
      </div>
      <GuaranteeAndSafety />
    </Shell>
  );
}

function Pending({ orderId }: { orderId?: string }) {
  return (
    <Shell>
      <h1 className="text-3xl sm:text-4xl">Almost there…</h1>
      <p className="text-ink-soft">
        We&apos;re confirming your payment. This usually takes a few seconds — please
        keep this page open.
      </p>
      {orderId ? (
        <ThankYouPoller orderId={orderId} />
      ) : (
        <p className="text-sm text-ink-soft">
          If you&apos;ve completed payment, check your email to{" "}
          <a href="/login" className="underline underline-offset-4">
            sign in
          </a>{" "}
          and start.
        </p>
      )}
      <GuaranteeAndSafety />
    </Shell>
  );
}
