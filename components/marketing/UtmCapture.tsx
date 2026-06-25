"use client";

import { useEffect } from "react";
import { captureUtm } from "@/lib/utm";

// Invisible island: stashes UTM params on landing so the lead carries attribution.
export function UtmCapture() {
  useEffect(() => {
    captureUtm();
  }, []);
  return null;
}
