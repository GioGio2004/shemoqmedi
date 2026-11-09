"use client";

import { usePathname, useRouter } from "next/navigation";
import type { MenuData } from "@/app/api/menu/route";
import { useEffect, useRef } from "react";

/**
 * The crow's home in the navbar logo (see crow/roam.ts). The slot is empty:
 * no logo image, ever. Once the header has loaded the live crow flies in and
 * lands there (the name slides aside to make room), and from then on roams the
 * page. data-crow on the wordmark link: home (crow there, name beside it) or
 * away (name over the empty spot).
 *
 * ?crowdebug: short waits, state written above the crow, window.__crow.
 */
export function NavCrow() {
  const slot = useRef<HTMLSpanElement>(null);
  const engineRef = useRef<{ routeChanged(): void } | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

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

    // No live crow (reduced motion, data saver): just the name, over the spot.
    const still = () => {
      engine?.destroy();
      engine = null;
      engineRef.current = null;
      delete el.dataset.live;
      mark.dataset.crow = "away"; // no live crow: the name keeps the spot
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
        // Tap reaction: off to a random featured or award-winning site.
        surprise: async () => {
          const data = (await (await fetch("/api/menu")).json()) as MenuData;
          const other = (slug: string) => `/sites/${slug}` !== window.location.pathname;
          const picks = (data.picks ?? []).filter(other);
          // No other featured site: any other site.
          const pool = picks.length ? picks : data.sites.map((s) => s.slug).filter(other);
          return pool.length ? `/sites/${pool[Math.floor(Math.random() * pool.length)]}` : null;
        },
        navigate: (href) => routerRef.current.push(href),
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
      mark.dataset.crow = "away";
    };
  }, []);

  return (
    // The crow's spot: empty until the live crow lands (the name covers it till then).
    <span ref={slot} className="nav-crow relative block h-[32px] w-[50px] shrink-0 min-[360px]:h-[44px] min-[360px]:w-[68px]" />
  );
}
