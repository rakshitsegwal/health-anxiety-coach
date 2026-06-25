"use client";

import { useEffect } from "react";
import { Analytics } from "@/lib/analytics";

// Fires `day_1_started` once when Day 1 opens — the activation/PMF leading
// indicator.
export function Day1Pixel() {
  useEffect(() => {
    Analytics.day1Started();
  }, []);
  return null;
}
