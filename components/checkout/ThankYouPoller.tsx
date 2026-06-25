"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Polls order status when the client callback may have been lost (in-app browser
// closed mid-redirect). Once the webhook settles the order, refresh so the server
// component re-renders into the confirmed / sign-in state.
export function ThankYouPoller({ orderId }: { orderId: string }) {
  const router = useRouter();

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      try {
        const r = await fetch(
          `/api/order-status?order_id=${encodeURIComponent(orderId)}`,
          { cache: "no-store" }
        );
        const d = await r.json();
        if (["paid", "refunded", "failed"].includes(d.status)) {
          router.refresh();
          return;
        }
      } catch {
        /* transient — keep polling */
      }
      if (!stopped) timer = setTimeout(tick, 2500);
    };

    timer = setTimeout(tick, 2500);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [orderId, router]);

  return (
    <p className="text-sm text-ink-soft" role="status">
      Confirming your payment…
    </p>
  );
}
