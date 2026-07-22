"use client";

// components/motion/SmoothScroll.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Lenis smooth-scroll provider for the RULED landing (design spec §3.1).
//
//  • Desktop pointer-fine only — touch keeps native scroll (the dual-panel
//    swipe gesture contract in LandingPanels depends on it).
//  • Respects prefers-reduced-motion: Lenis never initializes.
//  • Wired to GSAP ScrollTrigger with the STANDARD pattern (no scrollerProxy):
//        lenis.on("scroll", ScrollTrigger.update)
//        gsap.ticker.add((t) => lenis.raf(t * 1000))
//        gsap.ticker.lagSmoothing(0)
//    This keeps MotionLanding's existing pinned sections working untouched —
//    they read the native window scroll, which Lenis animates directly.
//  • Landing-only by default: Lenis must attach to the Menus panel scroll
//    context only (spec), so activation is gated to the locale-root pathname
//    ("/", "/en", "/ka", "/ru"). Pass `enabled` to override.
//  • Offers panel: when LandingPanels hides the Menus panel (MotionLanding's
//    `main.ml-root` goes display:none inside its "hidden" wrapper), Lenis is
//    stopped automatically via a MutationObserver, and restarted when the
//    Menus panel returns. No changes to LandingPanels required. Explicit
//    control is also available via `useLenis()` or the window events
//    "voloo:lenis-stop" / "voloo:lenis-start".
//  • Nested scrollable surfaces (portfolio sheet, Offers feed overlays,
//    horizontal venue track on mobile) should carry `data-lenis-prevent`
//    (or `data-lenis-prevent-wheel`) — Lenis honors these natively.
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type LenisControl = {
  /** The live Lenis instance — null on touch devices, reduced-motion, or non-landing routes. */
  getLenis: () => Lenis | null;
  /** Pause smooth scrolling (e.g. while the Offers panel is active). */
  stop: () => void;
  /** Resume smooth scrolling. */
  start: () => void;
};

const noop: LenisControl = { getLenis: () => null, stop: () => {}, start: () => {} };
const LenisContext = createContext<LenisControl>(noop);

/** Access the Lenis instance / stop / start from any client component. */
export function useLenis(): LenisControl {
  return useContext(LenisContext);
}

/** Locale-root landing routes: "/", "/en", "/ka", "/ru" (trailing slash ok). */
const LANDING_RE = /^\/(?:(?:en|ka|ru)\/?)?$/;

// Spec §3.1 easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
const EASING = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

export default function SmoothScroll({
  children,
  enabled,
}: {
  children: ReactNode;
  /** Force-enable/disable; defaults to "landing routes only". */
  enabled?: boolean;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const active = enabled ?? LANDING_RE.test(pathname ?? "/");

  useEffect(() => {
    if (!active) return;

    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let cleanup: (() => void) | null = null;

    const init = () => {
      if (lenisRef.current) return;
      if (!fine.matches || reduced.matches) return;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({ duration: 1.1, easing: EASING });
      lenisRef.current = lenis;

      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // ── Offers-panel auto-pause ───────────────────────────────────────────
      // LandingPanels toggles the Menus wrapper between "block" and "hidden".
      // Watch that wrapper's class attribute; when MotionLanding is hidden the
      // Offers panel owns the viewport → stop Lenis so its native scrolling
      // (and overscroll-y-contain) is untouched.
      let observer: MutationObserver | null = null;
      const mlRoot = document.querySelector<HTMLElement>("main.ml-root");
      const wrapper = mlRoot?.parentElement ?? null;
      if (wrapper) {
        const sync = () => {
          if (wrapper.classList.contains("hidden")) lenis.stop();
          else lenis.start();
        };
        observer = new MutationObserver(sync);
        observer.observe(wrapper, { attributes: true, attributeFilter: ["class"] });
        sync();
      }

      // Explicit control without importing the context (e.g. LandingPanels).
      const onStop = () => lenis.stop();
      const onStart = () => lenis.start();
      window.addEventListener("voloo:lenis-stop", onStop);
      window.addEventListener("voloo:lenis-start", onStart);

      cleanup = () => {
        window.removeEventListener("voloo:lenis-stop", onStop);
        window.removeEventListener("voloo:lenis-start", onStart);
        observer?.disconnect();
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33); // restore GSAP default
        lenis.destroy();
        lenisRef.current = null;
      };
    };

    const teardown = () => {
      cleanup?.();
      cleanup = null;
    };

    const revalidate = () => {
      teardown();
      init();
    };

    init();
    fine.addEventListener("change", revalidate);
    reduced.addEventListener("change", revalidate);

    return () => {
      fine.removeEventListener("change", revalidate);
      reduced.removeEventListener("change", revalidate);
      teardown();
    };
  }, [active]);

  const control = useMemo<LenisControl>(
    () => ({
      getLenis: () => lenisRef.current,
      stop: () => lenisRef.current?.stop(),
      start: () => lenisRef.current?.start(),
    }),
    []
  );

  return <LenisContext.Provider value={control}>{children}</LenisContext.Provider>;
}
