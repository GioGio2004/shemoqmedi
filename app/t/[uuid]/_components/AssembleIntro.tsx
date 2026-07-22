"use client";

import { useEffect, useRef } from "react";
import { createTimeline, stagger, svg, utils } from "animejs";

// ─── LINE ART ────────────────────────────────────────────────────────────────
// Swappable brand mark: minimal coffee cup + rising steam + NFC ripple arcs.
// Stroke-only paths; the intro draws each path in with animejs svg.createDrawable.
function IntroMark() {
  return (
    <svg
      viewBox="0 0 240 240"
      width="min(70vw, 320px)"
      height="min(70vw, 320px)"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g
        className="assemble-line"
        stroke="#ffffff"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Cup body */}
        <path d="M78 118 L84 178 Q85 190 97 190 L131 190 Q143 190 144 178 L150 118 Z" />
        {/* Handle */}
        <path d="M150 128 Q172 126 172 144 Q172 162 148 162" />
        {/* Saucer */}
        <path d="M64 202 Q114 214 164 202" />
        {/* Steam left */}
        <path d="M100 100 Q92 88 100 76 Q108 64 100 52" />
        {/* Steam right */}
        <path d="M128 100 Q120 88 128 76 Q136 64 128 52" />
        {/* NFC ripple arcs (top-right of the cup) */}
        <path d="M162 84 Q172 74 162 64" strokeWidth={2} opacity={0.9} />
        <path d="M172 92 Q188 74 172 56" strokeWidth={2} opacity={0.7} />
        <path d="M182 100 Q204 74 182 48" strokeWidth={2} opacity={0.5} />
      </g>
    </svg>
  );
}

// ─── ASSEMBLE INTRO ──────────────────────────────────────────────────────────
// Same contract as the old LottieIntro: plays once, calls onComplete, and the
// parent can collapse it away.
export default function AssembleIntro({
  onComplete,
  collapsed,
}: {
  onComplete: () => void;
  collapsed: boolean;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Reduced motion: skip the choreography, hand off almost immediately.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => onCompleteRef.current(), 250);
      return () => clearTimeout(t);
    }

    const paths = root.querySelectorAll<SVGPathElement>(".assemble-line path");
    const drawables = svg.createDrawable(paths);

    const tl = createTimeline({
      defaults: { ease: "inOutQuad" },
      onComplete: () => onCompleteRef.current(),
    });

    tl
      // Strokes draw themselves in, staggered.
      .add(drawables, {
        draw: ["0 0", "0 1"],
        duration: 900,
        delay: stagger(60),
      })
      // Brief glow/settle: strokes flare slightly, then relax.
      .add(
        paths,
        {
          strokeWidth: [{ to: 3.2, duration: 220 }, { to: 2.5, duration: 320 }],
          filter: [
            { to: "drop-shadow(0 0 6px rgba(255,255,255,0.8))", duration: 220 },
            { to: "drop-shadow(0 0 2px rgba(255,255,255,0.25))", duration: 380 },
          ],
        },
        "-=200"
      )
      // Fade the whole overlay out before handing off.
      .add(root, { opacity: [1, 0], duration: 450, ease: "outQuad" }, "+=150");

    return () => {
      tl.cancel();
      utils.remove(drawables);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`absolute inset-0 z-30 flex items-center justify-center bg-[#050505] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${collapsed ? "scale-75 opacity-0 pointer-events-none -translate-y-10" : "scale-100"}`}
    >
      <IntroMark />
    </div>
  );
}
