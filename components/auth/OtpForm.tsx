"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

// Email → 6-digit OTP → session → dashboard. No password, no OAuth, no magic
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
      setError(
        "We couldn't find an account for that email. If you've purchased, use the same email you checked out with."
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
          We sent a 6-digit code to <strong className="text-ink">{email}</strong>.
          Enter it below.
        </p>
        <label htmlFor="otp" className="sr-only">
          6-digit code
        </label>
        <input
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="••••••"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="mt-5 w-full rounded-2xl border border-line bg-surface px-5 py-4 text-center text-2xl tracking-[0.4em] outline-none focus:border-primary"
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
