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

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { Hairline } from "@/components/motion/DecorLines";
import { idx2, imgSrcSet, lari, pick, type RmCategory, type RmItem } from "./types";

export default function RmMenu({
  categories,
  locale,
  index,
  label,
  layout = "gallery",
  allLabel = "ALL",
  onOpen,
  onActiveCat,
}: {
  categories: RmCategory[];
  locale: string;
  index: string;
  label: string;
  /** "gallery" — one continuous Pinterest feed; "rows" — editorial ruled list. */
  layout?: "rows" | "gallery";
  /** Chip label for the unfiltered feed (gallery mode). */
  allLabel?: string;
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

  // ── Feed state (gallery mode): one continuous wall + category filter ──────
  const [filter, setFilter] = useState<string>("all");
  const feed = useMemo(() => {
    const out: Array<{ item: RmItem; cat: RmCategory }> = [];
    for (const c of categories) {
      if (filter !== "all" && c._id !== filter) continue;
      for (const it of c.items) out.push({ item: it, cat: c });
    }
    return out;
  }, [categories, filter]);

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
      if (layout === "gallery") {
        // One feed → one stagger deal-out; re-runs on every filter change
        // because the wall remounts (key={filter}) and deps include filter.
        const wall = root.querySelector<HTMLElement>(".rm-mas");
        const cards = wall?.querySelectorAll<HTMLElement>(".rm-mas-card");
        if (wall && cards?.length) {
          gsap.from(cards, {
            y: 34,
            opacity: 0,
            duration: 0.75,
            ease: "expo.out",
            stagger: 0.04,
            scrollTrigger: {
              trigger: wall,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          });
        }
      } else {
        root.querySelectorAll<HTMLElement>("[data-rm-cat]").forEach((sec) => {
          const cells = sec.querySelectorAll<HTMLElement>(".rm-row");
          if (!cells.length) return;
          gsap.from(cells, {
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
      }
      ScrollTrigger.refresh();
    });

    return () => {
      spies.forEach((s) => s.kill());
      mm.revert();
    };
  }, [categories.length, totalItems, onActiveCat, layout, filter]);

  // ── The follower (rows layout only — gallery cards carry their images) ────
  useEffect(() => {
    if (layout !== "rows") return;
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
  }, [totalItems, layout]);

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

        {layout === "rows" ? (
          /* ── Editorial mode: per-category sections with sticky headers ── */
          categories.map((cat, ci) => {
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
          })
        ) : (
          /* ── Feed mode: sticky filter chips + ONE continuous Pinterest wall ── */
          <>
            <div className="rm-filter v-t-mono" role="tablist" aria-label={label}>
              <button
                type="button"
                role="tab"
                aria-selected={filter === "all"}
                onClick={() => setFilter("all")}
                className={cn("rm-nav-cat", filter === "all" && "is-active")}
              >
                {allLabel}{" "}
                <span style={{ color: "var(--v-faint)" }}>({totalItems})</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  role="tab"
                  aria-selected={filter === cat._id}
                  onClick={() => setFilter(filter === cat._id ? "all" : cat._id)}
                  className={cn("rm-nav-cat", filter === cat._id && "is-active")}
                >
                  {pick(cat.name, locale)}{" "}
                  <span style={{ color: "var(--v-faint)" }}>
                    ({cat.items.length})
                  </span>
                </button>
              ))}
            </div>

            <div className="rm-mas" role="list" key={filter}>
              {feed.map(({ item, cat }, fi) => {
                const nn = String(fi + 1).padStart(2, "0");
                const name = pick(item.name, locale);
                const catName = pick(cat.name, locale);
                const src = item.imageUrl ?? cat.imageUrl ?? null;
                const img = src ? imgSrcSet(src) : null;
                // Deterministic variety: aspect + poster tone by feed index.
                const aspect = (fi * 2 + 1) % 5;
                const tone =
                  fi % 7 === 3 ? "accent" : fi % 2 ? "raise" : "line";
                return (
                  <button
                    key={item._id}
                    type="button"
                    role="listitem"
                    className="rm-mas-card"
                    data-a={aspect}
                    onClick={() => onOpen(item, cat)}
                  >
                    <span className="rm-mas-img" data-tone={img ? undefined : tone}>
                      {img ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.src}
                            {...(img.srcSet
                              ? {
                                  srcSet: img.srcSet,
                                  sizes:
                                    "(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw",
                                }
                              : {})}
                            alt={name}
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                          />
                          <span className="rm-mas-idx v-t-mono">{nn}</span>
                          <span className="rm-mas-price v-t-mono">
                            ₾ {lari(item.price)}
                          </span>
                        </>
                      ) : (
                        /* Typographic poster card */
                        <span className="rm-mas-fill">
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="v-t-mono" data-dim>
                              {nn}
                            </span>
                            <span className="v-t-micro" data-dim>
                              {catName}
                            </span>
                          </span>
                          <span className="rm-mas-fill-name">{name}</span>
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="v-t-mono tabular-nums">
                              ₾ {lari(item.price)}
                            </span>
                            {item.tags[0] && (
                              <span className="v-t-micro" data-dim>
                                {item.tags[0]}
                              </span>
                            )}
                          </span>
                        </span>
                      )}
                    </span>

                    {img && (
                      <span className="rm-mas-meta">
                        <span className="rm-mas-name truncate">{name}</span>
                        <span
                          className="v-t-micro shrink-0"
                          style={{ color: "var(--v-faint)" }}
                        >
                          {catName}
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* The follower — food imagery in FULL COLOR (rows layout only) */}
      {layout === "rows" && (
        <div ref={followerRef} className="rm-follower" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={followerImgRef} alt="" draggable={false} />
        </div>
      )}
    </section>
  );
}
