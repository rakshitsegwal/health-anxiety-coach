// Runs once when the server starts (Next.js instrumentation hook). We use it to
// validate environment configuration and fail fast in production.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateEnv } = await import("./lib/env");
    validateEnv();
  }
}
