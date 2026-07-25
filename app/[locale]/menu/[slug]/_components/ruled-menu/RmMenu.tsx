"use client";

// ruled-menu/RmMenu.tsx
// The core — units.gr-grade ruled menu list.
//  • One block per category: sticky mono header (`02/05 — COFFEE ( 12 )`),
//    hairline, then baseline-grid item rows.
//  • Rows: mono index · display name · tabular price, description + tag chips
//    below. Hover slides the name, flips index/price to accent, sweeps the
//    row hairline.
//  • The follower: a fixed 4:5 image that lerps to the cursor (gsap.quickTo)
//    and clip-wipes open over rows with imagery — THE awwwards signature.
//    Pointer-fine only; tap/click opens the item sheet everywhere.
//  • Scroll-spy: each category section reports itself active to the nav.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Hairline } from "@/components/motion/DecorLines";
import { idx2, imgSrcSet, lari, pick, type RmCategory, type RmItem } from "./types";

export default function RmMenu({
  categories,
  locale,
  index,
  label,
  onOpen,
  onActiveCat,
}: {
  categories: RmCategory[];
  locale: string;
  index: string;
  label: string;
  onOpen: (item: RmItem, category: RmCategory) => void;
  onActiveCat: (id: string | null) => void;
}) {
  const rootRef = useRef<HTMLElement | null>(null);
  const followerRef = useRef<HTMLDivElement | null>(null);
  const followerImgRef = useRef<HTMLImageElement | null>(null);
  const openState = useRef<{ open: boolean; src: string | null }>({
    open: false,
    src: null,
  });

  const totalItems = categories.reduce((n, c) => n + c.items.length, 0);

  // ── Scroll-spy + row entrances ─────────────────────────────────────────────
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    // Scroll-spy runs regardless of motion preference (it's navigation state).
    const spies: ScrollTrigger[] = [];
    root.querySelectorAll<HTMLElement>("[data-rm-cat]").forEach((sec) => {
      spies.push(
        ScrollTrigger.create({
          trigger: sec,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => {
            if (self.isActive) onActiveCat(sec.dataset.rmCat ?? null);
          },
        }),
      );
    });

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      root.querySelectorAll<HTMLElement>("[data-rm-cat]").forEach((sec) => {
        const rows = sec.querySelectorAll<HTMLElement>(".rm-row");
        if (!rows.length) return;
        gsap.from(rows, {
          y: 26,
          opacity: 0,
          duration: 0.75,
          ease: "expo.out",
          stagger: 0.055,
          scrollTrigger: {
            trigger: sec,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        });
      });
    });

    return () => {
      spies.forEach((s) => s.kill());
      mm.revert();
    };
  }, [categories.length, totalItems, onActiveCat]);

  // ── The follower ───────────────────────────────────────────────────────────
  useEffect(() => {
    const root = rootRef.current;
    const follower = followerRef.current;
    const img = followerImgRef.current;
    if (!root || !follower || !img) return;

    const mm = gsap.matchMedia();
    mm.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      gsap.set(follower, { xPercent: 12, yPercent: -50 });
      const xTo = gsap.quickTo(follower, "x", { duration: 0.55, ease: "power3.out" });
      const yTo = gsap.quickTo(follower, "y", { duration: 0.55, ease: "power3.out" });

      const open = () => {
        openState.current.open = true;
        gsap.to(follower, {
          clipPath: "inset(0% 0 0 0)",
          duration: 0.55,
          ease: "expo.out",
        });
        gsap.to(img, { scale: 1, duration: 0.7, ease: "expo.out" });
      };
      const close = () => {
        openState.current.open = false;
        gsap.to(follower, {
          clipPath: "inset(100% 0 0 0)",
          duration: 0.4,
          ease: "power2.in",
        });
        gsap.to(img, { scale: 1.15, duration: 0.4, ease: "power2.in" });
      };

      const move = (e: MouseEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
      };

      const over = (e: MouseEvent) => {
        const row = (e.target as HTMLElement).closest<HTMLElement>("[data-rm-img]");
        if (!row) return;
        const src = row.dataset.rmImg || null;
        if (!src) return;
        if (openState.current.src !== src) {
          openState.current.src = src;
          img.src = src;
          // Tiny scale kick on swap so consecutive rows feel alive.
          if (openState.current.open) {
            gsap.fromTo(img, { scale: 1.12 }, { scale: 1, duration: 0.6, ease: "expo.out" });
          }
        }
        if (!openState.current.open) open();
      };

      const out = (e: MouseEvent) => {
        const to = e.relatedTarget as HTMLElement | null;
        if (to && to.closest("[data-rm-img]")) return; // row → row
        if (openState.current.open) close();
      };

      root.addEventListener("mousemove", move);
      root.addEventListener("mouseover", over);
      root.addEventListener("mouseout", out);
      return () => {
        root.removeEventListener("mousemove", move);
        root.removeEventListener("mouseover", over);
        root.removeEventListener("mouseout", out);
        openState.current = { open: false, src: null };
      };
    });

    return () => mm.revert();
  }, [totalItems]);

  let running = 0; // running item counter across categories → global row index

  return (
    <section className="rm-sec" ref={rootRef} id="menu">
      <div className="rm-wrap">
        {/* Section lockup */}
        <div className="v-shead-row v-t-mono" style={{ color: "var(--v-faint)" }}>
          <span>
            {index} — {label}
          </span>
          <span>( {totalItems} )</span>
        </div>
        <Hairline plusMarks />

        {categories.map((cat, ci) => {
          const catName = pick(cat.name, locale);
          return (
            <div
              key={cat._id}
              id={`rm-cat-${cat._id}`}
              data-rm-cat={cat._id}
              className="rm-cat mt-14 first-of-type:mt-10"
            >
              {/* Sticky category header */}
              <div className="rm-cat-head">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="flex items-baseline gap-3 min-w-0">
                    <span className="v-t-mono" style={{ color: "var(--v-accent)" }}>
                      {idx2(ci)}/{idx2(categories.length - 1)}
                    </span>
                    <span className="font-v-display text-[clamp(1.5rem,3.4vw,2.4rem)] font-medium tracking-tight leading-none truncate uppercase">
                      {catName}
                    </span>
                  </h2>
                  <span className="v-t-mono tabular-nums shrink-0" style={{ color: "var(--v-faint)" }}>
                    ( {cat.items.length} )
                  </span>
                </div>
                <span className="v-line-x mt-3" aria-hidden="true" />
              </div>

              {/* Rows */}
              <div role="list">
                {cat.items.map((item) => {
                  running += 1;
                  const hoverSrc = item.imageUrl ?? cat.imageUrl ?? null;
                  const hoverUrl = hoverSrc ? imgSrcSet(hoverSrc).src : null;
                  return (
                    <button
                      key={item._id}
                      type="button"
                      role="listitem"
                      className="rm-row"
                      onClick={() => onOpen(item, cat)}
                      {...(hoverUrl ? { "data-rm-img": hoverUrl } : {})}
                    >
                      <span className="rm-row-idx v-t-mono tabular-nums">
                        {String(running).padStart(2, "0")}
                      </span>

                      <span className="min-w-0">
                        <span className="rm-row-name block">
                          {pick(item.name, locale)}
                        </span>
                        {item.description && (
                          <span className="rm-row-desc v-t-small block">
                            {pick(item.description, locale)}
                          </span>
                        )}
                        {item.tags.length > 0 && (
                          <span className="rm-row-tags">
                            {item.tags.map((t) => (
                              <span key={t} className="rm-chip v-t-micro">
                                {t}
                              </span>
                            ))}
                          </span>
                        )}
                      </span>

                      <span className="rm-row-price">₾ {lari(item.price)}</span>
                      <span className="rm-row-line" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* The follower — food imagery in FULL COLOR */}
      <div ref={followerRef} className="rm-follower" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={followerImgRef} alt="" draggable={false} />
      </div>
    </section>
  );
}
