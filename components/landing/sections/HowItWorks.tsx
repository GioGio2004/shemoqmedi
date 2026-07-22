"use client";

// components/landing/sections/HowItWorks.tsx
// ─────────────────────────────────────────────────────────────────────────────
// 01 — HOW IT WORKS (spec §4.4). First bone theme-flip section (the flip
// itself is driven from MotionLanding's root effect via [data-flip="bone"]).
//
// Three full-width numbered rows separated by hairlines that draw on enter
// with a 0.12s stagger; row 3's copy carries the accent "Surprise Bag" link
// into the Offers panel. Below: the drift image wall (spec images #2–#7) in
// crosshair frames — odd columns drift +12→−12, even reversed, scrubbed.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionHead, XFrame } from "@/components/motion/DecorLines";
import Reveal from "@/components/motion/Reveal";
import { IMG, UImg } from "./shared";

const WALL_ALTS = [
  "Rustic dish photographed overhead",
  "Dark japanese table spread",
  "Salmon on a dark plate",
  "Noodle bowl photographed overhead",
  "Mezze spread on a shared table",
  "Dessert on a dark ground",
];

function WallImage({ i }: { i: number }) {
  return (
    <XFrame className="ml-wall-item-frame">
      <div className="ml-wall-item">
        <UImg
          src={IMG.wall[i]}
          alt={WALL_ALTS[i]}
          sizes="(max-width: 1023px) 50vw, 33vw"
        />
      </div>
    </XFrame>
  );
}

export default function HowItWorks({
  onShowOffers,
}: {
  onShowOffers?: () => void;
}) {
  const t = useTranslations("LandingRuled.how");
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia(root);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Rows: hairlines draw + content rises, staggered 0.12 (spec §4.4).
      const rows = gsap.utils.toArray<HTMLElement>(".ml-how-row", root);
      const lines = rows
        .map((r) => r.querySelector<HTMLElement>(".ml-how-line"))
        .filter(Boolean) as HTMLElement[];
      const st = {
        trigger: root.querySelector(".ml-how-rows"),
        start: "top 78%",
        toggleActions: "play none none none",
      } as const;
      gsap.from(lines, {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: { ...st },
      });
      gsap.from(rows, {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: { ...st },
      });

      // Image wall drift (spec drift pattern): scrubbed column parallax.
      root.querySelectorAll<HTMLElement>(".ml-wall-m, .ml-wall-d").forEach((wall) => {
        wall.querySelectorAll<HTMLElement>(".ml-wall-col").forEach((col, i) => {
          gsap.fromTo(
            col,
            { yPercent: i % 2 ? -12 : 12 },
            {
              yPercent: i % 2 ? 12 : -12,
              ease: "none",
              scrollTrigger: {
                trigger: wall,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        });
      });
    });

    return () => mm.revert();
  }, []);

  const steps = [
    { n: "01", title: t("s1t"), copy: <>{t("s1d")}</> },
    { n: "02", title: t("s2t"), copy: <>{t("s2d")}</> },
    {
      n: "03",
      title: t("s3t"),
      copy: (
        <>
          {t("s3d_pre")}
          <button
            type="button"
            className="ml-how-baglink"
            onClick={onShowOffers}
          >
            {t("s3d_link")}
          </button>
          {t("s3d_post")}
        </>
      ),
    },
  ];

  // Wall column groupings — mobile 2×3, desktop 3×2 (hidden variant's lazy
  // images never intersect, so nothing double-loads).
  const mobileCols = [
    [0, 2, 4],
    [1, 3, 5],
  ];
  const desktopCols = [
    [0, 3],
    [1, 4],
    [2, 5],
  ];

  return (
    <section className="ml-sec" id="how" data-flip="bone" ref={rootRef}>
      <div className="ml-wrap">
        <SectionHead
          index="01"
          label={t("label")}
          meta={`( ${t("meta")} )`}
          headingClassName=""
        >
          <Reveal as="h2" type="lines" className="v-t-h2">
            {t("heading")}
          </Reveal>
        </SectionHead>

        <div className="ml-how-rows">
          {steps.map((s) => (
            <div className="ml-how-row v-press" key={s.n}>
              <span className="ml-how-idx">{s.n}</span>
              <h3 className="v-t-h3 ml-how-title">{s.title}</h3>
              <p className="ml-how-copy">{s.copy}</p>
              <span className="ml-how-arrow" aria-hidden="true">
                →
              </span>
              <span className="ml-how-line" aria-hidden="true" />
            </div>
          ))}
        </div>

        <div className="ml-wall">
          <div className="ml-wall-m">
            {mobileCols.map((col, c) => (
              <div className="ml-wall-col" key={c}>
                {col.map((i) => (
                  <WallImage key={i} i={i} />
                ))}
              </div>
            ))}
          </div>
          <div className="ml-wall-d">
            {desktopCols.map((col, c) => (
              <div className="ml-wall-col" key={c}>
                {col.map((i) => (
                  <WallImage key={i} i={i} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
