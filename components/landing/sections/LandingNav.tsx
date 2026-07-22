"use client";

// components/landing/sections/LandingNav.tsx
// ─────────────────────────────────────────────────────────────────────────────
// RULED nav (spec §4.1). Class names .ml-nav / .ml-navbar / .ml-brand /
// .ml-nlinks / .ml-btn are contractual — LandingPanels' Offers navbar clone
// re-renders this exact markup (keep the two in sync).
//
// Transparent until 24px scrolled, then rgba(10,10,10,.85) + a bottom
// hairline that draws scaleX on first appearance (CSS transition — visible
// instantly under no-JS since the default state is transparent at top).
// Desktop: HOW / CONCIERGE / VENUES mono roll-hover links + the single
// filled-accent "OFFERS →" switch (magnetic). Mobile: brand + OFFERS only.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MagneticA } from "@/components/Magnetic";
import { Roll } from "./shared";

export default function LandingNav({
  hasVenues,
  onShowOffers,
  onShowMenus,
}: {
  hasVenues: boolean;
  onShowOffers?: () => void;
  onShowMenus?: () => void;
}) {
  const t = useTranslations("LandingRuled.nav");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 24));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <nav className="ml-nav" data-scrolled={scrolled ? "true" : "false"}>
      <div className="ml-navbar">
        <a href="#top" className="ml-brand" aria-label="VOLOO by Shemoqmedi">
          <span className="ml-brand-wm">VOLOO</span>
          <span className="ml-brand-by">{t("by")}</span>
        </a>

        <span className="ml-nav-city" aria-hidden="true">
          00 — TBILISI
        </span>

        <div className="ml-nav-right">
          <div className="ml-nlinks">
            <a href="#how" className="ml-rollhost">
              <Roll>{t("how")}</Roll>
            </a>
            <a href="#concierge" className="ml-rollhost">
              <Roll>{t("concierge")}</Roll>
            </a>
            {hasVenues &&
              (onShowMenus ? (
                <a
                  href="#venues"
                  className="ml-rollhost"
                  onClick={(e) => {
                    e.preventDefault();
                    onShowMenus();
                  }}
                >
                  <Roll>{t("menus")}</Roll>
                </a>
              ) : (
                <a href="#venues" className="ml-rollhost">
                  <Roll>{t("venues")}</Roll>
                </a>
              ))}
          </div>
          {onShowOffers && (
            <MagneticA
              href="#offers"
              className="ml-btn"
              strength={0.25}
              data-cursor={t("offers")}
              onClick={(e) => {
                e.preventDefault();
                onShowOffers();
              }}
            >
              {t("offers")} →
            </MagneticA>
          )}
        </div>
      </div>
      <span className="ml-nav-line" aria-hidden="true" />
    </nav>
  );
}
