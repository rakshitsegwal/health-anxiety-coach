"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

// §7a soft gate — placed after the last question, before the results reveal (peak
// curiosity). Email is the only typed field in the whole funnel. Honest framing +
// DPDP-aware consent at capture.
export function EmailGate({
  onSubmit,
  submitting,
  error,
}: {
  onSubmit: (email: string) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [email, setEmail] = useState("");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid && !submitting) onSubmit(email.trim());
      }}
    >
      <h1 className="text-2xl sm:text-3xl">Your results are ready.</h1>
      <p className="mt-3 text-ink-soft">
        Where should we send your Spiral Score and your personalized reset plan?
        We&apos;ll email a copy so you don&apos;t lose it.
      </p>

      <label htmlFor="email" className="sr-only">
        Email address
      </label>
      <input
        id="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-6 w-full rounded-2xl border border-line bg-surface px-5 py-4 text-lg outline-none focus:border-primary"
      />

      {error ? <p className="mt-3 text-sm text-warn">{error}</p> : null}

      <div className="mt-5">
        <Button type="submit" size="lg" disabled={!valid || submitting}>
          {submitting ? "Saving…" : "Show my results →"}
        </Button>
      </div>

      <p className="mt-4 text-sm text-ink-soft">
        No spam, ever. Unsubscribe anytime. Your answers stay private.
      </p>
      <p className="mt-2 text-xs text-ink-soft">
        By continuing you agree to our{" "}
        <Link href="/legal/privacy" className="underline underline-offset-4">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/legal/terms" className="underline underline-offset-4">
          Terms
        </Link>
        .
      </p>
    </form>
  );
}
