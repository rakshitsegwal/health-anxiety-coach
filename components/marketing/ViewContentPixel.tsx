"use client";

import { useEffect } from "react";
import { Analytics } from "@/lib/analytics";

// Fires Pixel ViewContent once on mount. `name` is a neutral content tag
// ("lp" | "results") — never a sensitive trait.
export function ViewContentPixel({ name }: { name: string }) {
  useEffect(() => {
    Analytics.viewContent(name);
  }, [name]);
  return null;
}
