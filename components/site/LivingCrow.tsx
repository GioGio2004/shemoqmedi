"use client";

import { useEffect, useRef } from "react";

/**
 * A decorative crow that visits the footer wordmark (see crow/engine.ts).
 * Render it inside a positioned <footer> that holds a [data-crow-wordmark]
 * element with one [data-crow-letter] span per letter.
 *
 * Nothing loads until the page has finished loading and the footer is near
 * the viewport; the engine itself is a separate chunk. ?crowdebug in the URL
 * draws the floor, perch points, hit area and state, and brings the crow out
 * after a couple of seconds.
 */
export function LivingCrow() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const footer = canvas?.closest("footer");
    const wordmark = footer?.querySelector<HTMLElement>("[data-crow-wordmark]");
    if (!canvas || !footer || !wordmark) return;

    const debug = new URLSearchParams(window.location.search).has("crowdebug");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let engine: { destroy(): void } | null = null;
    let cancelled = false;
    let near = false;
    let loaded = document.readyState === "complete";
    let starting = false;

    const start = async () => {
      if (starting || cancelled || !near || !loaded) return;
      starting = true;
      const reducedMotion = motion.matches;
      const [{ CrowEngine }, { loadSprites }] = await Promise.all([
        import("./crow/engine"),
        import("./crow/sprites"),
      ]);
      await document.fonts?.ready;
      const sprites = await loadSprites(reducedMotion ? ["idle", "walk", "hop"] : undefined);
      if (cancelled || !sprites) return;
      engine = new CrowEngine(canvas, footer, wordmark, sprites, { debug, reducedMotion });
      if (debug) (window as unknown as { __crow?: unknown }).__crow = engine;
    };

    // Lazy: after the load event, once the footer is within a screen or so.
    const nearObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        near = true;
        nearObserver.disconnect();
        idle(start);
      },
      { rootMargin: "100% 0px" },
    );
    nearObserver.observe(footer);
    const onLoad = () => {
      loaded = true;
      idle(start);
    };
    if (!loaded) window.addEventListener("load", onLoad, { once: true });

    // Switching reduced motion on or off rebuilds the crow.
    const onMotion = () => {
      engine?.destroy();
      engine = null;
      starting = false;
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      start();
    };
    motion.addEventListener("change", onMotion);

    return () => {
      cancelled = true;
      nearObserver.disconnect();
      window.removeEventListener("load", onLoad);
      motion.removeEventListener("change", onMotion);
      engine?.destroy();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-40 h-0 w-0 select-none"
    />
  );
}

function idle(fn: () => void) {
  if ("requestIdleCallback" in window) window.requestIdleCallback(fn, { timeout: 2000 });
  else setTimeout(fn, 200);
}
