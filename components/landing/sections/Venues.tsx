"use client";

// components/landing/sections/Venues.tsx
// ─────────────────────────────────────────────────────────────────────────────
// 03 — VENUES (spec §4.6). Dark section.
//
//   Desktop ≥1024 + motion: the section pins and the card track translates x
//   (scrub 1). Venue names stay real SSR <a href={buildMenuUrl(...)}> anchors
//   in the initial HTML — pinning only transforms their parent (SEO contract).
//   Mobile / no-JS / reduced-motion: the same track is a native overflow-x
//   scroller with x-mandatory snap (data-lenis-prevent for the Lenis contract).
//
//   The `01 / NN` fraction in the section head updates from scroll progress
//   (pin progress on desktop, scrollLeft on mobile) via direct textContent —
//   no React churn. Card entrances keep the animejs IntersectionObserver
//   stagger from the previous build (retinted, 60ms per spec §3.2).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate, stagger } from "animejs";
import { SectionHead, XFrame } from "@/components/motion/DecorLines";
import { buildMenuUrl } from "@/lib/routes";
import type { LandingVenue } from "../MotionLanding";
import { IMG, Roll, UImg } from "./shared";

const pad2 = (n: number) => String(n).padStart(2, "0");

export default function Venues({
  venues,
  locale,
  onOpenVenue,
}: {
  venues: LandingVenue[];
  locale: string;
  onOpenVenue: (v: LandingVenue, el: HTMLElement) => void;
}) {
  const t = useTranslations("LandingRuled.venues");
  const rootRef = useRef<HTMLElement>(null);
  const fracRef = useRef<HTMLSpanElement>(null);
  const count = venues.length;

  // Desktop pinned horizontal scroll + fraction updates.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || count === 0) return;
    gsap.registerPlugin(ScrollTrigger);

    const wrap = root.querySelector<HTMLElement>(".ml-vwrap");
    const track = root.querySelector<HTMLElement>(".ml-vtrack");
    if (!wrap || !track) return;

    const setFrac = (progress: number) => {
      if (!fracRef.current) return;
      const idx = Math.min(count, Math.max(1, Math.round(progress * (count - 1)) + 1));
      fracRef.current.textContent = `${pad2(idx)} / ${pad2(count)}`;
    };
    setFrac(0);

    const mm = gsap.matchMedia(root);

    // Pin only on desktop with motion allowed (spec §3.1 matchMedia contexts).
    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        // The native scroller becomes a static window onto the moving track.
        gsap.set(wrap, { overflowX: "visible" });
        const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const tween = gsap.to(track, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: root,
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => "+=" + dist(),
            invalidateOnRefresh: true,
            onUpdate: (self) => setFrac(self.progress),
          },
        });
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(wrap, { clearProps: "overflowX" });
          gsap.set(track, { clearProps: "x" });
        };
      }
    );

    // Mobile / reduced-motion: fraction follows the native scroller.
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = wrap.scrollWidth - wrap.clientWidth;
        setFrac(max > 0 ? wrap.scrollLeft / max : 0);
      });
    };
    wrap.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener("scroll", onScroll);
      mm.revert();
    };
  }, [count]);

  // Card entrance — animejs IntersectionObserver stagger (kept from the
  // previous build; 60ms = spec card-grid stagger). Reduced-motion: skipped.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || count === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const track = root.querySelector<HTMLElement>(".ml-vtrack");
    if (!track) return;
    const cards = Array.from(track.querySelectorAll<HTMLElement>(".ml-vcard"));
    if (!cards.length) return;

    const clear = () =>
      cards.forEach((c) => {
        c.style.opacity = "";
        c.style.transform = "";
      });
    cards.forEach((c) => {
      c.style.opacity = "0";
    });

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        animate(cards, {
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 700,
          ease: "outCubic",
          delay: stagger(60),
          onComplete: clear,
        });
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(track);

    return () => {
      io.disconnect();
      clear();
    };
  }, [count]);

  return (
    <section className="ml-sec ml-venues" id="venues" ref={rootRef}>
      <div className="ml-wrap">
        <SectionHead
          index="03"
          label={t("label")}
          meta={
            count > 0 ? (
              <span>
                ( {count} ) <span ref={fracRef}>01 / {pad2(count)}</span>
              </span>
            ) : (
              `( ${t("meta_soon")} )`
            )
          }
          headingClassName=""
        />
      </div>

      {count > 0 ? (
        <div className="ml-vwrap v-scroll" data-lenis-prevent>
          <div className="ml-vtrack">
            {venues.map((v, i) => (
              <div
                key={v._id}
                role="button"
                tabIndex={0}
                className="ml-vcard v-press"
                aria-label={`${v.name} — details`}
                data-cursor="View"
                onClick={(e) => onOpenVenue(v, e.currentTarget)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpenVenue(v, e.currentTarget);
                  }
                }}
              >
                <XFrame className="v-img-hover">
                  <div className="ml-vcard-img">
                    <UImg
                      src={
                        v.imageUrl ||
                        IMG.venueFallbacks[i % IMG.venueFallbacks.length]
                      }
                      alt={v.name}
                      sizes="(max-width: 1023px) 78vw, 420px"
                      band="mobile"
                    />
                  </div>
                </XFrame>
                <div className="ml-vcard-meta">
                  <span className="ml-vcard-idx">{pad2(i + 1)}</span>
                  {/* Real SSR anchor — the SEO contract. */}
                  <a
                    href={buildMenuUrl(locale, v.slug)}
                    className="v-t-h3 ml-vcard-name ml-rollhost"
                    aria-label={`${v.name} — ${t("open_menu")}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Roll>{v.name}</Roll>
                  </a>
                  <span className="ml-vcard-row">
                    <span>{t("card_meta")}</span>
                    <span className="ml-vcard-frac">
                      {pad2(i + 1)} / {pad2(count)}
                    </span>
                  </span>
                </div>
                <span className="ml-vcard-line" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="ml-wrap">
          <div className="ml-vempty">( {t("empty")} )</div>
        </div>
      )}
    </section>
  );
}
