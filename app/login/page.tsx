import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasPaidAccess } from "@/lib/access";
import { OtpForm } from "@/components/auth/OtpForm";
import { InAppBrowserBanner } from "@/components/auth/InAppBrowserBanner";

export const metadata: Metadata = {
  title: "Sign in — The Symptom Spiral Reset",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; revoked?: string }>;
}) {
  const sp = await searchParams;

  // Already signed in WITH access → straight to the dashboard. A signed-in user
  // without access (e.g. refunded) falls through to the form (no redirect loop).
  const ssr = await createServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (user) {
    const admin = createAdminClient();
    if (await hasPaidAccess(admin, user.id)) redirect("/dashboard");
  }

  return (
    <main className="px-5 py-12">
      <div className="mx-auto w-full max-w-content">
        <h1 className="text-3xl">Sign in</h1>
        <p className="mt-2 text-ink-soft">
          Enter your email and we&apos;ll send a one-time code. No password.
        </p>

        {sp.revoked ? (
          <p className="mt-5 rounded-2xl border border-warn/40 bg-warn/5 p-4 text-sm text-ink">
            Your access has ended. If you believe this is a mistake, reply to your
            confirmation email and we&apos;ll help.
          </p>
        ) : null}

        <div className="mt-6">
          <InAppBrowserBanner />
          <OtpForm initialEmail={typeof sp.email === "string" ? sp.email : ""} />
        </div>

        <p className="mt-8 text-xs text-ink-soft">
          This program is psychoeducational self-help, not medical advice. If
          you&apos;re in crisis, contact your local emergency number or a crisis line.
        </p>
      </div>
    </main>
  );
}
