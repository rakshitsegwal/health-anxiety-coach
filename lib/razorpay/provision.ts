import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

// ─────────────────────────────────────────────────────────────────────────────
// Idempotent post-payment provisioning. Both /verify (client callback) and
// /webhook (async) can call this; a paid user is provisioned EXACTLY ONCE across
// the race. Guards: the order status flip is conditional, get-or-create-user is
// race-safe, and the profile is upserted with ON CONFLICT DO NOTHING.
// ─────────────────────────────────────────────────────────────────────────────
export async function provisionPaidOrder(opts: {
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
}): Promise<{ userId: string | null; email: string | null }> {
  const admin = createAdminClient();

  // 1. Load the order — the source of truth for the buyer's email.
  const { data: order } = await admin
    .from("orders")
    .select("email, user_id")
    .eq("razorpay_order_id", opts.razorpayOrderId)
    .maybeSingle();
  if (!order) return { userId: null, email: null };

  // 2. Idempotently mark paid — only the first writer flips 'created' → 'paid'.
  await admin
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      razorpay_payment_id: opts.razorpayPaymentId ?? null,
    })
    .eq("razorpay_order_id", opts.razorpayOrderId)
    .neq("status", "paid");

  // 3. Get-or-create the auth user (buy first, register after).
  const userId = await getOrCreateUser(admin, order.email);
  if (!userId) return { userId: null, email: order.email };

  // 4. Ensure the profile exists, baseline copied from the lead (no-op if present).
  await ensureProfile(admin, userId, order.email);

  // 5. Link the order to the user (only if not already linked).
  if (!order.user_id) {
    await admin
      .from("orders")
      .update({ user_id: userId })
      .eq("razorpay_order_id", opts.razorpayOrderId)
      .is("user_id", null);
  }

  return { userId, email: order.email };
}

async function getOrCreateUser(
  admin: SupabaseClient,
  email: string
): Promise<string | null> {
  // Fast path: a profile already exists for this email (repeat provisioning / the
  // other race winner already created the user).
  const { data: existing } = await admin
    .from("profiles")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();
  if (existing?.user_id) return existing.user_id;

  // Create the user. They paid, so the email is pre-confirmed; login afterwards is
  // OTP only (no password, no emailed magic link).
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (created?.user) return created.user.id;

  // "Email already registered" (or a race with the other path): find the user.
  if (error) {
    const found = await findUserByEmail(admin, email);
    if (found) return found;
  }
  console.error("[provision] could not get/create user:", error?.message);
  return null;
}

// supabase-js admin has no get-user-by-email — paginate listUsers (bounded; fine
// at MVP scale). At larger scale, back this with a DB lookup instead.
async function findUserByEmail(
  admin: SupabaseClient,
  email: string
): Promise<string | null> {
  const target = email.toLowerCase();
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) break;
    const hit = data.users.find((u) => u.email?.toLowerCase() === target);
    if (hit) return hit.id;
    if (data.users.length < 200) break;
  }
  return null;
}

async function ensureProfile(
  admin: SupabaseClient,
  userId: string,
  email: string
): Promise<void> {
  // Copy the Day-0 baseline from the most recent lead for this email.
  const { data: lead } = await admin
    .from("leads")
    .select("assessment_score, band")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  await admin.from("profiles").upsert(
    {
      user_id: userId,
      email,
      baseline_score: lead?.assessment_score ?? null,
      baseline_band: lead?.band ?? null,
    },
    { onConflict: "user_id", ignoreDuplicates: true }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Seamless post-payment session. We use generateLink ONLY to obtain a token we
// immediately verify server-side — nothing is emailed — which sets the auth
// cookies on this response so the buyer lands in /dashboard already signed in.
// NOT a user-facing magic link, so the hard rule (no emailed magic links / OAuth)
// is preserved. If anything here fails, the caller falls back to OTP login.
// ─────────────────────────────────────────────────────────────────────────────
export async function mintSession(email: string): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    const tokenHash = data?.properties?.hashed_token;
    if (error || !tokenHash) {
      console.error("[provision] generateLink failed:", error?.message);
      return false;
    }

    // The SSR client writes session cookies via the request's cookie store.
    const ssr = await createServerClient();
    const { error: vErr } = await ssr.auth.verifyOtp({
      token_hash: tokenHash,
      type: "magiclink",
    });
    if (vErr) {
      console.error("[provision] verifyOtp failed:", vErr.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[provision] mintSession threw:", e);
    return false;
  }
}
