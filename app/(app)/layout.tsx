import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasPaidAccess } from "@/lib/access";
import { SignOutButton } from "@/components/auth/SignOutButton";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store"; // never cache the gate/data reads here

// Authed-area guard (defense-in-depth). The AUTHORITATIVE paid-access gate is in
// middleware.ts — it runs on every request, including soft-nav RSC fetches, which
// this layout does NOT (Next preserves layouts across in-segment navigations). We
// keep the check here too for direct/hard requests. A refund → order 'refunded' →
// hasPaidAccess false → revoked.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ssr = await createServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  if (!(await hasPaidAccess(admin, user.id))) redirect("/login?revoked=1");

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-content items-center justify-between px-5 py-3">
          <Link href="/dashboard" className="font-display text-ink">
            The Symptom Spiral Reset
          </Link>
          <SignOutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
