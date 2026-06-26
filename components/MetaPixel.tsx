"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { META_PIXEL_ID, initMetaPixel, pageView } from "@/lib/metaPixel";

// Loads the Meta Pixel once, initializes fbq, and fires PageView on the initial
// load AND on every App-Router route change. Dedup is handled two ways:
//   • initMetaPixel() is idempotent → no duplicate script/init under Strict Mode.
//   • the lastPath ref → exactly one PageView per pathname (Strict Mode re-invokes
//     the effect with the same pathname, which is skipped).
// No analytics.js double-PageView: the base library is NOT auto-firing PageView;
// this component is the single source for it.
export function MetaPixel() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!META_PIXEL_ID || !pathname) return;
    initMetaPixel(); // idempotent — script + fbq('init') run once
    if (lastPath.current === pathname) return; // dedupe Strict Mode / re-render
    lastPath.current = pathname;
    pageView();
  }, [pathname]);

  if (!META_PIXEL_ID) return null;

  // No-JS fallback PageView.
  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        alt=""
        src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
      />
    </noscript>
  );
}
