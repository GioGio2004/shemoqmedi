"use client";

// components/landing/VenuesSpace.tsx
// ─────────────────────────────────────────────────────────────────────────────
// The dedicated MENUS panel — the full venues catalogue in its own space.
// Extracted from the home landing (spec §4.6 section, unchanged inside);
// the home page now links here via the big MenusCTA.
//
// Contracts preserved:
//   • Rendered ALWAYS MOUNTED by LandingPanels (block/hidden, like home) so
//     the pinned ScrollTrigger + SSR venue anchors survive panel switches.
//   • Reuses the .ml-* styles from MotionLanding's mounted <style> tag.
//   • Own gsap.context recreates the mobile grayscale color-band that
//     MotionLanding's root effect provided when Venues lived inside it.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Venues from "./sections/Venues";
import PortfolioSheet from "./sections/PortfolioSheet";
import type { LandingVenue } from "./MotionLanding";

export default function VenuesSpace({
  venues,
  locale,
}: {
  venues: LandingVenue[];
  locale: string;
}) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<{ venue: LandingVenue; origin: DOMRect } | null>(null);
  const openVenue = useCallback(
    (v: LandingVenue, el: HTMLElement) =>
      setActive({ venue: v, origin: el.getBoundingClientRect() }),
    []
  );

  // Mobile grayscale color-band for card images (mirror of the effect the
  // section relied on inside MotionLanding's root context).
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia(el);
    const ctx = gsap.context(() => {
      mm.add("(max-width: 1023px)", () => {
        const triggers = gsap.utils
          .toArray<HTMLElement>(".v-img[data-band-m]", el)
          .map((img) => {
            const st = ScrollTrigger.create({
              trigger: img,
              start: "top 65%",
              end: "bottom 35%",
              onToggle: (self) => img.classList.toggle("is-color", self.isActive),
            });
            return { st, img };
          });
        return () =>
          triggers.forEach(({ st, img }) => {
            st.kill();
            img.classList.remove("is-color");
          });
      });
      gsap.utils.toArray<HTMLElement>(".v-img[data-band]", el).forEach((img) => {
        ScrollTrigger.create({
          trigger: img,
          start: "top 65%",
          end: "bottom 35%",
          onToggle: (self) => img.classList.toggle("is-color", self.isActive),
        });
      });
      setTimeout(() => ScrollTrigger.refresh(), 400);
    }, el);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, [venues.length]);

  return (
    <main ref={root} className="ml-root ml-vspace">
      <Venues venues={venues} locale={locale} onOpenVenue={openVenue} />

      {active && (
        <PortfolioSheet
          venue={active.venue}
          origin={active.origin}
          onClose={() => setActive(null)}
        />
      )}
    </main>
  );
}
