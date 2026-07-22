"use client";

// components/landing/sections/Hero.tsx
// ─────────────────────────────────────────────────────────────────────────────
// RULED hero (spec §4.2). Dark, full viewport, bottom-anchored. Desktop:
// headline cols 1–8, portrait crosshair-framed image cols 9–12, tick ruler
// at the right rail. Mobile: headline full-width, image below at 4:3.
//
// Headline: three giga lines — GOOD FOOD / DESERVES A / BETTER <rotator>.
// The rotator cycles MENU. / ENDING. / TABLE. / PRICE. in accent; SSR renders
// the first word statically (CSS hides the rest → SEO/no-JS safe). Entrance:
// hero-tier masked chars via <Reveal type="chars">, then lead (mask-reveal),
// then CTAs (fade-rise). Reduced-motion collapses to opacity fades (Reveal)
// and a static rotator.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { MagneticA } from "@/components/Magnetic";
import Reveal from "@/components/motion/Reveal";
import { XFrame, TickRuler } from "@/components/motion/DecorLines";
import { IMG, UImg } from "./shared";

/** Overflow-hidden word rotator — spec §4.2 (0.7s expo.inOut every 2.8s). */
function HeroRotator({ words }: { words: string[] }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || words.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const spans = Array.from(root.querySelectorAll<HTMLElement>("span"));
    // JS takes over visibility (CSS hides all but the first for no-JS/SSR).
    spans.forEach((s, i) => {
      s.style.visibility = "visible";
      if (i > 0) gsap.set(s, { yPercent: 130 });
    });

    let idx = 0;
    let tl: gsap.core.Timeline | null = null;
    const interval = window.setInterval(() => {
      if (document.hidden) return; // pause when tab hidden
      const from = spans[idx % spans.length];
      idx += 1;
      const to = spans[idx % spans.length];
      tl?.kill();
      tl = gsap
        .timeline({ defaults: { duration: 0.7, ease: "expo.inOut" } })
        .set(to, { yPercent: 130 }, 0)
        .to(from, { yPercent: -130 }, 0)
        .to(to, { yPercent: 0 }, 0);
    }, 2800);

    return () => {
      window.clearInterval(interval);
      tl?.kill();
      spans.forEach((s) => gsap.set(s, { clearProps: "all" }));
    };
  }, [words]);

  return (
    <span className="ml-rot" ref={ref}>
      {words.map((w, i) => (
        <span key={i} aria-hidden={i > 0 ? "true" : undefined}>
          {w}
        </span>
      ))}
    </span>
  );
}

export default function Hero({
  hasVenues,
  onShowOffers,
}: {
  hasVenues: boolean;
  onShowOffers?: () => void;
}) {
  const t = useTranslations("Landing.HeroRuled");
  const cueRef = useRef<HTMLSpanElement>(null);
  const rotWrapRef = useRef<HTMLSpanElement>(null);

  // SCROLL cue line loop + rotator entrance fade — motion-gated.
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (cueRef.current) {
        gsap.fromTo(
          cueRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            transformOrigin: "center top",
            duration: 1.6,
            ease: "power2.inOut",
            repeat: -1,
            yoyo: true,
          }
        );
      }
      if (rotWrapRef.current) {
        gsap.from(rotWrapRef.current, {
          autoAlpha: 0,
          duration: 0.9,
          ease: "expo.out",
          delay: 0.5,
        });
      }
    });
    return () => mm.revert();
  }, []);

  const words = [t("word1"), t("word2"), t("word3"), t("word4")];

  return (
    <section className="ml-hero" id="top">
      <div className="ml-wrap ml-hero-grid">
        <div className="ml-hero-copy">
          <h1 className="v-t-giga ml-h1">
            <Reveal as="span" type="chars" className="ml-hline">
              {t("line1")}
            </Reveal>
            <Reveal as="span" type="chars" className="ml-hline" delay={0.08}>
              {t("line2")}
            </Reveal>
            <span className="ml-hline ml-hline-rot">
              <Reveal as="span" type="chars" delay={0.16}>
                {t("line3")}
              </Reveal>
              <span ref={rotWrapRef}>
                <HeroRotator words={words} />
              </span>
            </span>
          </h1>

          <Reveal as="p" type="lines" delay={0.45} className="v-t-lead ml-lead">
            {t("lead")}
          </Reveal>

          <div className="ml-scroll-cue" aria-hidden="true">
            <span>{t("scroll")} — ▼</span>
            <span ref={cueRef} className="ml-scroll-line" />
          </div>

          <Reveal type="fade" delay={0.7} duration={0.6} className="ml-hbtns">
            <MagneticA
              href={hasVenues ? "#venues" : "#how"}
              className="ml-cta"
              strength={0.2}
              data-cursor={t("cta_venues")}
            >
              {t("cta_venues")} →
            </MagneticA>
            {onShowOffers && (
              <a
                href="#offers"
                className="ml-cta-o v-press"
                data-cursor={t("cta_bags")}
                onClick={(e) => {
                  e.preventDefault();
                  onShowOffers();
                }}
              >
                {t("cta_bags")}
              </a>
            )}
          </Reveal>
        </div>

        <div className="ml-hero-visual">
          <XFrame bare className="ml-hero-frame">
            <Reveal type="frame" delay={0.6} className="v-xframe-in ml-hero-img">
              <UImg
                src={IMG.hero}
                alt="Fine-dining plate in a dark room — a VOLOO venue"
                sizes="(max-width: 1023px) 100vw, 32vw"
                priority
              />
            </Reveal>
          </XFrame>
        </div>
      </div>

      <TickRuler count={14} className="ml-hero-ticks" />
    </section>
  );
}
