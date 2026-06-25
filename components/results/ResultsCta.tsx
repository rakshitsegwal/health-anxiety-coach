"use client";

import Link from "next/link";

// The one-tap bridge from results to checkout. Clicking it also suppresses the
// exit-intent modal for this session (the user is converting, not leaving).
export function ResultsCta() {
  return (
    <Link
      href="/checkout"
      onClick={() => {
        try {
          sessionStorage.setItem("ssr_exit_shown", "1");
        } catch {
          /* best-effort */
        }
      }}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-lg font-medium text-white hover:bg-primary-deep sm:w-auto"
    >
      See my 14-day reset →
    </Link>
  );
}
