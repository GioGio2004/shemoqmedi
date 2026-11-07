"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * The header menu is a native <details>, which stays open across client-side
 * navigations because the header stays mounted. Close it when the path changes.
 */
export function MenuCloser() {
  const pathname = usePathname();
  useEffect(() => {
    document.querySelectorAll<HTMLDetailsElement>("header details[open]").forEach((d) => {
      d.open = false;
    });
  }, [pathname]);
  return null;
}
