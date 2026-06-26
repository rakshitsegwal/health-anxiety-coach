import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export type CookieToSet = { name: string; value: string; options: CookieOptions };

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
  const t0 = Date.now();

  // 1. Load the order — the source of truth for the buyer's email.
  const { data: order } = await admin
    .from("orders")
    .select("email, user_id")
    .eq("razorpay_order_id", opts.razorpayOrderId)
    .maybeSingle();
  if (!order) {
    console.error(`[provision] order not found: ${opts.razorpayOrderId}`);
    return { userId: null, email: null };
  }

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

  console.log(`[provision] ${opts.razorpayOrderId} ${Date.now() - t0}ms user=ok`);
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
  const tCreate = Date.now();
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  console.log(
    `[provision] createUser ${Date.now() - tCreate}ms ${error ? "ERR " + error.message : "ok"}`
  );
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
// Seamless post-payment session. generateLink yields a token we immediately verify
// server-side (nothing is emailed) to obtain a session; we CAPTURE the resulting
// auth cookies and RETURN them so the caller sets them EXPLICITLY on the response.
// This is the fix for the prod bug where the implicit next/headers cookie store
// silently failed to attach the Set-Cookie headers — reporting success while the
// browser got no session, forcing the slow OTP fallback. Fully timed/logged so
// production shows exactly which step is slow or failing. NOT a user-facing magic
// link, so the OTP-only rule is preserved. On any failure → caller falls back to
// the webhook + OTP path.
// ─────────────────────────────────────────────────────────────────────────────
export async function mintSession(
  email: string
): Promise<{ ok: boolean; cookies: CookieToSet[] }> {
  const t0 = Date.now();
  const collected: CookieToSet[] = [];
  try {
    const admin = createAdminClient();
    const tGen = Date.now();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    console.log(
      `[mintSession] generateLink ${Date.now() - tGen}ms ${error ? "ERR " + error.message : "ok"}`
    );
    const tokenHash = data?.properties?.hashed_token;
    if (error || !tokenHash) return { ok: false, cookies: [] };

    // SSR client whose setAll only CAPTURES the cookies (it does not write to any
    // store); the caller sets them on the actual NextResponse.
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(toSet: CookieToSet[]) {
            for (const c of toSet) collected.push(c);
          },
        },
      }
    );
    const tVer = Date.now();
    const { error: vErr } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "magiclink",
    });
    console.log(
      `[mintSession] verifyOtp ${Date.now() - tVer}ms ${
        vErr ? "ERR " + vErr.message : `ok cookies=${collected.length}`
      }`
    );
    if (vErr || collected.length === 0) return { ok: false, cookies: [] };

    console.log(`[mintSession] total ${Date.now() - t0}ms ok cookies=${collected.length}`);
    return { ok: true, cookies: collected };
  } catch (e) {
    console.error(
      `[mintSession] threw after ${Date.now() - t0}ms:`,
      e instanceof Error ? e.message : e
    );
    return { ok: false, cookies: [] };
  }
}
