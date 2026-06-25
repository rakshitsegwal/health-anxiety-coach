"use client";

import { useEffect } from "react";

// App-wide error boundary: a transient DB/API hiccup shows a recoverable state
// instead of a crash. Covers the funnel, the authed area, /login, and /legal.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-content text-center">
        <h1 className="text-2xl">Something went wrong.</h1>
        <p className="mt-2 text-ink-soft">
          A momentary hiccup on our end — your data is safe. Please try again.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-2xl bg-primary px-5 py-3 font-medium text-white hover:bg-primary-deep"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-2xl border border-line px-5 py-3 text-ink hover:border-primary"
          >
            Go home
          </a>
        </div>
        <p className="mt-6 text-xs text-ink-soft">
          If this keeps happening, email us and a real person will help.
        </p>
      </div>
    </main>
  );
}
