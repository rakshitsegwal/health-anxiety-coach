// Fail-fast env validation. Runs once at server startup (see instrumentation.ts).
// In production a missing/!malformed required var THROWS so a half-configured
// server never boots. In dev it warns so you can still work on unaffected pages.

const REQUIRED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "RESEND_API_KEY",
  "LEAD_COOKIE_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
] as const;

const RECOMMENDED = [
  "EMAIL_FROM", // has a fallback, but you want your own sender
  "NEXT_PUBLIC_META_PIXEL_ID", // Meta Pixel id (has a hardcoded fallback)
] as const;

export function validateEnv(): void {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED) {
    if (!process.env[key]?.trim()) errors.push(`${key} is missing`);
  }

  // Catch the exact misconfiguration that broke the first e2e run: the Supabase
  // URL must be the bare project origin, NOT include a /rest/v1 path.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url && /\/rest\/v1\/?$/.test(url.trim())) {
    errors.push(
      "NEXT_PUBLIC_SUPABASE_URL must be the bare https://<ref>.supabase.co (remove the /rest/v1 suffix)"
    );
  }

  for (const key of RECOMMENDED) {
    if (!process.env[key]?.trim()) warnings.push(`${key} not set (recommended)`);
  }

  if (warnings.length) {
    console.warn("[env] warnings:\n  - " + warnings.join("\n  - "));
  }

  if (errors.length) {
    const message = "[env] Invalid configuration:\n  - " + errors.join("\n  - ");
    if (process.env.NODE_ENV === "production") {
      throw new Error(message + "\nSet these and redeploy.");
    }
    console.warn(
      message + "\n  (dev: continuing, but these features will fail at runtime)"
    );
    return;
  }

  console.log("[env] all required variables present.");
}
