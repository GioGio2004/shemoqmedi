"use client";

import { MediaImage as Image } from "@/components/site/MediaImage";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import type { PublicListing } from "@/convex-helpers-api";
import { cn } from "@/lib/utils";
import { ArrowIcon } from "@/components/site/ui";

/** Seconds a slide stays when its screenshot does not scroll. */
const INTERVAL = 6;

/** See-through stroke around the card on the white page. No shadow. */
const frame =
  "border border-black/[0.07] bg-black/[0.035] backdrop-blur-xl [-webkit-backdrop-filter:blur(24px)]";

/** Frosted glass for the small tags that sit on the screenshot. */
const glass =
  "border border-white/60 bg-white/60 backdrop-blur-xl [-webkit-backdrop-filter:blur(24px)_saturate(1.5)]";

type Card = { listing: PublicListing; key: string };

/** Signed distance from `d` to 0 on a loop of length n, in [-n/2, n/2). */
function wrap(d: number, n: number) {
  return ((((d + n / 2) % n) + n) % n) - n / 2;
}

const pad = (v: number) => String(v).padStart(2, "0");

function nearby(centre: number, n: number) {
  const out = new Set<number>();
  for (let k = -1; k <= 1; k++) out.add((((centre + k) % n) + n) % n);
  return out;
}

/**
 * Home header: one full-width 16:9 card per listing, in an endless loop.
 *
 * Motion: between slides every card pulls back (scales down, corners
 * round), glides sideways and pushes in again. Screenshots themselves stay
 * still (no zoom); only a full-page screenshot (taller than 16:9) scrolls
 * down the site and glides back up.
 * Drag or flick it (mouse, touch, trackpad), use the arrows or keys, or let
 * it play. GSAP drives one number (the position) and every frame writes
 * transforms directly, so React re-renders only when the centre card
 * changes. First paint loads only the first slide's image, at high fetch
 * priority (it is the page's LCP). Its two neighbours follow once it has
 * loaded, or on the first drag, arrow or key press; after that the centre
 * card and its two neighbours are kept loaded.
 */
export function HeroSlider({ listings }: { listings: PublicListing[] }) {
  const slides = useMemo(() => listings.filter((l) => l.coverUrl), [listings]);
  const count = slides.length;
  // A loop needs a card on each side: repeat short lists.
  const ring = useMemo<Card[]>(() => {
    if (count < 2) return slides.map((l) => ({ listing: l, key: l.slug }));
    const total = count * Math.max(1, Math.ceil(3 / count));
    return Array.from({ length: total }, (_, i) => ({
      listing: slides[i % count],
      key: `${slides[i % count].slug}~${Math.floor(i / count)}`,
    }));
  }, [slides, count]);
  const n = ring.length;
  const interactive = count > 1;

  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorLabelRef = useRef<HTMLSpanElement>(null);

  const pos = useRef({ p: 0 }); // fractional ring index at the centre
  const step = useRef(0); // px between card centres
  const tween = useRef<gsap.core.Tween | null>(null);
  const auto = useRef<gsap.core.Timeline | null>(null);
  const motion = useRef<gsap.core.Timeline | gsap.core.Tween | null>(null);
  const slideDuration = useRef(INTERVAL);
  const advance = useRef<() => void>(() => {});
  const activeRef = useRef(0);
  const drag = useRef<{ x: number; p: number; lastX: number; lastT: number; v: number } | null>(null);
  const moved = useRef(false);
  const hovering = useRef(false);
  const reduced = useRef(false);
  const wheelLock = useRef(0);
  const cursor = useRef<{ x: (v: number) => void; y: (v: number) => void } | null>(null);
  const warmed = useRef(false);

  const [active, setActive] = useState(0);
  // Ring indexes whose image is rendered. Only the first slide at first paint.
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0]));
  // Height ÷ width of each screenshot (by slug) once loaded.
  const [ratios, setRatios] = useState<Record<string, number>>({});

  /** Place every card for position p. */
  const render = useCallback(
    (p: number) => {
      const s = step.current;
      // 0 at rest, 1 halfway between two slides: drives the pull-back.
      const between = Math.sin(Math.PI * Math.abs(p - Math.round(p)));
      const pull = 1 - 0.14 * between;
      const radius = 22 + 26 * between;
      for (let i = 0; i < n; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const d = n > 1 ? wrap(i - p, n) : 0;
        const ad = Math.abs(d);
        el.style.transform = `translate3d(${d * s * pull}px,0,0) scale(${pull})`;
        el.style.zIndex = String(100 - Math.round(ad * 10));
        el.style.visibility = ad > 1.6 ? "hidden" : "visible";
        el.style.borderRadius = `${radius + 8}px`;
        const box = boxRefs.current[i];
        if (box) box.style.borderRadius = `${radius}px`;
      }
      const idx = (((Math.round(p) % n) + n) % n) || 0;
      if (idx !== activeRef.current) {
        activeRef.current = idx;
        setActive(idx);
        setLoaded((prev) => {
          const add = [...nearby(idx, n)].filter((k) => !prev.has(k));
          return add.length ? new Set([...prev, ...add]) : prev;
        });
      }
    },
    [n],
  );

  /** Load the centre card's neighbours, once: after the first image, or on the first interaction. */
  const warm = useCallback(() => {
    if (warmed.current || n < 2) return;
    warmed.current = true;
    setLoaded((prev) => {
      const add = [...nearby(activeRef.current, n)].filter((k) => !prev.has(k));
      return add.length ? new Set([...prev, ...add]) : prev;
    });
  }, [n]);

  // Fallback for a first image that fails to load: warm up on window load.
  // (After a client-side navigation the page is already loaded; the first
  // image's onLoad or an interaction does it.)
  useEffect(() => {
    if (document.readyState === "complete") return;
    window.addEventListener("load", warm, { once: true });
    return () => window.removeEventListener("load", warm);
  }, [warm]);

  /** Restart the autoplay clock for the centre card (progress line back to 0). */
  const rearm = useCallback(() => {
    auto.current?.kill();
    auto.current = null;
    if (!interactive || reduced.current || !barRef.current) return;
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(barRef.current, { scaleX: 0 }, { scaleX: 1, duration: slideDuration.current, ease: "none" });
    tl.call(() => advance.current());
    auto.current = tl;
    if (!hovering.current && !drag.current && !document.hidden && !tween.current?.isActive()) tl.play();
  }, [interactive]);

  const goTo = useCallback(
    (target: number, duration = 1.35, ease = "expo.inOut") => {
      tween.current?.kill();
      auto.current?.pause(0);
      tween.current = gsap.to(pos.current, {
        p: target,
        duration: reduced.current ? 0 : duration,
        ease,
        onUpdate: () => render(pos.current.p),
        onComplete: () => {
          pos.current.p = ((Math.round(pos.current.p) % n) + n) % n;
          render(pos.current.p);
          rearm();
        },
      });
    },
    [n, render, rearm],
  );

  const by = useCallback(
    (delta: number) => {
      warm();
      goTo(Math.round(pos.current.p) + delta);
    },
    [goTo, warm],
  );

  useEffect(() => {
    advance.current = () => by(1);
  }, [by]);

  // Measure on mount and resize; first placement.
  useLayoutEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const viewport = viewportRef.current;
    if (!viewport) return;
    const measure = () => {
      step.current = viewport.offsetWidth + (window.innerWidth < 768 ? 16 : 32);
      render(pos.current.p);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    return () => ro.disconnect();
  }, [render]);

  // Intro (the card opens out from the centre), background-tab pause, cleanup.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport && !reduced.current) {
      gsap.fromTo(
        viewport,
        { clipPath: "inset(14% 20% 14% 20% round 48px)", opacity: 0.4 },
        { clipPath: "inset(0% 0% 0% 0% round 0px)", opacity: 1, duration: 1.7, ease: "expo.inOut", clearProps: "clipPath" },
      );
    }
    const onVisibility = () => {
      if (document.hidden) auto.current?.pause();
      else if (!hovering.current && !drag.current && !tween.current?.isActive()) auto.current?.play();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      auto.current?.kill();
      tween.current?.kill();
      motion.current?.kill();
      auto.current = null;
    };
  }, []);

  // A full-page screenshot on the centre card scrolls down and back up;
  // 16:9 ones stay still. Other cards return to the top.
  useEffect(() => {
    motion.current?.kill();
    motion.current = null;
    scrollRefs.current.forEach((el, i) => {
      if (el && i !== active) gsap.to(el, { y: 0, duration: 0.8, ease: "power3.out", overwrite: true });
    });
    slideDuration.current = INTERVAL;

    const el = scrollRefs.current[active];
    const box = boxRefs.current[active];
    if (el && box && !reduced.current) {
      const distance = el.offsetHeight - box.offsetHeight;
      if (distance > 40) {
        const down = gsap.utils.clamp(5, 18, distance / 180); // about 180 px a second
        const tl = gsap.timeline({ repeat: -1, delay: 1.1 });
        tl.fromTo(el, { y: 0 }, { y: -distance, duration: down, ease: "power1.inOut" })
          .to(el, { y: 0, duration: 1.6, ease: "expo.inOut" }, "+=1.4")
          .to({}, { duration: 1 });
        motion.current = tl;
        slideDuration.current = Math.max(INTERVAL, 1.1 + down + 1.2); // move on at the bottom
      }
    }
    rearm();

    // Caption: the title rises in.
    if (titleRef.current && !reduced.current) {
      gsap.fromTo(titleRef.current, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "expo.out", delay: 0.15 });
    }
  }, [active, ratios, rearm]);

  // Cursor follower (mouse only).
  useEffect(() => {
    const el = cursorRef.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0 });
    cursor.current = {
      x: gsap.quickTo(el, "x", { duration: 0.45, ease: "power3" }),
      y: gsap.quickTo(el, "y", { duration: 0.45, ease: "power3" }),
    };
    return () => {
      cursor.current = null;
    };
  }, []);

  const setLabel = (text: string) => {
    const label = cursorLabelRef.current;
    if (label && label.textContent !== text) label.textContent = text;
  };

  const trackCursor = (e: React.PointerEvent, snap = false) => {
    const c = cursor.current;
    const vp = viewportRef.current;
    if (!c || !vp || e.pointerType !== "mouse") return;
    const r = vp.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (snap) gsap.set(cursorRef.current, { x, y });
    else {
      c.x(x);
      c.y(y);
    }
    if (!(drag.current && moved.current)) setLabel(interactive ? "Drag" : "View");
  };

  const onPointerEnter = (e: React.PointerEvent) => {
    hovering.current = true;
    auto.current?.pause();
    if (cursor.current && e.pointerType === "mouse") {
      trackCursor(e, true);
      gsap.to(cursorRef.current, { scale: 1, duration: 0.35, ease: "power3.out" });
    }
  };

  const onPointerLeave = () => {
    hovering.current = false;
    if (cursor.current) gsap.to(cursorRef.current, { scale: 0, duration: 0.3, ease: "power3.out" });
    if (!drag.current && !tween.current?.isActive()) auto.current?.play();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!interactive || (e.pointerType === "mouse" && e.button !== 0)) return;
    warm();
    tween.current?.kill();
    auto.current?.pause();
    moved.current = false;
    drag.current = { x: e.clientX, p: pos.current.p, lastX: e.clientX, lastT: performance.now(), v: 0 };
    if (cursor.current) gsap.to(cursorRef.current, { scale: 0.82, duration: 0.25 });

    const move = (ev: PointerEvent) => {
      const g = drag.current;
      if (!g) return;
      const dx = ev.clientX - g.x;
      if (!moved.current && Math.abs(dx) > 6) {
        moved.current = true;
        setLabel("Drag");
      }
      if (!moved.current) return;
      const now = performance.now();
      g.v = g.v * 0.6 + ((ev.clientX - g.lastX) / Math.max(1, now - g.lastT)) * 0.4; // px per ms
      g.lastX = ev.clientX;
      g.lastT = now;
      pos.current.p = g.p - dx / (step.current || 1);
      render(pos.current.p);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      const g = drag.current;
      drag.current = null;
      if (cursor.current) gsap.to(cursorRef.current, { scale: hovering.current ? 1 : 0, duration: 0.3 });
      if (!g) return;
      if (moved.current) {
        if (performance.now() - g.lastT > 80) g.v = 0; // held still before letting go: no flick
        // A flick or a drag past a fifth of the card moves one slide.
        const fling = -(g.v * 260) / (step.current || 1);
        const offset = pos.current.p - g.p + fling;
        const delta = Math.abs(offset) > 0.2 ? Math.sign(offset) : 0;
        goTo(Math.round(g.p) + delta, 1.1, "power3.out");
      } else if (!hovering.current) {
        auto.current?.play();
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const onCardClick = (e: React.MouseEvent, i: number) => {
    if (moved.current) {
      e.preventDefault();
      moved.current = false;
      return;
    }
    if (i !== activeRef.current) e.preventDefault();
  };

  const onWheel = (e: React.WheelEvent) => {
    if (!interactive || Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 8) return;
    const now = performance.now();
    if (now - wheelLock.current < 900) return;
    wheelLock.current = now;
    by(Math.sign(e.deltaX));
  };

  if (count === 0) return null;
  const current = ring[active]?.listing ?? slides[0];
  const number = (active % count) + 1;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured websites"
      // `isolate` keeps the cards' z-index (up to 200) inside this section, so
      // they can never paint over the fixed header (z-50) or its menu.
      className="relative isolate w-full overflow-hidden bg-white px-3 pt-[84px] pb-3 md:px-4 md:pt-[92px] md:pb-4"
      onKeyDown={(e) => {
        if (!interactive) return;
        if (e.key === "ArrowRight") by(1);
        if (e.key === "ArrowLeft") by(-1);
      }}
    >
      <div
        ref={viewportRef}
        className="relative w-full touch-pan-y select-none pointer-fine:cursor-none pointer-fine:[&_a]:cursor-none"
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerMove={(e) => trackCursor(e)}
        onPointerDown={onPointerDown}
        onWheel={onWheel}
      >
        {/* Sizes the slider: full width, height from the 16:9 screenshot
            (plus the card frame), so a screenshot is never cropped to fit
            the window. On short screens the hero is simply taller than the
            window. Same padding as the cards so the inner box is exactly 16:9. */}
        <div aria-hidden="true" className="p-1.5 md:p-2">
          <div className="aspect-video" />
        </div>
        {ring.map((card, i) => {
          const isActive = i === active;
          const ratio = ratios[card.listing.slug];
          const tall = ratio !== undefined && ratio > 0.75;
          return (
            <Link
              key={card.key}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              href={`/sites/${card.listing.slug}`}
              data-ring={i}
              draggable={false}
              tabIndex={isActive ? 0 : -1}
              aria-hidden={!isActive}
              aria-label={isActive ? `${card.listing.title}, by ${card.listing.creditName}. Open the listing` : undefined}
              onClick={(e) => onCardClick(e, i)}
              style={i === 0 ? { zIndex: 100 } : { visibility: "hidden", zIndex: 0 }}
              className={cn("absolute inset-0 block rounded-[30px] p-1.5 will-change-transform md:p-2", frame)}
            >
              <div
                ref={(el) => {
                  boxRefs.current[i] = el;
                }}
                className="relative h-full w-full overflow-hidden rounded-[22px] bg-black/[0.03]"
              >
                <div className="absolute inset-0">
                  <div
                    ref={(el) => {
                      scrollRefs.current[i] = el;
                    }}
                    className="absolute inset-x-0 top-0 h-full origin-top will-change-transform"
                    style={tall ? { height: "auto", aspectRatio: `1 / ${ratio}` } : undefined}
                  >
                    {loaded.has(i) && (
                      <Image
                        src={card.listing.coverUrl!}
                        alt={isActive ? `${card.listing.title} website screenshot` : ""}
                        fill
                        draggable={false}
                        sizes="100vw"
                        // The LCP image: preloaded from the <head> and fetched
                        // ahead of everything else. (`priority` is deprecated
                        // in Next 16 and adds no fetch priority.)
                        preload={i === 0}
                        fetchPriority={i === 0 ? "high" : undefined}
                        // Other cards mount only once wanted (`loaded`), so they
                        // fetch at once: lazy loading would wait until the card
                        // slides into the clipped viewport, i.e. too late.
                        loading={i === 0 ? undefined : "eager"}
                        // Never crop: a non-16:9 shot is shown whole (contain);
                        // a full-page shot fills the width and scrolls through.
                        className={tall ? "object-cover object-top" : "object-contain"}
                        onLoad={(e) => {
                          if (i === 0) warm();
                          const img = e.currentTarget;
                          const slug = card.listing.slug;
                          if (!img.naturalWidth) return;
                          const r = img.naturalHeight / img.naturalWidth;
                          setRatios((prev) => (prev[slug] === r ? prev : { ...prev, [slug]: r }));
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {/* Small caption: counter, name and the autoplay line, bottom left. */}
        <div
          className={cn(
            "pointer-events-none absolute bottom-4 left-4 z-[150] flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-full py-2 pr-4 pl-3.5 md:bottom-6 md:left-6",
            glass,
          )}
          aria-live="polite"
        >
          <span className="font-mono text-[11px] tracking-[0.08em] text-black tabular-nums">
            {pad(number)}/{pad(count)}
          </span>
          {interactive && (
            <span aria-hidden="true" className="h-[2px] w-8 overflow-hidden rounded-full bg-black/15 md:w-12">
              <span ref={barRef} className="block h-full origin-left scale-x-0 bg-black" />
            </span>
          )}
          <span className="min-w-0 overflow-hidden">
            <span ref={titleRef} className="block truncate text-[12.5px] font-semibold tracking-[-0.01em]">
              {current.title}
            </span>
          </span>
        </div>

        {interactive && (
          <div className={cn("absolute right-4 bottom-4 z-[150] flex items-center gap-1 rounded-full p-1 md:right-6 md:bottom-6", glass)}>
            <button
              type="button"
              onClick={() => by(-1)}
              aria-label="Previous website"
              className="grid size-9 place-items-center rounded-full transition-colors hover:bg-black hover:text-white"
            >
              <ArrowIcon className="size-4 -rotate-[135deg]" />
            </button>
            <button
              type="button"
              onClick={() => by(1)}
              aria-label="Next website"
              className="grid size-9 place-items-center rounded-full transition-colors hover:bg-black hover:text-white"
            >
              <ArrowIcon className="size-4 rotate-45" />
            </button>
          </div>
        )}

        {/* Cursor follower: View / Drag. */}
        <div
          ref={cursorRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-[200] hidden size-[88px] scale-0 place-items-center rounded-full bg-black text-white pointer-fine:grid"
        >
          <span ref={cursorLabelRef} className="text-[11px] font-semibold tracking-[0.08em] uppercase">
            {interactive ? "Drag" : "View"}
          </span>
        </div>
      </div>
    </section>
  );
}
