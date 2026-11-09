"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * The live crow in the navbar logo (see crow/nav.ts). The slot renders the
 * static crow mark on the server, so the logo is right with no JavaScript,
 * with reduced motion, on data saver, and before the sprites arrive. After
 * the page has loaded, the live crow takes its place. When the crow flies
 * away, the wordmark slides over its spot (the header layout never changes).
 *
 * ?crowdebug: the intro starts after 1 s, the crow returns after 4 s.
 */
export function NavCrow() {
  const slot = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = slot.current;
    const cv = canvas.current;
    const mark = el?.parentElement; // the wordmark link: data-crow="away" slides the text
    if (!el || !cv || !mark) return;
    const debug = new URLSearchParams(window.location.search).has("crowdebug");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conn?.saveData || /2g/.test(conn?.effectiveType ?? "")) return;

    let engine: { destroy(): void } | null = null;
    let cancelled = false;
    let idleId = 0;

    const reset = () => {
      engine?.destroy();
      engine = null;
      delete el.dataset.live;
      delete mark.dataset.crow;
      delete (window as unknown as { __navCrow?: unknown }).__navCrow;
    };

    const start = async () => {
      if (cancelled || motion.matches || engine) return;
      let intro = true;
      let awayFor = 0;
      try {
        intro = debug || !sessionStorage.getItem("crow-intro");
        sessionStorage.setItem("crow-intro", "1");
        // Away on the previous page (a different header): stay away.
        awayFor = Math.max(0, (Number(sessionStorage.getItem("crow-away-until")) - Date.now()) / 1000);
      } catch {}
      if (awayFor > 0) intro = false;
      const [{ NavCrowEngine, NAV_BASE }, { loadSprites }] = await Promise.all([
        import("./crow/nav"),
        import("./crow/sprites"),
      ]);
      if (cancelled) return;
      const sprites = await loadSprites(intro || awayFor > 0 ? ["idle", "takeoff"] : ["idle"], NAV_BASE);
      if (cancelled || motion.matches || !sprites) return;
      engine = new NavCrowEngine(el, cv, sprites, {
        debug,
        intro,
        awayFor,
        onSlot: (home) => {
          if (home) delete mark.dataset.crow;
          else mark.dataset.crow = "away";
        },
        onAway: (until) => {
          try {
            if (until) sessionStorage.setItem("crow-away-until", String(until));
            else sessionStorage.removeItem("crow-away-until");
          } catch {}
        },
      });
      el.dataset.live = "true"; // after the first frame is drawn: no blank slot
      if (debug) (window as unknown as { __navCrow?: unknown }).__navCrow = engine;
    };

    const go = () => {
      if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(() => void start(), { timeout: 1500 });
      else idleId = setTimeout(() => void start(), 200) as unknown as number;
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });

    // Reduced motion switched on mid-visit: back to the static mark.
    const onMotion = () => (motion.matches ? reset() : go());
    motion.addEventListener("change", onMotion);

    return () => {
      cancelled = true;
      window.removeEventListener("load", go);
      motion.removeEventListener("change", onMotion);
      if ("cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      clearTimeout(idleId);
      reset();
    };
  }, []);

  return (
    <span
      ref={slot}
      // Final width from the first paint, so the wordmark never shifts when
      // the crow comes alive (reduced motion keeps the narrow static mark).
      className="nav-crow relative block h-[32px] w-[50px] shrink-0 min-[360px]:h-[44px] min-[360px]:w-[68px] motion-reduce:w-[40px]"
    >
      {/* The static mark, where the live crow's head will be. */}
      <Image
        src="/brand/crow.png"
        alt=""
        width={34}
        height={38}
        sizes="34px"
        loading="eager"
        className="absolute top-0 right-[3px] h-auto w-[34px] transition-opacity duration-300 [[data-live=true]_&]:opacity-0"
      />
      <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute top-0 left-0 size-0" />
    </span>
  );
}
