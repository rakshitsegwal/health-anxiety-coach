"use client";

import { useEffect, useRef } from "react";
import { MetaPixel } from "@/lib/metaPixel";

// Fires `day_1_started` once when Day 1 opens — the activation/PMF leading
// indicator. Ref-guarded so it fires once even under React Strict Mode.
export function Day1Pixel() {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    MetaPixel.dayStarted();
  }, []);
  return null;
}
