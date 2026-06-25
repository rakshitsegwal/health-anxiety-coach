import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

// Access == the user has at least one PAID, non-refunded order. A refund flips the
// order to 'refunded', so access is revoked on the very next server check — no
// session juggling required. Used by the (app) guard and dashboard in Phase 3.
export async function hasPaidAccess(
  admin: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await admin
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "paid")
    .limit(1)
    .maybeSingle();
  return !!data;
}
