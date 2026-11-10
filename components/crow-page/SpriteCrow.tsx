"use client";

import { useEffect, useRef } from "react";
import { loadAnimation, type Anim, type AnimName } from "@/components/site/crow/sprites";
import { cn } from "@/lib/utils";
import { DEFAULT_HEIGHT, drawFrame, fitCanvas, frameAt, reducedMotion } from "./player";

/**
 * What the crow does once it scrolls into view:
 *   perch   — sits and looks around; now and then caws or ruffles. Tap: it caws.
 *   peek    — rises from behind the line under it, looks round, sinks; again later.
 *   place   — sets something down on its line, looks at it, then sits.
 *   takeoff — sits a moment, then flies off out of its section; back when you return.
 */
export type CrowRoutine = "perch" | "peek" | "place" | "takeoff";

const SHEETS: Record<CrowRoutine, AnimName[]> = {
  perch: ["idle", "caw", "stretch"],
  peek: ["peek"],
  place: ["idle", "place", "caw"],
  takeoff: ["idle", "takeoff"],
};

/** One thing the crow does: a sheet (once, or looped `until` seconds), or "wait" out of sight. */
type Step = { anim: AnimName | "wait"; loop?: boolean; until?: number; speed?: number };

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * A live crow from the site's sprite sheets, drawn on a canvas that fills
 * its box. `feet` places its feet in the box (fractions); `height` is the
 * crow's height in CSS px. Plays only while on screen. Reduced motion: a
 * still crow. Decorative (aria-hidden): the text around it says it all.
 */
export function SpriteCrow({
  routine,
  height = DEFAULT_HEIGHT,
  feet = [0.5, 1],
  flip = false,
  delay = 0,
  className,
}: {
  routine: CrowRoutine;
  height?: number;
  feet?: [number, number];
  flip?: boolean;
  /** ms after it comes into view before it starts. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [fx, fy] = feet;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const scale = height / DEFAULT_HEIGHT;
    const sheets: Partial<Record<AnimName, Anim>> = {};
    let raf = 0;
    let visible = false;
    let loading: Promise<void> | null = null;
    let disposed = false;

    // The routine as a queue of steps; `now` and `t0` in seconds.
    let queue: Step[] = [];
    let step: Step | null = null;
    let t0 = 0;
    let flying: { t: number } | null = null; // takeoff: seconds since lift-off
    let gone = false;

    const load = () =>
      (loading ??= Promise.all(
        SHEETS[routine].map(async (n) => {
          const a = await loadAnimation(n);
          if (a) sheets[n] = a;
        }),
      ).then(() => undefined));

    const next = (now: number) => {
      step = queue.shift() ?? null;
      t0 = now;
      if (step) return;
      // Out of steps: what the crow does next, by routine.
      if (routine === "perch") {
        const extra: AnimName = Math.random() < 0.6 ? "caw" : "stretch";
        queue = [{ anim: "idle", loop: true, until: rand(4, 8) }, { anim: extra }];
      } else if (routine === "peek") {
        queue = [{ anim: "wait", until: rand(5, 9) }, { anim: "peek" }];
      } else if (routine === "place") {
        queue = [{ anim: "idle", loop: true, until: rand(5, 9) }, { anim: "caw" }];
      } else {
        queue = [{ anim: "idle", loop: true, until: Infinity }];
      }
      step = queue.shift()!;
    };

    const start = (now: number) => {
      gone = false;
      flying = null;
      canvas.style.transform = "";
      canvas.style.opacity = "";
      queue =
        routine === "perch"
          ? [{ anim: "caw" }]
          : routine === "peek"
            ? [{ anim: "peek" }]
            : routine === "place"
              ? [{ anim: "idle", loop: true, until: 0.6 }, { anim: "place" }, { anim: "caw" }]
              : [{ anim: "idle", loop: true, until: 1.4 }, { anim: "takeoff", loop: true, until: Infinity }];
      step = null;
      next(now);
    };

    const still = () => {
      const a = sheets[routine === "peek" ? "peek" : "idle"];
      if (!a) return;
      const { ctx, width, height: h } = fitCanvas(canvas);
      ctx.clearRect(0, 0, width, h);
      drawFrame(ctx, a, routine === "peek" ? 31 : 0, width * fx, h * fy, { scale, flip });
    };

    const frame = (ms: number) => {
      raf = 0;
      if (disposed || !visible) return;
      const now = ms / 1000;
      const { ctx, width, height: h } = fitCanvas(canvas);
      ctx.clearRect(0, 0, width, h);
      if (!step) start(now);
      if (step!.anim === "wait") {
        // Out of sight (behind its line between peeks).
        if (now - t0 >= (step!.until ?? 0)) next(now);
        raf = requestAnimationFrame(frame);
        return;
      }
      const a = sheets[step!.anim];
      if (!a) return; // a sheet that failed to load: the crow just isn't there
      const t = now - t0;
      const { k, done } = frameAt(a, t, { loop: step!.loop, speed: step!.speed });
      drawFrame(ctx, a, k, width * fx, h * fy, { scale, flip });
      if ((step!.loop && t >= (step!.until ?? Infinity)) || (!step!.loop && done)) next(now);
      // Takeoff: once airborne, the canvas flies up and away (CSS transform).
      if (step?.anim === "takeoff" && a.air && k >= a.air.start) {
        flying ??= { t: now };
        const f = now - flying.t;
        const dir = flip ? -1 : 1;
        canvas.style.transform = `translate(${dir * f * f * 160 + dir * f * 120}px, ${-(f * f * 120 + f * 40)}px)`;
        if (f > 3.2) {
          gone = true;
          canvas.style.opacity = "0";
          return; // stays away until the section is scrolled back to
        }
      }
      raf = requestAnimationFrame(frame);
    };

    const play = () => {
      if (!raf && !gone) raf = requestAnimationFrame(frame);
    };

    let timer = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (!visible) {
          cancelAnimationFrame(raf);
          raf = 0;
          clearTimeout(timer);
          // Takeoff: when you come back, the crow is back on its spot.
          if (routine === "takeoff" && gone) step = null;
          gone = false;
          return;
        }
        void load().then(() => {
          if (disposed || !visible) return;
          if (reducedMotion()) return still();
          timer = window.setTimeout(play, step ? 0 : delay);
        });
      },
      { rootMargin: "120px 0px" },
    );
    io.observe(canvas);

    // Tap a perched crow: it caws.
    const onTap = () => {
      if (routine !== "perch" || reducedMotion() || step?.anim === "caw") return;
      queue = [{ anim: "caw" }];
      next(performance.now() / 1000);
    };
    canvas.addEventListener("pointerdown", onTap);

    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (visible && !reducedMotion()) play();
    };
    document.addEventListener("visibilitychange", onVis);
    const onResize = () => reducedMotion() && still();
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      canvas.removeEventListener("pointerdown", onTap);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
    };
  }, [routine, height, fx, fy, flip, delay]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={cn("block h-full w-full", routine === "perch" && "cursor-pointer", className)}
    />
  );
}
