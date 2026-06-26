"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Analytics } from "@/lib/analytics";

// Loads Razorpay checkout.js, creates the order server-side, opens checkout
// (UPI/wallet first, email prefilled), and on success verifies SERVER-SIDE before
// proceeding. Purchase fires on the payment-success callback. If /verify can't
// finalize (e.g. session mint), we still route to thank-you with ?pending=1 — the
// webhook reconciles and the thank-you page polls + signs in via OTP.
const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, cb: (resp: unknown) => void) => void;
    };
  }
}

function loadScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function RazorpayButton({ email }: { email: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadScript();
  }, []);

  async function pay() {
    setLoading(true);
    setError(null);
    try {
      Analytics.initiateCheckout();

      const ok = await loadScript();
      if (!ok || !window.Razorpay) throw new Error("script");

      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("order");
      const data = await res.json();

      const toThankYou = (orderId: string, pending = false) =>
        router.push(
          `/thank-you?order_id=${encodeURIComponent(orderId)}${
            pending ? "&pending=1" : ""
          }`
        );

      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency,
        name: "The Symptom Spiral Reset",
        description: "14-day program — one-time",
        prefill: { email: data.email, method: "upi" },
        config: {
          display: {
            sequence: ["block.upi", "block.wallet", "block.card", "block.netbanking"],
            preferences: { show_default_blocks: true },
          },
        },
        theme: { color: "#2C7A6B" },
        handler: async (resp: unknown) => {
          const r = resp as {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          };
          // Razorpay only calls handler on a successful payment → fire Purchase.
          Analytics.purchase();
          // Cap the wait: if /verify is slow, don't freeze the buyer on checkout —
          // proceed to thank-you, where the webhook + status poll back it up.
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 12000);
          try {
            const v = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: r.razorpay_order_id,
                razorpay_payment_id: r.razorpay_payment_id,
                razorpay_signature: r.razorpay_signature,
              }),
              signal: ctrl.signal,
            });
            const body = v.ok ? await v.json() : null;
            toThankYou(r.razorpay_order_id, !body?.sessionEstablished);
          } catch {
            toThankYou(r.razorpay_order_id, true);
          } finally {
            clearTimeout(timer);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });

      rzp.on("payment.failed", () => {
        setError("That payment didn't go through. Please try again.");
        setLoading(false);
      });
      rzp.open();
    } catch {
      setError("Couldn't start checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={pay}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-lg font-medium text-white hover:bg-primary-deep disabled:opacity-60"
      >
        {loading ? "Opening secure checkout…" : "Complete my purchase — ₹999"}
      </button>
      {error ? <p className="mt-3 text-sm text-warn">{error}</p> : null}
      <p className="mt-3 text-center text-sm text-ink-soft">
        Try it for 30 days. If it&apos;s not for you, email us for a full refund — no
        hoops.
      </p>
    </div>
  );
}
