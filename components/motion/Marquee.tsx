"use client";

// components/motion/Marquee.tsx
// ─────────────────────────────────────────────────────────────────────────────
// marquee-v — the velocity-reactive marquee (design spec §3.3).
//
//   • Base loop: track xPercent -50, repeat -1, duration 28, ease "none".
//     Content is duplicated internally (second copy aria-hidden) so -50%
//     wraps seamlessly.
//   • A page-level ScrollTrigger reads scroll velocity and maps it to
//     timeScale = clamp(0.6, 1 + |v|/900, 4), sign flipping direction,
//     lerped back to 1 (gsap.to, 0.8s) when idle.
//   • prefers-reduced-motion: no motion at all — the strip renders static.
//   • Spec rule: exactly ONE velocity-reactive instance on the site.
//
// Usage (spec §4.3):
//   <Marquee>
//     {names.map(n => <Fragment key={n}>
//       <span className="v-t-h3 …">{n}</span>
//       <span style={{ color: "var(--v-accent)" }}>+</span>
//     </Fragment>)}
//   </Marquee>
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

export default function Marquee({
  children,
  duration = 28,
  velocity = true,
  ariaHidden = true,
  className,
  trackClassName,
  style,
}: {
  /** One sequence of items; the component duplicates it for the loop. */
  children: ReactNode;
  /** Seconds for one full loop at rest. Default 28 (spec). */
  duration?: number;
  /** Velocity-reactive timeScale (spec marquee-v). Default true. */
  velocity?: boolean;
  /**
   * Marquees are decorative by default (content is SSR'd elsewhere, e.g.
   * venue names in #venues). Set false only if this is the sole occurrence.
   */
  ariaHidden?: boolean;
  className?: string;
  trackClassName?: string;
  style?: CSSProperties;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    // Reduced motion: no marquee motion (spec §3.1) — nothing to add.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const track = root.querySelector<HTMLElement>("[data-marquee-track]");
      if (!track) return;

      const tween = gsap.to(track, {
        xPercent: -50,
        repeat: -1,
        duration,
        ease: "none",
      });

      let idle: gsap.core.Tween | null = null;
      let trigger: ScrollTrigger | null = null;

      if (velocity) {
        trigger = ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            const v = self.getVelocity();
            const mag = gsap.utils.clamp(0.6, 4, 1 + Math.abs(v) / 900);
            tween.timeScale(v < 0 ? -mag : mag);
            idle?.kill();
            idle = gsap.to(tween, {
              timeScale: 1,
              duration: 0.8,
              ease: "power2.out",
              delay: 0.1,
              overwrite: true,
            });
          },
        });
      }

      return () => {
        idle?.kill();
        trigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, [duration, velocity]);

  return (
    <div
      ref={rootRef}
      className={cn("v-marquee", className)}
      style={style}
      {...(ariaHidden ? { "aria-hidden": true } : {})}
    >
      <div data-marquee-track className={cn("v-marquee-track", trackClassName)}>
        <div className="v-marquee-track" style={{ flex: "none" }}>
          {children}
        </div>
        <div className="v-marquee-track" style={{ flex: "none" }} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
