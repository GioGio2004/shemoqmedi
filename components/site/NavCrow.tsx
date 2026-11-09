"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * The crow's home in the navbar logo (see crow/roam.ts). The slot renders the
 * static crow mark on the server; after the page has loaded the live crow
 * takes its place and, a few seconds later, sets off around the page. When it
 * leaves, the name slides over into its spot; just before it comes back, the
 * name slides aside again (data-crow on the wordmark link: home | away | static).
 *
 * ?crowdebug: short waits, state written above the crow, window.__crow.
 */
export function NavCrow() {
  const slot = useRef<HTMLSpanElement>(null);
  const engineRef = useRef<{ routeChanged(): void } | null>(null);
  const pathname = usePathname();

  // A client-side page change: a crow on (or flying to) the old page leaves.
  useEffect(() => {
    engineRef.current?.routeChanged();
  }, [pathname]);

  useEffect(() => {
    const el = slot.current;
    const mark = el?.parentElement; // the wordmark link
    if (!el || !mark) return;
    const debug = new URLSearchParams(window.location.search).has("crowdebug");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const lite = !!conn?.saveData || /2g/.test(conn?.effectiveType ?? "");

    let engine: { destroy(): void; routeChanged(): void } | null = null;
    let cancelled = false;
    let idleId = 0;

    // No live crow: the still mark and the name, as before.
    const still = () => {
      engine?.destroy();
      engine = null;
      engineRef.current = null;
      delete el.dataset.live;
      mark.dataset.crow = "static";
      delete (window as unknown as { __crow?: unknown }).__crow;
    };

    const start = async () => {
      if (cancelled || engine) return;
      if (motion.matches || lite) return still();
      const [{ CrowRoamer, ROAM_BASE }, { loadSprites }] = await Promise.all([
        import("./crow/roam"),
        import("./crow/sprites"),
      ]);
      const sprites = await loadSprites(["idle", "takeoff"], ROAM_BASE);
      if (cancelled || motion.matches) return;
      if (!sprites?.takeoff) return still();
      engine = new CrowRoamer({ idle: sprites.idle, takeoff: sprites.takeoff }, {
        debug,
        home: el,
        onHome: (home) => (mark.dataset.crow = home ? "home" : "away"),
      });
      el.dataset.live = "true";
      engineRef.current = engine;
      if (debug) (window as unknown as { __crow?: unknown }).__crow = engine;
    };

    const go = () => {
      if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(() => void start(), { timeout: 1500 });
      else idleId = setTimeout(() => void start(), 200) as unknown as number;
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });

    const onMotion = () => (motion.matches ? still() : go());
    motion.addEventListener("change", onMotion);

    return () => {
      cancelled = true;
      window.removeEventListener("load", go);
      motion.removeEventListener("change", onMotion);
      if ("cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      clearTimeout(idleId);
      engine?.destroy();
      engine = null;
      engineRef.current = null;
      delete el.dataset.live;
      mark.dataset.crow = "home";
    };
  }, []);

  return (
    <span
      ref={slot}
      className="nav-crow relative block h-[32px] w-[50px] shrink-0 min-[360px]:h-[44px] min-[360px]:w-[68px] motion-reduce:w-[40px]"
    >
      {/* The still mark, where the live crow's head will be. */}
      <Image
        src="/brand/crow.png"
        alt=""
        width={34}
        height={38}
        sizes="34px"
        loading="eager"
        className="absolute top-0 right-[3px] h-auto w-[34px] transition-opacity duration-300 [[data-live=true]_&]:opacity-0"
      />
    </span>
  );
}
