"use client";

// components/motion/Reveal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// ScrollTrigger reveal helper — the RULED named patterns (design spec §3.3):
//
//   type="lines"  → mask-reveal : SplitText lines, yPercent 110→0, 0.9s
//                   expo.out, stagger 0.08. For every h1/h2/h3 + lead.
//   type="chars"  → hero-tier   : SplitText lines+chars (masked), chars
//                   yPercent 118→0, 1.2s expo.out, stagger 0.018.
//   type="frame"  → frame-reveal: clip-path inset(0 0 100% 0)→0 on this
//                   element (1.1s expo.out) + first <img> descendant scale
//                   1.18→1.04. Use as the `.v-xframe-in` inner of an XFrame:
//                   <XFrame asChild><Reveal type="frame" className="v-xframe-in">…
//   type="fade"   → fade-rise   : opacity 0 + y 30, 0.9s expo.out.
//
// Contract (spec §3.1): entrances are gsap.from() only — no-JS/SEO renders the
// final state. prefers-reduced-motion collapses every variant to a 0.4s
// opacity fade. Default trigger start "top 78%", play once.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { cn } from "@/lib/utils";

export type RevealType = "lines" | "chars" | "frame" | "fade";

export type RevealProps = {
  children: ReactNode;
  /** Rendered element/tag. Default "div". Use "h2", "p", … for text reveals. */
  as?: ElementType;
  /** Named pattern. Default "lines". */
  type?: RevealType;
  /** Seconds added before the tween starts. Default 0. */
  delay?: number;
  /** Override the pattern's duration (s). */
  duration?: number;
  /** Override the pattern's stagger (s). Ignored by frame/fade. */
  stagger?: number;
  /** ScrollTrigger start. Default "top 78%". */
  start?: string;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
};

const DEFAULTS: Record<RevealType, { duration: number; stagger: number }> = {
  lines: { duration: 0.9, stagger: 0.08 },
  chars: { duration: 1.2, stagger: 0.018 },
  frame: { duration: 1.1, stagger: 0 },
  fade: { duration: 0.9, stagger: 0 },
};

export default function Reveal({
  children,
  as: Comp = "div",
  type = "lines",
  delay = 0,
  duration,
  stagger,
  start = "top 78%",
  className,
  id,
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.registerPlugin(ScrollTrigger, SplitText);

    const dur = duration ?? DEFAULTS[type].duration;
    const stag = stagger ?? DEFAULTS[type].stagger;

    let mm: gsap.MatchMedia | null = null;
    let cancelled = false;

    // Split after fonts settle so SplitText measures final line breaks.
    const ready: Promise<unknown> =
      typeof document !== "undefined" && "fonts" in document
        ? document.fonts.ready.catch(() => undefined)
        : Promise.resolve();

    ready.then(() => {
      if (cancelled) return;
      mm = gsap.matchMedia();

      const st = {
        trigger: el,
        start,
        toggleActions: "play none none none",
      } as const;

      // Reduced motion: every reveal becomes a quiet opacity fade (spec §3.1).
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.from(el, { opacity: 0, duration: 0.4, delay, scrollTrigger: { ...st } });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (type === "lines" || type === "chars") {
          const split = new SplitText(el, {
            type: type === "chars" ? "lines,chars" : "lines",
            mask: "lines",
            linesClass: "v-split-line",
          });
          const targets = type === "chars" ? split.chars : split.lines;
          gsap.from(targets, {
            yPercent: type === "chars" ? 118 : 110,
            duration: dur,
            ease: "expo.out",
            stagger: stag,
            delay,
            scrollTrigger: { ...st },
          });
          return () => split.revert();
        }

        if (type === "frame") {
          const img = el.querySelector("img");
          gsap.from(el, {
            clipPath: "inset(0 0 100% 0)",
            duration: dur,
            ease: "expo.out",
            delay,
            scrollTrigger: { ...st },
          });
          if (img) {
            gsap.fromTo(
              img,
              { scale: 1.18 },
              {
                scale: 1.04,
                duration: dur,
                ease: "expo.out",
                delay,
                scrollTrigger: { ...st },
              }
            );
          }
          return;
        }

        // fade
        gsap.from(el, {
          opacity: 0,
          y: 30,
          duration: dur,
          ease: "expo.out",
          delay,
          scrollTrigger: { ...st },
        });
      });
    });

    return () => {
      cancelled = true;
      mm?.revert();
    };
  }, [type, delay, duration, stagger, start]);

  // Widen the polymorphic tag to a single component type accepting the shared
  // props (a plain ElementType union is too complex for TS to represent).
  // At runtime this is just the tag string or component passed via `as`.
  const Tag = Comp as unknown as React.FC<{
    ref?: React.Ref<HTMLElement>;
    id?: string;
    style?: React.CSSProperties;
    className?: string;
    children?: ReactNode;
  }>;

  return (
    <Tag
      ref={ref}
      id={id}
      style={style}
      className={cn(type === "frame" && "overflow-hidden", className)}
    >
      {children}
    </Tag>
  );
}
