"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Sticky "start the assessment" bar that appears once the user scrolls past the
// hero. Single CTA per screen; the landing page's only job is to start the quiz.
export function StickyCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 560);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur transition-transform duration-300 ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-content items-center justify-center">
        <Link
          href="/assessment"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-base font-medium text-white hover:bg-primary-deep"
        >
          Take the free 2-minute assessment →
        </Link>
      </div>
    </div>
  );
}
