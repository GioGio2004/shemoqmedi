"use client";

// components/landing/LandingPanels.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Three-panel shell for the landing page — switched purely by client state
// (NO route change, NO reload):
//   HOME   — MotionLanding (hero, how, concierge, MenusCTA, waitlist, footer)
//   MENUS  — VenuesSpace (the full venues catalogue, own space)
//   OFFERS — realtime surprise-bags feed
//
// HOME and MENUS are ALWAYS MOUNTED (block/hidden toggle) so their GSAP
// pinned-scroll state and the SSR venue anchors (SEO) survive switching.
// OFFERS mounts/unmounts with a springy slide (no SEO surface, realtime feed).
//
// Mobile: LiquidBottomNav (Home/Menus/Offers) + horizontal swipe across the
// HOME→MENUS→OFFERS order. Desktop: HOME's own LandingNav, plus a synced
// clone navbar shown on the MENUS/OFFERS panels (reuses MotionLanding's
// mounted ML_CSS .ml-* styles — keep in sync with sections/LandingNav.tsx).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { useTranslations } from "next-intl";
import MotionLanding, { type LandingVenue } from "@/components/landing/MotionLanding";
import VenuesSpace from "@/components/landing/VenuesSpace";
import OffersFeed from "@/components/offers/OffersFeed";
import { SideRails } from "@/components/motion/DecorLines";
import LiquidBottomNav, {
  type LandingPanel,
} from "@/components/navigation/LiquidBottomNav";

const SWIPE_DISTANCE = 70;
const SWIPE_VELOCITY = 400;
const ORDER: LandingPanel[] = ["home", "menus", "offers"];

export default function LandingPanels({
  venues,
  locale,
}: {
  venues: LandingVenue[];
  locale: string;
}) {
  const t = useTranslations("LandingTabs");
  const tr = useTranslations("LandingRuled.nav");
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<LandingPanel>("home");
  // Slide direction: +1 = moving down the ORDER (right), -1 = up (left).
  const [direction, setDirection] = useState(1);

  const switchTo = useCallback((panel: LandingPanel) => {
    setActive((prev) => {
      if (prev === panel) return prev;
      setDirection(ORDER.indexOf(panel) > ORDER.indexOf(prev) ? 1 : -1);
      return panel;
    });
  }, []);

  const hasVenues = venues.length > 0;

  // Returning to a scroll-restored panel (home/menus) — nudge ScrollTrigger to
  // re-measure (the panel was display:none while hidden).
  useEffect(() => {
    if (active === "home" || active === "menus") {
      const id = window.setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 60);
      return () => window.clearTimeout(id);
    }
  }, [active]);

  // Horizontal swipe (mobile) — steps one panel along HOME→MENUS→OFFERS.
  // Only fires at gesture end, so vertical scrolling is unaffected. Menus that
  // have no venues collapse the middle step.
  const handlePanEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (window.innerWidth >= 768) return; // desktop uses the nav
      const { offset, velocity } = info;
      if (Math.abs(offset.x) < Math.abs(offset.y) * 1.2) return; // mostly vertical
      const strong =
        Math.abs(offset.x) > SWIPE_DISTANCE || Math.abs(velocity.x) > SWIPE_VELOCITY;
      if (!strong) return;
      const order: LandingPanel[] = hasVenues ? ORDER : ["home", "offers"];
      const i = order.indexOf(active);
      const next = offset.x < 0 ? i + 1 : i - 1; // swipe left → forward
      if (next >= 0 && next < order.length) switchTo(order[next]);
    },
    [active, hasVenues, switchTo]
  );

  const labels: Record<LandingPanel, string> = {
    home: t("home"),
    menus: t("menus"),
    offers: t("offers"),
  };

  // Fixed-position chrome must portal to <body>: this shell is a transformed
  // framer-motion ancestor, which would hijack position:fixed.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Clone of the RULED landing nav shown on the MENUS/OFFERS panels (HOME has
  // its own LandingNav). Reuses the mounted ML_CSS .ml-* styles. Brand → home;
  // the three destinations route by client state; the active one is dimmed.
  const cloneNav = (
    <div className="ml-root" style={{ background: "transparent", overflow: "visible" }}>
      <nav className="ml-nav" data-scrolled="true">
        <div className="ml-navbar">
          <button
            type="button"
            className="ml-brand"
            aria-label="VOLOO by Shemoqmedi — home"
            onClick={() => switchTo("home")}
          >
            <span className="ml-brand-wm">VOLOO</span>
            <span className="ml-brand-by">{tr("by")}</span>
          </button>

          <span className="ml-nav-city" aria-hidden="true">
            00 — TBILISI
          </span>

          <div className="ml-nav-right">
            <div className="ml-nlinks">
              <button
                type="button"
                className="ml-navlink"
                data-active={active === "home" ? "true" : "false"}
                onClick={() => switchTo("home")}
              >
                {tr("home")}
              </button>
              {hasVenues && (
                <button
                  type="button"
                  className="ml-navlink"
                  data-active={active === "menus" ? "true" : "false"}
                  onClick={() => switchTo("menus")}
                >
                  {tr("menus")}
                </button>
              )}
              <button
                type="button"
                className="ml-navlink"
                data-active={active === "offers" ? "true" : "false"}
                onClick={() => switchTo("offers")}
              >
                {tr("offers")}
              </button>
            </div>
            <button
              type="button"
              className="ml-btn"
              onClick={() => switchTo("home")}
            >
              ← {tr("home")}
            </button>
          </div>
        </div>
        <span className="ml-nav-line" aria-hidden="true" />
      </nav>
    </div>
  );

  return (
    <motion.div onPanEnd={handlePanEnd} className="relative min-h-screen">
      {/* Fixed page-gutter rails — persist across all panels (spec §2.1.1). */}
      <SideRails />

      {/* Clone navbar on non-home panels (desktop). */}
      {mounted && active !== "home" && createPortal(cloneNav, document.body)}

      {/* HOME — always mounted; hidden (not unmounted) to keep GSAP state. */}
      <div className={active === "home" ? "block" : "hidden"}>
        <MotionLanding
          venues={venues}
          locale={locale}
          onShowOffers={() => switchTo("offers")}
          onShowMenus={() => switchTo("menus")}
        />
      </div>

      {/* MENUS — always mounted (SEO anchors + pinned scroll state). */}
      {hasVenues && (
        <div className={active === "menus" ? "block" : "hidden"}>
          <VenuesSpace venues={venues} locale={locale} />
        </div>
      )}

      {/* OFFERS — mount/unmount with a springy slide. */}
      <AnimatePresence initial={false}>
        {active === "offers" && (
          <motion.div
            key="offers"
            initial={
              reduceMotion ? { opacity: 0 } : { x: direction * 80, opacity: 0 }
            }
            animate={{ x: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { x: direction * 80, opacity: 0 }}
            transition={
              reduceMotion
                ? { duration: 0.15 }
                : { type: "spring", stiffness: 320, damping: 30, mass: 0.9 }
            }
            className="min-h-screen overscroll-y-contain bg-v-bg"
          >
            <OffersFeed />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom nav — Home / Menus / Offers. */}
      <LiquidBottomNav active={active} onChange={switchTo} labels={labels} />
    </motion.div>
  );
}
