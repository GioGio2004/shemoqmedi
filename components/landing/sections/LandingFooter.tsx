"use client";

// components/landing/sections/LandingFooter.tsx
// ─────────────────────────────────────────────────────────────────────────────
// 05 — CONTACT (spec §4.8). Full-bleed top hairline with plus-marks, mono
// index row with the Tbilisi coordinates ornament, three mono link columns,
// the giant VOLOO wordmark (masked char reveal on enter; desktop hover
// sweeps chars to accent sequentially), and the bottom micro row with the
// EN · KA · RU locale switcher (current locale in accent). Mobile bottom
// padding clears the LiquidBottomNav (+88px + safe-area).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Hairline } from "@/components/motion/DecorLines";
import { Roll } from "./shared";

const LOCALES = ["en", "ka", "ru"] as const;
const COORDS = "41.7151° N · 44.8271° E — TBILISI";
const WORDMARK = ["V", "O", "L", "O", "O"];

/** Giant wordmark: masked char entrance + sequential accent hover sweep. */
function Wordmark() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const chars = Array.from(root.querySelectorAll<HTMLElement>(".ml-wm-ch"));
    if (!chars.length) return;

    const mm = gsap.matchMedia(root);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(chars, {
        yPercent: 110,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.06,
        scrollTrigger: {
          trigger: root,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.from(root, {
        opacity: 0,
        duration: 0.4,
        scrollTrigger: {
          trigger: root,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    });

    // Desktop hover: sequential accent sweep (spec 0.03 stagger).
    mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const enter = () =>
        gsap.to(chars, {
          color: "#D8FF3A",
          duration: 0.3,
          ease: "expo.out",
          stagger: 0.03,
          overwrite: "auto",
        });
      const leave = () =>
        gsap.to(chars, {
          color: "rgba(244,243,240,.34)",
          duration: 0.4,
          ease: "expo.out",
          stagger: 0.03,
          overwrite: "auto",
        });
      root.addEventListener("mouseenter", enter);
      root.addEventListener("mouseleave", leave);
      return () => {
        root.removeEventListener("mouseenter", enter);
        root.removeEventListener("mouseleave", leave);
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <div className="ml-wm" ref={ref} aria-hidden="true">
      {WORDMARK.map((ch, i) => (
        <span className="ml-wm-m" key={i}>
          <span className="ml-wm-ch">{ch}</span>
        </span>
      ))}
    </div>
  );
}

export default function LandingFooter({
  locale,
  hasVenues,
  onShowOffers,
  onShowMenus,
}: {
  locale: string;
  hasVenues: boolean;
  onShowOffers?: () => void;
  onShowMenus?: () => void;
}) {
  const t = useTranslations("LandingRuled.footer");
  const tn = useTranslations("LandingRuled.nav");
  const year = new Date().getFullYear();

  const explore: Array<{ idx: string; label: string; href?: string; onClick?: () => void }> = [
    { idx: "01", label: tn("how"), href: "#how" },
    { idx: "02", label: tn("concierge"), href: "#concierge" },
    ...(hasVenues
      ? [
          onShowMenus
            ? { idx: "03", label: tn("menus"), onClick: onShowMenus }
            : { idx: "03", label: tn("venues"), href: "#venues" },
        ]
      : []),
    ...(onShowOffers
      ? [{ idx: "04", label: tn("offers"), onClick: onShowOffers }]
      : []),
  ];

  return (
    <footer className="ml-footer ml-foot-pad">
      <Hairline plusMarks />
      <div className="ml-wrap">
        <div className="ml-foot-head">
          <span>05 — {t("label")}</span>
          <span>{COORDS}</span>
        </div>

        <div className="ml-foot-cols">
          <div>
            <p className="ml-foot-col-t">{t("explore")}</p>
            <div className="ml-foot-col">
              {explore.map((l) =>
                l.href ? (
                  <a key={l.idx} href={l.href} className="ml-foot-link ml-rollhost">
                    <span className="ml-fidx">{l.idx}</span>
                    <Roll>{l.label}</Roll>
                  </a>
                ) : (
                  <button
                    key={l.idx}
                    type="button"
                    onClick={l.onClick}
                    className="ml-foot-link ml-rollhost"
                  >
                    <span className="ml-fidx">{l.idx}</span>
                    <Roll>{l.label}</Roll>
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <p className="ml-foot-col-t">{t("legal")}</p>
            <div className="ml-foot-col">
              <Link href="/privacy" className="ml-foot-link ml-rollhost">
                <Roll>{t("privacy")}</Roll>
              </Link>
              <Link href="/terms" className="ml-foot-link ml-rollhost">
                <Roll>{t("terms")}</Roll>
              </Link>
            </div>
          </div>

          <div>
            <p className="ml-foot-col-t">{t("contact")}</p>
            <div className="ml-foot-col">
              <a
                href="mailto:hello@shemoqmedi.space"
                className="ml-foot-link ml-rollhost"
              >
                <Roll>HELLO@SHEMOQMEDI.SPACE</Roll>
              </a>
              <a
                href="https://instagram.com/shemoqmedi"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-foot-link ml-rollhost"
              >
                <Roll>INSTAGRAM</Roll>
              </a>
            </div>
          </div>
        </div>

        <Wordmark />
      </div>

      {/* Bottom micro row sits between two hairlines (spec §4.8). */}
      <Hairline />
      <div className="ml-wrap">
        <div className="ml-foot-bottom">
          <span>© {year} SHEMOQMEDI</span>
          <span>{t("made")}</span>
          <span className="ml-locales">
            {LOCALES.map((l, i) => (
              <span key={l}>
                <Link href={`/${l}`} data-current={l === locale ? "true" : "false"}>
                  {l.toUpperCase()}
                </Link>
                {i < LOCALES.length - 1 && <span aria-hidden="true"> · </span>}
              </span>
            ))}
          </span>
        </div>
      </div>
      <Hairline />
    </footer>
  );
}
