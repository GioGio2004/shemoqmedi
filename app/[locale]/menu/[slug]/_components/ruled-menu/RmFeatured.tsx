"use client";

// ruled-menu/RmFeatured.tsx
// The featured drag-strip — slight-twist-style horizontal carousel of starred
// items. Embla free-drag + an accent "DRAG" cursor pill that lerps to the
// pointer over the strip (pointer-fine only). Food photography renders FULL
// COLOR here — this is the appetite moment.

import { useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionHead, XFrame } from "@/components/motion/DecorLines";
import { idx2, imgSrcSet, lari, pick, type RmItem } from "./types";

export default function RmFeatured({
  items,
  locale,
  index,
  label,
  heading,
  dragLabel,
  onOpen,
}: {
  items: RmItem[];
  locale: string;
  index: string;
  label: string;
  heading: string;
  dragLabel: string;
  onOpen: (item: RmItem) => void;
}) {
  const [viewportRef] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps",
    align: "start",
  });
  const rootRef = useRef<HTMLElement | null>(null);
  const pillRef = useRef<HTMLDivElement | null>(null);

  // Card entrance — one batch per section visit, gsap.from so SSR shows all.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const cards = root.querySelectorAll<HTMLElement>(".rm-feat-card");
      if (!cards.length) return;
      gsap.from(cards, {
        y: 48,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: root,
          start: "top 78%",
          toggleActions: "play none none none",
        },
      });
    });
    return () => mm.revert();
  }, [items.length]);

  // Accent DRAG pill following the cursor over the strip.
  useEffect(() => {
    const root = rootRef.current;
    const pill = pillRef.current;
    if (!root || !pill) return;

    const mm = gsap.matchMedia();
    mm.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const xTo = gsap.quickTo(pill, "x", { duration: 0.45, ease: "power3.out" });
      const yTo = gsap.quickTo(pill, "y", { duration: 0.45, ease: "power3.out" });
      let shown = false;

      const move = (e: MouseEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
        if (!shown) {
          shown = true;
          gsap.to(pill, { scale: 1, duration: 0.4, ease: "back.out(1.2)" });
        }
      };
      const leave = () => {
        shown = false;
        gsap.to(pill, { scale: 0, duration: 0.3, ease: "power2.in" });
      };

      root.addEventListener("mousemove", move);
      root.addEventListener("mouseleave", leave);
      return () => {
        root.removeEventListener("mousemove", move);
        root.removeEventListener("mouseleave", leave);
      };
    });
    return () => mm.revert();
  }, []);

  if (!items.length) return null;

  return (
    <section className="rm-sec" ref={rootRef} id="featured">
      <div className="rm-wrap">
        <SectionHead index={index} label={label} meta={`( ${items.length} )`}>
          {heading}
        </SectionHead>
      </div>

      <div className="rm-feat-viewport mt-10" ref={viewportRef}>
        <div className="rm-feat-track">
          {items.map((item, i) => {
            const img = item.imageUrl ? imgSrcSet(item.imageUrl) : null;
            return (
              <article key={item._id} className="rm-feat-card">
                <XFrame>
                  <button
                    type="button"
                    onClick={() => onOpen(item)}
                    className="v-press block w-full bg-v-bg-raise text-left"
                  >
                    <div className="rm-feat-img">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img.src}
                          {...(img.srcSet
                            ? { srcSet: img.srcSet, sizes: "(min-width:768px) 44vw, 78vw" }
                            : {})}
                          alt={pick(item.name, locale)}
                          className="rm-img-color v-kb"
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="v-t-mono" style={{ color: "var(--v-faint)" }}>
                            {idx2(i)}
                          </span>
                        </div>
                      )}
                      <span className="v-t-mono absolute left-3 top-3 z-10 text-v-ink [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
                        {idx2(i)}
                      </span>
                    </div>

                    <span className="v-line-x" aria-hidden="true" />

                    <span className="flex items-baseline justify-between gap-3 px-4 py-3.5">
                      <span className="font-v-display text-[1.05rem] font-medium leading-tight text-v-ink [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                        {pick(item.name, locale)}
                      </span>
                      <span className="v-t-mono shrink-0 tabular-nums text-v-accent">
                        ₾ {lari(item.price)}
                      </span>
                    </span>

                    {item.tags.length > 0 && (
                      <span className="flex flex-wrap gap-1.5 px-4 pb-4 -mt-1">
                        {item.tags.slice(0, 3).map((t) => (
                          <span key={t} className="rm-chip v-t-micro">
                            {t}
                          </span>
                        ))}
                      </span>
                    )}
                  </button>
                </XFrame>
              </article>
            );
          })}
        </div>
      </div>

      <div ref={pillRef} className="rm-drag-pill v-t-micro" aria-hidden="true">
        {dragLabel}
      </div>
    </section>
  );
}
