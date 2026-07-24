"use client";

// components/landing/MotionLanding.tsx
// ─────────────────────────────────────────────────────────────────────────────
// VOLOO by Shemoqmedi — the RULED landing (design spec v1.0).
//
// A dark, editorial, line-ruled system: one grotesque display voice
// (Space Grotesk), one mono data voice, one edible accent (#D8FF3A),
// 1px hairlines everywhere, everything else photography under the
// grayscale-at-rest law. Sections (order is the spec §4 contract):
//
//   Nav → Hero (#top) → Marquee → How (#how, bone) → Concierge (#concierge,
//   bone) → Venues (#venues, dark, pinned horizontal) → Waitlist (#waitlist)
//   → Footer (05 — CONTACT)
//
// This component stays ALWAYS MOUNTED inside LandingPanels (block/hidden
// toggle — never unmount) and keeps its export signature
// { venues, locale, onShowOffers }. The <style>{ML_CSS}</style> template
// literal must stay mounted: LandingPanels' Offers navbar clone depends on it.
//
// SEO contract: venue names/links are real anchors in the initial SSR markup;
// every entrance is gsap.from() so no-JS renders the final visible state.
// Reduced-motion collapses all reveals to quiet fades (see Reveal/DecorLines)
// and skips pins, marquee motion, parallax and the theme-flip tween.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ML_CSS } from "./ml-css";
import LandingNav from "./sections/LandingNav";
import Hero from "./sections/Hero";
import LandingMarquee from "./sections/LandingMarquee";
import HowItWorks from "./sections/HowItWorks";
import Concierge from "./sections/Concierge";
import MenusCTA from "./sections/MenusCTA";
import Waitlist from "./sections/Waitlist";
import FAQ from "./sections/FAQ";
import LandingFooter from "./sections/LandingFooter";

// HeroScene is retired from the hero (spec §4.2 — bundle win on mobile) but
// the dynamic({ ssr: false }) import stays per the codebase contract; the
// chunk never loads because the component is never rendered.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HeroScene = dynamic(() => import("@/components/landing/HeroScene"), {
  ssr: false,
});

// ── Types ───────────────────────────────────────────────────────────────────
export type LandingVenue = {
  _id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
};

// Theme-flip palettes (spec §1.1) — tweened on .ml-root's custom properties.
const PALETTE = {
  dark: {
    "--bg": "#0A0A0A",
    "--raise": "#111110",
    "--ink": "#F4F3F0",
    "--mut": "rgba(244,243,240,.62)",
    "--faint": "rgba(244,243,240,.34)",
    "--line": "rgba(244,243,240,.14)",
  },
  bone: {
    "--bg": "#EDEBE6",
    "--raise": "#E4E1DA",
    "--ink": "#141412",
    "--mut": "rgba(20,20,18,.6)",
    "--faint": "rgba(20,20,18,.34)",
    "--line": "rgba(20,20,18,.16)",
  },
} as const;

// ── Landing ─────────────────────────────────────────────────────────────────
export default function MotionLanding({
  venues,
  locale,
  onShowOffers,
  onShowMenus,
}: {
  venues: LandingVenue[];
  locale: string;
  onShowOffers?: () => void;
  onShowMenus?: () => void;
}) {
  const root = useRef<HTMLElement>(null);

  const hasVenues = venues.length > 0;

  // Root motion context — theme-flip + grayscale color band + the refresh
  // nudge. Keyed on venues.length (venue cards change ScrollTrigger layout).
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const mm = gsap.matchMedia(el);

    const ctx = gsap.context(() => {
      // ── theme-flip (spec §1.1 / §3.3): one trigger per bone section,
      //    tweening the root palette vars 0.6s power2.inOut.
      const flipTo = (theme: "dark" | "bone", instant: boolean) =>
        gsap.to(el, {
          ...PALETTE[theme],
          duration: instant ? 0 : 0.6,
          ease: "power2.inOut",
          overwrite: "auto",
        });

      const makeFlips = (instant: boolean) => {
        gsap.utils.toArray<HTMLElement>('[data-flip="bone"]', el).forEach((sec) => {
          ScrollTrigger.create({
            trigger: sec,
            start: "top 55%",
            end: "bottom 55%",
            onEnter: () => flipTo("bone", instant),
            onLeave: () => flipTo("dark", instant),
            onEnterBack: () => flipTo("bone", instant),
            onLeaveBack: () => flipTo("dark", instant),
          });
        });
      };

      mm.add("(prefers-reduced-motion: no-preference)", () => makeFlips(false));
      mm.add("(prefers-reduced-motion: reduce)", () => makeFlips(true));

      // ── grayscale-at-rest color band (spec §4.2): inside the
      //    top 65% → bottom 35% band an image is in color; outside it returns
      //    to mono. Venue cards opt into the band on mobile only
      //    ([data-band-m]) — desktop keeps hover-driven color.
      const band = (img: HTMLElement) => {
        ScrollTrigger.create({
          trigger: img,
          start: "top 65%",
          end: "bottom 35%",
          onToggle: (self) => img.classList.toggle("is-color", self.isActive),
        });
      };
      gsap.utils.toArray<HTMLElement>(".v-img[data-band]", el).forEach(band);
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

      // Layout settles late (fonts, images, pinned track) — re-measure.
      setTimeout(() => ScrollTrigger.refresh(), 400);
    }, el);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, [venues.length]);

  return (
    <main ref={root} className="ml-root">
      <style>{ML_CSS}</style>

      <LandingNav
        hasVenues={hasVenues}
        onShowOffers={onShowOffers}
        onShowMenus={onShowMenus}
      />

      <Hero hasVenues={hasVenues} onShowOffers={onShowOffers} />

      <LandingMarquee venues={venues} />

      <HowItWorks onShowOffers={onShowOffers} />

      <Concierge venues={venues} locale={locale} />

      <MenusCTA count={venues.length} onShowMenus={onShowMenus} />

      <Waitlist />

      <FAQ />

      <LandingFooter
        locale={locale}
        hasVenues={hasVenues}
        onShowOffers={onShowOffers}
        onShowMenus={onShowMenus}
      />
    </main>
  );
}
