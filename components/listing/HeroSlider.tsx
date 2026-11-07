"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import type { PublicListing } from "@/convex-helpers-api";
import { categoryName } from "@/lib/collections";
import { cn } from "@/lib/utils";
import { ArrowIcon } from "@/components/site/ui";

/** Seconds each slide stays before autoplay moves on. */
const INTERVAL = 5.5;

/** See-through stroke around the cards and the controls on the white page. No shadow. */
const frame =
  "border border-black/[0.07] bg-black/[0.035] backdrop-blur-xl [-webkit-backdrop-filter:blur(24px)]";

type Card = { listing: PublicListing; key: string };

/** Signed distance from `d` to 0 on a loop of length n, in [-n/2, n/2). */
function wrap(d: number, n: number) {
  return ((((d + n / 2) % n) + n) % n) - n / 2;
}

const pad = (v: number) => String(v).padStart(2, "0");

function nearby(centre: number, n: number) {
  const out = new Set<number>();
  for (let k = -2; k <= 2; k++) out.add((((centre + k) % n) + n) % n);
  return out;
}

/**
 * Home header: an endless row of 16:9 (1920×1080) screenshot cards with a
 * glass stroke. The centre card is the link to its listing; neighbours sit
 * smaller and turned away. Drag or flick it (mouse, touch, trackpad), use
 * the arrows or keys, or let it play. GSAP drives one number (the position);
 * every frame writes transforms directly, so React only re-renders when the
 * centre card changes. Only cards near the centre load their image.
 */
export function HeroSlider({ listings }: { listings: PublicListing[] }) {
  const slides = useMemo(() => listings.filter((l) => l.coverUrl), [listings]);
  const count = slides.length;
  // A loop needs a few cards on each side: repeat short lists.
  const ring = useMemo<Card[]>(() => {
    if (count < 2) return slides.map((l) => ({ listing: l, key: l.slug }));
    const total = count * Math.max(1, Math.ceil(5 / count));
    return Array.from({ length: total }, (_, i) => ({
      listing: slides[i % count],
      key: `${slides[i % count].slug}~${Math.floor(i / count)}`,
    }));
  }, [slides, count]);
  const n = ring.length;
  const interactive = count > 1;

  const viewportRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);
  const captionRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorLabelRef = useRef<HTMLSpanElement>(null);

  const pos = useRef({ p: 0 }); // fractional ring index at the centre
  const step = useRef(0); // px between card centres
  const tween = useRef<gsap.core.Tween | null>(null);
  const auto = useRef<gsap.core.Timeline | null>(null);
  const activeRef = useRef(0);
  const drag = useRef<{ x: number; p: number; lastX: number; lastT: number; v: number } | null>(null);
  const moved = useRef(false);
  const hovering = useRef(false);
  const reduced = useRef(false);
  const wheelLock = useRef(0);
  const cursor = useRef<{ x: (v: number) => void; y: (v: number) => void } | null>(null);
  const pageScroll = useRef<gsap.core.Timeline | null>(null);
  const slideDuration = useRef(INTERVAL);
  const advance = useRef<() => void>(() => {});
  // Height ÷ width of each screenshot, by slug, once loaded. Taller than 16:9
  // means a full-page screenshot, which the centre card scrolls through.
  const [ratios, setRatios] = useState<Record<string, number>>({});

  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState<Set<number>>(() => nearby(0, n || 1));

  /** Place every card for position p. */
  const render = useCallback(
    (p: number) => {
      const s = step.current;
      for (let i = 0; i < n; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const d = n > 1 ? wrap(i - p, n) : 0;
        const ad = Math.abs(d);
        const c = Math.min(ad, 2);
        el.style.transform = `translate3d(${d * s}px,0,0) rotateY(${gsap.utils.clamp(-14, 14, -d * 9)}deg) scale(${1 - c * 0.13})`;
        el.style.opacity = String(ad > 2.4 ? 0 : 1 - c * 0.3);
        el.style.zIndex = String(100 - Math.round(ad * 10));
        el.style.visibility = ad > 2.6 ? "hidden" : "visible";
        const media = mediaRefs.current[i];
        if (media) media.style.transform = `translate3d(${gsap.utils.clamp(-6, 6, -d * 5)}%,0,0) scale(1.14)`;
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

  /**
   * Restart the autoplay clock for the centre card (progress line back to 0).
   * It runs for the slide's duration: longer when a full page scrolls.
   */
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
    (target: number, duration = 1.15, ease = "expo.inOut") => {
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

  const by = useCallback((delta: number) => goTo(Math.round(pos.current.p) + delta), [goTo]);

  // Measure on mount and resize; first placement.
  useLayoutEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const spacer = spacerRef.current;
    if (!spacer) return;
    const measure = () => {
      const w = spacer.offsetWidth;
      const mobile = window.innerWidth < 768;
      step.current = w * (mobile ? 0.92 : 0.86) + (mobile ? 12 : 24);
      render(pos.current.p);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(spacer);
    return () => ro.disconnect();
  }, [render]);

  useEffect(() => {
    advance.current = () => by(1);
  }, [by]);

  // Intro, pause in background tabs, cleanup.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport && !reduced.current) {
      gsap.fromTo(viewport, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out" });
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
      pageScroll.current?.kill();
      auto.current = null;
    };
  }, []);

  // Full-page screenshots: the centre card scrolls down the page, holds,
  // glides back up, and repeats; other cards return to the top.
  useEffect(() => {
    pageScroll.current?.kill();
    pageScroll.current = null;
    scrollRefs.current.forEach((el, i) => {
      if (el && i !== active) gsap.to(el, { y: 0, duration: 0.6, ease: "power3.out", overwrite: true });
    });
    slideDuration.current = INTERVAL;

    const el = scrollRefs.current[active];
    const box = el?.parentElement?.parentElement; // the 16:9 window
    const distance = el && box ? el.offsetHeight - box.offsetHeight : 0;
    if (el && distance > 40 && !reduced.current) {
      const down = gsap.utils.clamp(4, 16, distance / 170); // about 170 px a second
      const tl = gsap.timeline({ repeat: -1, delay: 0.9 });
      tl.fromTo(el, { y: 0 }, { y: -distance, duration: down, ease: "power1.inOut" })
        .to(el, { y: 0, duration: 1.4, ease: "expo.inOut" }, "+=1.2")
        .to({}, { duration: 0.8 });
      pageScroll.current = tl;
      // Move on once the page has reached the bottom.
      slideDuration.current = Math.max(INTERVAL, 0.9 + down + 1);
    }
    rearm();
  }, [active, ratios, rearm]);

  // Caption reveal whenever the centre card changes.
  useLayoutEffect(() => {
    const lines = captionRef.current?.querySelectorAll("[data-reveal]");
    if (!lines?.length || reduced.current) return;
    gsap.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 0.85, ease: "expo.out", stagger: 0.07 });
  }, [active]);

  // Cursor follower (mouse only).
  useEffect(() => {
    const el = cursorRef.current;
    if (!el || !interactive || !window.matchMedia("(pointer: fine)").matches) return;
    gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0 });
    cursor.current = {
      x: gsap.quickTo(el, "x", { duration: 0.45, ease: "power3" }),
      y: gsap.quickTo(el, "y", { duration: 0.45, ease: "power3" }),
    };
    return () => {
      cursor.current = null;
    };
  }, [interactive]);

  const setLabel = (text: string) => {
    const label = cursorLabelRef.current;
    if (label && label.textContent !== text) label.textContent = text;
  };

  const labelFor = (target: EventTarget | null) => {
    if (drag.current && moved.current) return "Drag";
    const card = (target as Element | null)?.closest?.("[data-ring]");
    if (!card) return "Drag";
    const d = wrap(Number(card.getAttribute("data-ring")) - pos.current.p, n);
    return Math.abs(d) < 0.5 ? "View" : d > 0 ? "Next" : "Prev";
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
    setLabel(labelFor(e.target));
  };

  const onPointerEnter = (e: React.PointerEvent) => {
    if (!interactive) return;
    hovering.current = true;
    auto.current?.pause();
    if (cursor.current && e.pointerType === "mouse") {
      trackCursor(e, true);
      gsap.to(cursorRef.current, { scale: 1, duration: 0.35, ease: "power3.out" });
    }
  };

  const onPointerLeave = () => {
    if (!interactive) return;
    hovering.current = false;
    if (cursor.current) gsap.to(cursorRef.current, { scale: 0, duration: 0.3, ease: "power3.out" });
    if (!drag.current && !tween.current?.isActive()) auto.current?.play();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!interactive || (e.pointerType === "mouse" && e.button !== 0)) return;
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
        // Flick: carry the release speed (about 260 ms of travel), at most two cards.
        const fling = gsap.utils.clamp(-2, 2, -(g.v * 260) / (step.current || 1));
        goTo(Math.round(pos.current.p + fling), 0.95, "power3.out");
      } else if (Math.abs(pos.current.p - Math.round(pos.current.p)) > 0.001) {
        goTo(Math.round(pos.current.p), 0.6, "power3.out");
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
    const d = wrap(i - pos.current.p, n);
    if (Math.abs(d) > 0.5) {
      e.preventDefault();
      goTo(Math.round(pos.current.p + d));
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    if (!interactive || Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 8) return;
    const now = performance.now();
    if (now - wheelLock.current < 700) return;
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
      className="relative flex w-full flex-col items-center overflow-hidden bg-white px-4 pt-28 pb-12 [--card-w:86vw] md:min-h-[100svh] md:justify-center md:px-6 md:pt-[112px] md:[--card-w:min(76vw,1120px,calc((100svh-20rem)*16/9))]"
      onKeyDown={(e) => {
        if (!interactive) return;
        if (e.key === "ArrowRight") by(1);
        if (e.key === "ArrowLeft") by(-1);
      }}
    >
      <div
        ref={viewportRef}
        className={cn(
          "relative w-full touch-pan-y select-none [perspective:1800px]",
          interactive && "pointer-fine:cursor-none pointer-fine:[&_a]:cursor-none",
        )}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerMove={(e) => trackCursor(e)}
        onPointerDown={onPointerDown}
        onWheel={onWheel}
      >
        {/* Sizes the row and gives the card width to measure. */}
        <div ref={spacerRef} aria-hidden="true" className="invisible mx-auto w-[var(--card-w)] rounded-[28px] border p-2 md:p-3">
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
              style={i === 0 ? { zIndex: 100 } : { opacity: 0, zIndex: 0 }}
              className={cn(
                "absolute inset-x-0 top-0 mx-auto block w-[var(--card-w)] rounded-[28px] p-2 will-change-transform md:rounded-[36px] md:p-3",
                frame,
              )}
            >
              <div className="relative aspect-video overflow-hidden rounded-[20px] bg-black/[0.03] md:rounded-[26px]">
                <div
                  ref={(el) => {
                    mediaRefs.current[i] = el;
                  }}
                  className="absolute inset-0 origin-top will-change-transform"
                >
                  <div
                    ref={(el) => {
                      scrollRefs.current[i] = el;
                    }}
                    className="absolute inset-x-0 top-0 h-full will-change-transform"
                    style={tall ? { height: "auto", aspectRatio: `1 / ${ratio}` } : undefined}
                  >
                    {loaded.has(i) && (
                      <Image
                        src={card.listing.coverUrl!}
                        alt={isActive ? `${card.listing.title} website screenshot` : ""}
                        fill
                        draggable={false}
                        sizes="(min-width: 768px) 76vw, 86vw"
                        priority={i === 0}
                        className="object-cover object-top"
                        onLoad={(e) => {
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

        {/* Cursor follower: View / Next / Prev / Drag. */}
        {interactive && (
          <div
            ref={cursorRef}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 z-[200] hidden size-[88px] scale-0 place-items-center rounded-full bg-black text-white pointer-fine:grid"
          >
            <span ref={cursorLabelRef} className="text-[11px] font-semibold tracking-[0.08em] uppercase">
              Drag
            </span>
          </div>
        )}
      </div>

      {/* Caption under the card. */}
      <div ref={captionRef} className="mt-6 flex w-[var(--card-w)] max-w-full items-end justify-between gap-6 md:mt-8">
        <div className="min-w-0" aria-live="polite">
          <p className="overflow-hidden font-mono text-[10.5px] tracking-[0.08em] text-black/50 tabular-nums">
            <span data-reveal className="block">
              {pad(number)} / {pad(count)}
            </span>
          </p>
          <p className="mt-2 overflow-hidden">
            <span
              data-reveal
              className="block truncate text-[clamp(1.5rem,2.6vw,2.5rem)] leading-[1.08] font-semibold tracking-[-0.05em]"
            >
              {current.title}
            </span>
          </p>
          <p className="overflow-hidden">
            <span data-reveal className="block truncate text-sm text-black/55">
              by {current.creditName} · {categoryName(current.category)}
            </span>
          </p>
        </div>

        {interactive && (
          <div className={cn("flex shrink-0 items-center gap-1 rounded-full p-1.5", frame)}>
            <button
              type="button"
              onClick={() => by(-1)}
              aria-label="Previous website"
              className="grid size-10 place-items-center rounded-full transition-colors hover:bg-black hover:text-white"
            >
              <ArrowIcon className="size-4 -rotate-[135deg]" />
            </button>
            <button
              type="button"
              onClick={() => by(1)}
              aria-label="Next website"
              className="grid size-10 place-items-center rounded-full transition-colors hover:bg-black hover:text-white"
            >
              <ArrowIcon className="size-4 rotate-45" />
            </button>
          </div>
        )}
      </div>

      {interactive && (
        <div aria-hidden="true" className="mt-5 h-px w-[var(--card-w)] max-w-full bg-black/10">
          <div ref={barRef} className="h-full origin-left scale-x-0 bg-black" />
        </div>
      )}
    </section>
  );
}
