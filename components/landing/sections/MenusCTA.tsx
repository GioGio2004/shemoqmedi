"use client";

// components/landing/sections/MenusCTA.tsx
// ─────────────────────────────────────────────────────────────────────────────
// 03 — VENUES (home edition). The pinned catalogue moved to its own panel
// (VenuesSpace); in its place the home page gets one oversized, full-bleed
// CTA that opens it. Keeps the #venues anchor so legacy hash links land here.
//
// Motion: top/bottom hairlines draw scaleX (expo.out), the giant line rises
// masked (yPercent 110), the arrow + count row fades up; desktop hover slides
// the arrow and sweeps the text to accent (CSS); press scales .97. Reduced
// motion: single quiet fade.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionHead } from "@/components/motion/DecorLines";

export default function MenusCTA({
  count,
  onShowMenus,
}: {
  count: number;
  onShowMenus?: () => void;
}) {
  const t = useTranslations("LandingRuled.mcta");
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia(root);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const st = {
        trigger: root,
        start: "top 80%",
        toggleActions: "play none none none",
      } as const;
      gsap.from(root.querySelectorAll(".ml-mcta-hl"), {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: st,
      });
      gsap.from(root.querySelector(".ml-mcta-big"), {
        yPercent: 110,
        duration: 0.9,
        ease: "expo.out",
        delay: 0.1,
        scrollTrigger: st,
      });
      gsap.from(root.querySelector(".ml-mcta-sub"), {
        opacity: 0,
        y: 16,
        duration: 0.6,
        ease: "expo.out",
        delay: 0.3,
        scrollTrigger: st,
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

    return () => mm.revert();
  }, []);

  return (
    <section className="ml-sec ml-mcta" id="venues" ref={rootRef}>
      <div className="ml-wrap">
        <SectionHead
          index="03"
          label={t("label")}
          meta={count > 0 ? `( ${count} )` : `( ${t("soon")} )`}
          headingClassName=""
        />
      </div>

      <button
        type="button"
        className="ml-mcta-btn"
        onClick={onShowMenus}
        data-cursor={t("cursor")}
        aria-label={t("cta")}
      >
        <span className="ml-mcta-hl" aria-hidden="true" />
        <span className="ml-wrap ml-mcta-row">
          <span className="ml-mcta-mask">
            <span className="ml-mcta-big">{t("cta")}</span>
          </span>
          <span className="ml-mcta-arrow" aria-hidden="true">
            →
          </span>
        </span>
        <span className="ml-wrap">
          <span className="ml-mcta-sub">
            {t("sub")}
            <span className="ml-mcta-count">
              {count > 0 ? `${String(count).padStart(2, "0")} ${t("count")}` : ""}
            </span>
          </span>
        </span>
        <span className="ml-mcta-hl" aria-hidden="true" />
      </button>
    </section>
  );
}
