"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

// Email → one-time code → session → dashboard. No password, no OAuth, no magic
// link. shouldCreateUser:false so only provisioned buyers can sign in (a
// non-buyer who only got the free Day 1 has no account).
export function OtpForm({ initialEmail = "" }: { initialEmail?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    if (!emailValid) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: false },
    });
    setLoading(false);
    if (error) {
      // Tailor the message: rate-limit (wait), genuinely-no-account, or a transient
      // send failure. Never tell a paying customer "no account" for a send error.
      const msg = error.message?.toLowerCase() ?? "";
      const rateLimited =
        error.status === 429 ||
        msg.includes("rate limit") ||
        msg.includes("too many") ||
        msg.includes("exceeded");
      const notFound =
        error.status === 422 ||
        msg.includes("signups not allowed") ||
        msg.includes("not allowed") ||
        msg.includes("user not found");
      setError(
        rateLimited
          ? "Too many attempts right now — please wait a couple of minutes, then request a new code."
          : notFound
            ? "We couldn't find an account for that email. Use the same email you checked out with."
            : "We couldn't send your sign-in code right now — please try again in a moment. If it keeps failing, email rakshit1352@gmail.com and we'll get you in."
      );
      return;
    }
    setStep("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().length < 6) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: "email",
    });
    if (error) {
      setLoading(false);
      setError("That code didn't match. Check it and try again.");
      return;
    }
    // Session cookies are now set by the browser client — go to the dashboard.
    router.replace("/dashboard");
    router.refresh();
  }

  if (step === "code") {
    return (
      <form onSubmit={verifyCode}>
        <p className="text-ink-soft">
          We sent a code to <strong className="text-ink">{email}</strong>. Enter it
          below.
        </p>
        <label htmlFor="otp" className="sr-only">
          Verification code
        </label>
        <input
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={10}
          placeholder="Enter the code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="mt-5 w-full rounded-2xl border border-line bg-surface px-5 py-4 text-center text-2xl tracking-[0.3em] outline-none focus:border-primary"
        />
        {error ? <p className="mt-3 text-sm text-warn">{error}</p> : null}
        <div className="mt-5">
          <Button type="submit" size="lg" disabled={loading || code.length < 6}>
            {loading ? "Verifying…" : "Sign in →"}
          </Button>
        </div>
        <button
          type="button"
          onClick={() => {
            setStep("email");
            setCode("");
            setError(null);
          }}
          className="mt-3 text-sm text-ink-soft hover:text-ink"
        >
          ← Use a different email
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={requestCode}>
      <label htmlFor="login-email" className="sr-only">
        Email address
      </label>
      <input
        id="login-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-2xl border border-line bg-surface px-5 py-4 text-lg outline-none focus:border-primary"
      />
      {error ? <p className="mt-3 text-sm text-warn">{error}</p> : null}
      <div className="mt-5">
        <Button type="submit" size="lg" disabled={loading || !emailValid}>
          {loading ? "Sending…" : "Email me a sign-in code →"}
        </Button>
      </div>
    </form>
  );
}
