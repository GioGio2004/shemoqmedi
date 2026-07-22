"use client";

// components/motion/DecorLines.tsx
// ─────────────────────────────────────────────────────────────────────────────
// The RULED line-system primitives (design spec §2). All lines are 1px
// ELEMENTS colored var(--v-c-line) — never borders — animated with
// transform: scaleX/scaleY via gsap.from(), so no-JS keeps them visible.
// Colors auto-flip inside [data-theme="bone"] sections (contextual --v-c-*).
// Reduced-motion: draw tweens are skipped entirely (lines are static CSS).
//
// Exports:
//   <Hairline />     — 1px rule that draws on scroll; optional plus-marks.
//   <PlusMark />     — 9×9 "+" glyph (two 1px strokes).
//   <SectionHead />  — the §2.1.2 lockup: `01 — LABEL  (meta)` + rule + heading.
//   <XFrame />       — crosshair frame: 4 corner ticks around an inner clip div.
//   <SideRails />    — fixed page-gutter rails, portaled to <body>, ≥768px only.
//   <TickRuler />    — decorative tick column with mono micro labels.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

const DRAW = {
  duration: 0.9,
  ease: "expo.out",
  start: "top 78%",
} as const;

/** Runs fn only when motion is allowed; returns a gsap.matchMedia cleanup. */
function useMotionEffect(
  fn: (mm: gsap.MatchMedia) => void,
  deps: React.DependencyList
) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => fn(mm));
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/* ── PlusMark ─────────────────────────────────────────────────────────────── */

export function PlusMark({
  className,
  ...rest
}: React.ComponentPropsWithoutRef<"span">) {
  return <span {...rest} className={cn("v-plus", className)} aria-hidden="true" />;
}

/* ── Hairline ─────────────────────────────────────────────────────────────── */

export function Hairline({
  axis = "x",
  draw = true,
  plusMarks = false,
  start = DRAW.start,
  className,
  style,
}: {
  /** "x" = horizontal rule (scaleX, left origin), "y" = vertical (scaleY, top origin). */
  axis?: "x" | "y";
  /** Animate the draw-in on scroll (spec §2.3). Default true. */
  draw?: boolean;
  /** Add the 9×9 plus-marks at both ends (horizontal rules only). */
  plusMarks?: boolean;
  /** ScrollTrigger start. Default "top 78%". */
  start?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useMotionEffect(() => {
    const root = rootRef.current;
    if (!root || !draw) return;
    const line = root.querySelector<HTMLElement>("[data-line]");
    if (!line) return;

    gsap.from(line, {
      ...(axis === "x"
        ? { scaleX: 0, transformOrigin: "left center" }
        : { scaleY: 0, transformOrigin: "center top" }),
      duration: DRAW.duration,
      ease: DRAW.ease,
      scrollTrigger: { trigger: root, start, toggleActions: "play none none none" },
    });

    const plus = root.querySelectorAll<HTMLElement>(".v-plus");
    if (plus.length) {
      // Plus-marks pop after the rule finishes drawing (spec §2.1.3).
      gsap.from(plus, {
        scale: 0,
        duration: 0.4,
        ease: "back.out(2)",
        delay: DRAW.duration,
        scrollTrigger: { trigger: root, start, toggleActions: "play none none none" },
      });
    }
  }, [axis, draw, start]);

  const line = (
    <span data-line className={axis === "x" ? "v-line-x" : "v-line-y"} />
  );

  if (!plusMarks || axis === "y") {
    return (
      <div
        ref={rootRef}
        className={cn(axis === "y" && "h-full", className)}
        style={style}
        aria-hidden="true"
      >
        {line}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={cn("v-shead-rule", className)} style={style} aria-hidden="true">
      {line}
      <PlusMark style={{ left: -4, top: -4, position: "absolute" }} />
      <PlusMark style={{ right: -4, top: -4, position: "absolute" }} />
    </div>
  );
}

/* ── SectionHead — `01 — LABEL   (meta)` over a drawn rule + heading ─────── */

export function SectionHead({
  index,
  label,
  meta,
  children,
  headingClassName = "v-t-h2",
  className,
  id,
}: {
  /** Two-digit section index, e.g. "01". */
  index: string;
  /** Uppercase (or localizable) label, e.g. "HOW IT WORKS". */
  label: string;
  /** Optional right-aligned mono meta, e.g. "( 12 )". */
  meta?: ReactNode;
  /** The display heading, rendered below the rule. */
  children?: ReactNode;
  /** Class for the heading wrapper. Default "v-t-h2". */
  headingClassName?: string;
  className?: string;
  id?: string;
}) {
  return (
    <header id={id} className={cn("v-shead", className)}>
      <div className="v-shead-row v-t-mono" style={{ color: "var(--v-c-faint)" }}>
        <span>
          {index} — {label}
        </span>
        {meta != null && <span>{meta}</span>}
      </div>
      <Hairline plusMarks />
      {children != null && (
        <div className={cn("v-shead-heading", headingClassName)}>{children}</div>
      )}
    </header>
  );
}

/* ── XFrame — crosshair corner ticks around an overflow-hidden inner ─────── */

export function XFrame({
  children,
  className,
  innerClassName,
  bare = false,
}: {
  children: ReactNode;
  className?: string;
  /** Class merged onto the overflow-hidden inner div (ignored when bare). */
  innerClassName?: string;
  /**
   * bare: render ticks + children WITHOUT the built-in .v-xframe-in wrapper —
   * pass your own inner (e.g. <Reveal type="frame" className="v-xframe-in">).
   */
  bare?: boolean;
}) {
  return (
    <div className={cn("v-xframe", className)}>
      {bare ? (
        children
      ) : (
        <div className={cn("v-xframe-in", innerClassName)}>{children}</div>
      )}
      <span className="v-xframe-tick" data-corner="tl" aria-hidden="true" />
      <span className="v-xframe-tick" data-corner="tr" aria-hidden="true" />
      <span className="v-xframe-tick" data-corner="bl" aria-hidden="true" />
      <span className="v-xframe-tick" data-corner="br" aria-hidden="true" />
    </div>
  );
}

/* ── SideRails — fixed gutter rails, portaled to <body> (spec §2.1.1) ────── */

export function SideRails() {
  const [mounted, setMounted] = useState(false);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMounted(true), []);

  useMotionEffect(() => {
    const rails = [leftRef.current, rightRef.current].filter(Boolean) as HTMLElement[];
    if (!rails.length) return;
    gsap.from(rails, {
      scaleY: 0,
      autoAlpha: 0,
      transformOrigin: "center top",
      duration: 1.2,
      ease: "expo.out",
    });
  }, [mounted]);

  if (!mounted) return null;

  // Portal: this often mounts under transformed framer-motion ancestors,
  // which would hijack position:fixed.
  return createPortal(
    <>
      <div ref={leftRef} className="v-rail" data-side="left" aria-hidden="true" />
      <div ref={rightRef} className="v-rail" data-side="right" aria-hidden="true" />
    </>,
    document.body
  );
}

/* ── TickRuler — decorative tick column (hero right / footer left) ───────── */

export function TickRuler({
  count = 20,
  className,
  style,
}: {
  /** Number of ticks (24px rhythm, mono micro label every 5th). Default 20. */
  count?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={cn("v-ticks", className)} style={style} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <i
          key={i}
          {...(i % 5 === 0 ? { "data-label": String(i).padStart(3, "0") } : {})}
        />
      ))}
    </div>
  );
}
