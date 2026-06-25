"use client";

import { useEffect, useState } from "react";
import { isInAppBrowser } from "@/lib/inAppBrowser";

// Instagram/Facebook in-app browsers can mishandle cookies/sessions. OTP itself
// works in them (you type a code), but we still nudge users to open in their real
// browser for the most reliable sign-in, and give them a one-tap way to copy the
// link out.
export function InAppBrowserBanner() {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setShow(isInAppBrowser());
  }, []);

  if (!show) return null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the instruction text still tells them what to do */
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-warn/40 bg-warn/5 p-4 text-sm">
      <p className="text-ink">
        You&apos;re viewing this inside an app&apos;s browser. For sign-in to work
        reliably, open this page in your normal browser (Safari or Chrome) — use the
        &ldquo;⋯&rdquo; menu and choose &ldquo;Open in browser.&rdquo;
      </p>
      <button
        type="button"
        onClick={copyLink}
        className="mt-3 rounded-xl border border-line bg-surface px-4 py-2 text-ink hover:border-primary"
      >
        {copied ? "Link copied ✓" : "Copy link"}
      </button>
    </div>
  );
}
