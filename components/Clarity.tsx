"use client";

import Script from "next/script";

// Microsoft Clarity (session replay + heatmaps). Loaded once via next/script
// (deduped by the stable `id`, afterInteractive so it never costs LCP). Clarity's
// own snippet guards against double-init and handles SPA navigation itself, so no
// per-route wiring is needed.
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "xd8vzg0ua8";

export function Clarity() {
  if (!CLARITY_ID) return null;
  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${CLARITY_ID}");`}
    </Script>
  );
}
