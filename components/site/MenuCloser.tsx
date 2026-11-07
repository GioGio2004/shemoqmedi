"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const OPEN_MENU = "header details[open]";

function closeAll() {
  document.querySelectorAll<HTMLDetailsElement>(OPEN_MENU).forEach((d) => {
    d.open = false;
  });
}

/**
 * The header menu is a native <details>, which on its own only closes when
 * its summary is clicked again. Close it when the page changes, on a click
 * outside it, on Escape (focus goes back to the trigger), and when one of
 * its links is clicked (that also covers a link to the current page, where
 * the path does not change).
 */
export function MenuCloser() {
  const pathname = usePathname();
  useEffect(closeAll, [pathname]);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      document.querySelectorAll<HTMLDetailsElement>(OPEN_MENU).forEach((d) => {
        if (!d.contains(e.target as Node)) d.open = false;
      });
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const open = document.querySelector<HTMLDetailsElement>(OPEN_MENU);
      if (!open) return;
      open.open = false;
      open.querySelector("summary")?.focus();
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.(`${OPEN_MENU} a`)) closeAll();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
