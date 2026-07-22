"use client";

// components/offers/OffersBackdrop.tsx
// Full-bleed atmosphere layer behind the Offers feed. Mounted as the first
// child of OffersFeed's relative root: `absolute inset-0` spans the panel's
// full scroll height while the inner `sticky top-0 h-[100svh]` keeps the
// animated layers viewport-pinned under native scroll — NO position:fixed
// (the panel sits under transformed framer-motion ancestors, which would
// hijack fixed positioning; sticky is immune).
//
// Layers (back → front):
//   1. Glow blobs — three radial-gradient discs (accent + warm food tone)
//      drifting on 26–40s sine yoyo tweens. Soft edges come from the gradient
//      falloff itself: no CSS filter/blur (the bottom nav owns the site's one
//      permitted blur).
//   2. Drifting mono glyphs — sparse index fragments ("01", "+", "₾", "→")
//      at ~0.07 opacity, ±24–32px vertical drift over 28–44s. Half are
//      hidden below 768px so small screens stay quiet.
//   3. Grain — static SVG feTurbulence tile at 0.05 opacity.
//
// GPU discipline: transforms + opacity only, will-change on the movers,
// pointer-events-none + aria-hidden. prefers-reduced-motion ⇒ zero tweens —
// the layers render as a static composition (spec §3.1 degraded path).

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const GLYPHS = [
  { char: "01", top: "14%", left: "5%", y: 28, dur: 34, mdOnly: false },
  { char: "+", top: "24%", left: "88%", y: -32, dur: 28, mdOnly: true },
  { char: "₾", top: "46%", left: "3%", y: 30, dur: 42, mdOnly: true },
  { char: "→", top: "62%", left: "91%", y: -26, dur: 30, mdOnly: false },
  { char: "04", top: "80%", left: "9%", y: 24, dur: 38, mdOnly: true },
  { char: "+", top: "87%", left: "76%", y: -30, dur: 44, mdOnly: false },
] as const;

const BLOB_DRIFT = [
  { x: "7vw", y: "9vh", scale: 1.12, duration: 26 },
  { x: "-9vw", y: "-7vh", scale: 1.08, duration: 34 },
  { x: "6vw", y: "-11vh", scale: 1.16, duration: 40 },
] as const;

export default function OffersBackdrop() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tweens: gsap.core.Tween[] = [];

      root.querySelectorAll<HTMLElement>("[data-ofb-blob]").forEach((el, i) => {
        const d = BLOB_DRIFT[i % BLOB_DRIFT.length];
        tweens.push(
          gsap.to(el, { ...d, ease: "sine.inOut", yoyo: true, repeat: -1 })
        );
      });

      root.querySelectorAll<HTMLElement>("[data-ofb-glyph]").forEach((el, i) => {
        const g = GLYPHS[i % GLYPHS.length];
        tweens.push(
          gsap.to(el, {
            y: g.y,
            rotation: i % 2 === 0 ? -4 : 4,
            duration: g.dur,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          })
        );
      });

      return () => tweens.forEach((t) => t.kill());
    });

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <div
          data-ofb-blob
          data-tone="accent"
          className="v-ofb-blob"
          style={{ top: "-20%", left: "-14%" }}
        />
        <div
          data-ofb-blob
          data-tone="warm"
          className="v-ofb-blob"
          style={{ top: "28%", right: "-18%" }}
        />
        <div
          data-ofb-blob
          data-tone="accent"
          className="v-ofb-blob"
          style={{ bottom: "-24%", left: "18%" }}
        />

        {GLYPHS.map((g, i) => (
          <span
            key={i}
            data-ofb-glyph
            {...(g.mdOnly ? { "data-md": "" } : {})}
            className="v-ofb-glyph"
            style={{ top: g.top, left: g.left }}
          >
            {g.char}
          </span>
        ))}

        <div className="v-ofb-grain" />
      </div>
    </div>
  );
}
