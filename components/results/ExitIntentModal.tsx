"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

// §mod-3 — conversion-recovery offer on the results page. Email is already
// captured at the gate, so this is "get Day 1 free" with the email pre-filled.
// Mobile-first triggers: back-button/history, inactivity, scroll-up; desktop adds
// mouse-leave. Shows once per session; suppressed for already-sent / converting.
const SHOWN_KEY = "ssr_exit_shown";
const SENT_KEY = "ssr_free_day1_sent";
const INACTIVITY_MS = 25_000;

export function ExitIntentModal({ email: initialEmail }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(SHOWN_KEY) || localStorage.getItem(SENT_KEY)) return;
    } catch {
      /* storage blocked — still allow the offer */
    }

    let armed = true;
    const trigger = () => {
      if (!armed) return;
      armed = false;
      try {
        sessionStorage.setItem(SHOWN_KEY, "1");
      } catch {
        /* best-effort */
      }
      setOpen(true);
    };

    // Back-button / history interception (the dominant mobile exit).
    history.pushState(null, "", location.href);
    const onPop = () => {
      trigger();
      history.pushState(null, "", location.href);
    };
    window.addEventListener("popstate", onPop);

    // Inactivity.
    let idle = window.setTimeout(trigger, INACTIVITY_MS);
    const resetIdle = () => {
      window.clearTimeout(idle);
      idle = window.setTimeout(trigger, INACTIVITY_MS);
    };
    const activity: (keyof WindowEventMap)[] = ["touchstart", "keydown", "click"];
    activity.forEach((e) => window.addEventListener(e, resetIdle, { passive: true }));

    // Fast scroll-up near the top of the page.
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (lastY - y > 48 && y < 240) trigger();
      lastY = y;
      resetIdle();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Desktop: cursor leaves the top of the viewport.
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };
    document.addEventListener("mouseout", onMouseOut);

    return () => {
      window.removeEventListener("popstate", onPop);
      activity.forEach((e) => window.removeEventListener(e, resetIdle));
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onMouseOut);
      window.clearTimeout(idle);
    };
  }, []);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/free-day1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error("failed");
      try {
        localStorage.setItem(SENT_KEY, "1");
      } catch {
        /* best-effort */
      }
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Modal open={open} onClose={() => setOpen(false)} labelledBy="exit-title">
      {status === "sent" ? (
        <div className="text-center">
          <h2 id="exit-title" className="text-2xl">
            Day 1 is on its way.
          </h2>
          <p className="mt-3 text-ink-soft">
            Check your inbox for &ldquo;map your spiral&rdquo; — your free first day.
            When you&apos;re ready for the whole reset, your results are right here.
          </p>
          <div className="mt-5">
            <Button onClick={() => setOpen(false)} variant="secondary">
              Back to my results
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={send}>
          <h2 id="exit-title" className="text-2xl">
            Not ready yet? Get Day 1 free.
          </h2>
          <p className="mt-3 text-ink-soft">
            Day 1 is &ldquo;map your spiral&rdquo; — the five-minute exercise the whole
            program is built on. We&apos;ll email it to you, free.
          </p>
          <label htmlFor="exit-email" className="sr-only">
            Email address
          </label>
          <input
            id="exit-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            placeholder="Email address"
            className="mt-5 w-full rounded-2xl border border-line bg-bg px-5 py-3.5 text-base outline-none focus:border-primary"
          />
          {status === "error" ? (
            <p className="mt-3 text-sm text-warn">
              Couldn&apos;t send just now — please try again.
            </p>
          ) : null}
          <div className="mt-5">
            <Button type="submit" size="lg" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Email me Day 1 free"}
            </Button>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 w-full text-center text-sm text-ink-soft hover:text-ink"
          >
            No thanks, take me back
          </button>
        </form>
      )}
    </Modal>
  );
}
