"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { MetaPixel } from "@/lib/metaPixel";

// Fires Pixel ViewContent once per route. Keyed on pathname (not just a mount
// guard) so it fires exactly once per page even if React reuses the instance
// across a navigation, and once under React Strict Mode (the lastFired ref has no
// cleanup that would reset it). Only the fixed content_name/category go to Meta.
export function ViewContentPixel() {
  const pathname = usePathname();
  const lastFired = useRef<string | null>(null);
  useEffect(() => {
    if (lastFired.current === pathname) return;
    lastFired.current = pathname;
    MetaPixel.viewContent();
  }, [pathname]);
  return null;
}
