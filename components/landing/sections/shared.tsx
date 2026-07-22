"use client";

// components/landing/sections/shared.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Small shared pieces for the RULED landing sections: the roll-hover label,
// the Unsplash <img> helper (grayscale law + responsive srcset), and the
// verified image set from design spec §6.
// ─────────────────────────────────────────────────────────────────────────────

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ── Verified Unsplash set (spec §6) ─────────────────────────────────────── */

const U = (id: string) =>
  `https://images.unsplash.com/${id}?q=80&w=1600&auto=format&fit=crop`;

export const IMG = {
  hero: U("photo-1414235077428-338989a2e8c0"), // fine-dining plate, dark room
  wall: [
    U("photo-1504674900247-0877df9cc836"), // rustic dish overhead
    U("photo-1466978913421-dad2ebd01d17"), // dark japanese table spread
    U("photo-1467003909585-2f8a72700288"), // salmon, dark plate
    U("photo-1476224203421-9ac39bcb3327"), // noodle bowl overhead
    U("photo-1555396273-367ea4eb4db5"), // mezze spread
    U("photo-1551024506-0bccd828d307"), // dessert, dark ground
  ],
  concierge: U("photo-1509042239860-f550ce710b93"), // barista pour, black
  venueFallbacks: [
    U("photo-1517248135467-4c7edcad34c4"), // restaurant interior
    U("photo-1521017432531-fbd92d768814"), // warm cafe room
    U("photo-1559925393-8be0ec4767c8"), // coffee-bar counter
    U("photo-1554118811-1e0d58224f24"), // cafe counter detail
  ],
} as const;

/* ── Roll-hover label (spec §3.3 roll-hover) ─────────────────────────────── */

/**
 * Duplicated label inside an overflow-hidden column; a `.ml-rollhost`
 * ancestor's :hover translates the column -50% (one line). The duplicate is
 * aria-hidden. Pure CSS — reduced-motion disables the transition.
 */
export function Roll({ children }: { children: ReactNode }) {
  return (
    <span className="ml-roll">
      <span className="ml-roll-in">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
    </span>
  );
}

/* ── Unsplash image under the grayscale-at-rest law (spec §4.2) ──────────── */

export function UImg({
  src,
  alt,
  className,
  sizes = "(max-width: 1023px) 100vw, 40vw",
  priority = false,
  band = "all",
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  /** Above-the-fold: eager + fetchPriority high (hero image only). */
  priority?: boolean;
  /**
   * Scroll color-band behavior (spec §4.2): "all" → in-band color on every
   * viewport; "mobile" → band below 1024px only (desktop stays hover-driven,
   * used by venue cards); "none" → hover only.
   */
  band?: "all" | "mobile" | "none";
}) {
  const small = src.includes("w=1600") ? src.replace("w=1600", "w=800") : src;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={`${small} 800w, ${src} 1600w`}
      sizes={sizes}
      alt={alt}
      className={cn("v-img", className)}
      {...(band === "all" ? { "data-band": "" } : {})}
      {...(band === "mobile" ? { "data-band-m": "" } : {})}
      {...(priority
        ? { fetchPriority: "high" as const }
        : { loading: "lazy" as const, decoding: "async" as const })}
    />
  );
}
