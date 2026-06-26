"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MetaPixel } from "@/lib/metaPixel";

// One-click refund under the guarantee, with a single confirm step (this ends
// access, so we don't want accidental taps). Fires refund_requested on success.
export function RefundRequest() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function request() {
    setStatus("sending");
    try {
      const res = await fetch("/api/refund-request", { method: "POST" });
      if (!res.ok) throw new Error("failed");
      MetaPixel.refundRequested();
      setStatus("done");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="text-sm text-ink-soft">
        Your refund is being processed. Your access ends once it completes — check your
        email for confirmation.
      </p>
    );
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
      >
        Request a refund
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-bg p-4">
      <p className="text-sm text-ink">
        Request a full refund? This ends your access to the program.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={request}
          disabled={status === "sending"}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-deep disabled:opacity-60"
        >
          {status === "sending" ? "Processing…" : "Yes, refund me"}
        </button>
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            setStatus("idle");
          }}
          className="rounded-xl border border-line px-4 py-2 text-sm text-ink hover:border-primary"
        >
          Cancel
        </button>
      </div>
      {status === "error" ? (
        <p className="mt-2 text-sm text-warn">
          Couldn&apos;t process that — please email support and we&apos;ll sort it out.
        </p>
      ) : null}
    </div>
  );
}
