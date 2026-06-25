import { createBrowserClient } from "@supabase/ssr";

// Browser client (anon key). All access is RLS-enforced: a user can only
// read/write their own rows. Used for OTP auth and authed reads in client islands.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
