import "server-only";
import { createClient } from "@supabase/supabase-js";

// SERVICE-ROLE client — bypasses RLS. SERVER ONLY. Never import in client code.
// Used for: writing leads, creating/updating orders, provisioning users +
// profiles after payment, and webhook reconciliation.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
