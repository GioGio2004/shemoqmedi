"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Application, SPEObject } from "@splinetool/runtime";

gsap.registerPlugin(ScrollTrigger);

interface OryzoFallSectionProps {
  splineApp: Application | null;
  chipRef: SPEObject | null;
}

const FALL_STATEMENTS = [
  {
    line1: "Zero",
    line2: "Friction.",
    sub: "One tap. Infinite possibilities.",
    position: "top-1/3 left-6 md:left-[8vw]",
    align: "text-left",
  },
  {
    line1: "Endless",
    line2: "Capability.",
    sub: "Every venue. Every interaction. Elevated.",
    position: "top-1/2 right-6 md:right-[8vw] -translate-y-1/2",
    align: "text-right",
  },
  {
    line1: "The New",
    line2: "Standard.",
    sub: "Physical craft. Digital soul.",
    position: "bottom-1/4 left-6 md:left-[12vw]",
    align: "text-left",
  },
];

export default function OryzoFallSection({
  splineApp,
  chipRef,
}: OryzoFallSectionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    
    // STRICT GUARD: Do not run any GSAP code until the DOM, Spline, and the Chip exist.
    if (!wrapper || !splineApp || !chipRef) {
      console.log("⏳ Waiting for Spline to mount before building ScrollTrigger...");
      return; 
    }

    console.log("✅ Spline loaded! Building GSAP Timeline...");

    const ctx = gsap.context(() => {
      // ── Shared ScrollTrigger config ────────────────────────────────────────
      const ST_CONFIG = {
        trigger: wrapper,
        start: "top top",
        end: "bottom bottom",
      };

      // ── TEXT timeline ──────────────────────────────────────────────────────
      // Each statement gets ~20% of the scroll to fade in, ~25% to hold, ~10% to fade out.
      // Overlapping slightly so text never feels rushed.
      const textTl = gsap.timeline({
        scrollTrigger: { ...ST_CONFIG, scrub: 2 },
      });

      // Statement timing: [enterAt, exitAt] as 0–1 fractions of total scroll
      const TEXT_WINDOWS = [
        { in: 0.0, out: 0.28 }, // Zero Friction — lingers well into the spin
        { in: 0.26, out: 0.54 }, // Endless Capability — overlaps briefly for continuity
        { in: 0.52, out: 0.82 }, // The New Standard — holds through the settle
      ];

      TEXT_WINDOWS.forEach(({ in: inAt, out: outAt }, i) => {
        const el = textRefs.current[i];
        if (!el) return;
        const line1 = el.querySelector(".fall-line1") as HTMLElement;
        const line2 = el.querySelector(".fall-line2") as HTMLElement;
        const sub = el.querySelector(".fall-sub") as HTMLElement;

        const fadeInDur = 0.07;
        const fadeOutDur = 0.07;
        const holdDur = outAt - inAt - fadeInDur - fadeOutDur;

        textTl
          // Stagger lines in smoothly
          .fromTo(
            line1,
            { y: 36, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: fadeInDur * 0.55,
              ease: "power3.out",
            },
            inAt,
          )
          .fromTo(
            line2,
            { y: 44, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: fadeInDur * 0.55,
              ease: "power3.out",
            },
            inAt + fadeInDur * 0.28,
          )
          .fromTo(
            sub,
            { y: 12, opacity: 0 },
            {
              y: 0,
              opacity: 0.45,
              duration: fadeInDur * 0.4,
              ease: "power2.out",
            },
            inAt + fadeInDur * 0.55,
          )
          // Hold at full opacity (wrapper is already opacity:1 from line animations)
          .to(
            el,
            { opacity: 1, duration: holdDur, ease: "none" },
            inAt + fadeInDur,
          )
          // Graceful exit: drift up and fade
          .to(
            el,
            { opacity: 0, y: -24, duration: fadeOutDur, ease: "power2.inOut" },
            inAt + fadeInDur + holdDur,
          );
      });

      // ── 3D CHIP timeline ───────────────────────────────────────────────────
      if (chipRef && splineApp) {
        const s0x = chipRef.scale.x;
        const s0y = chipRef.scale.y;
        const s0z = chipRef.scale.z;
        const p0y = chipRef.position.y;
        const p0z = chipRef.position.z;
        const r0x = chipRef.rotation.x;
        const r0y = chipRef.rotation.y;
        const r0z = chipRef.rotation.z;

        // ── Philosophy ────────────────────────────────────────────────────────
        // Single keyframe array per property = ONE tween = zero seam artifacts.
        // All easing is handled via the `ease` on each keyframe segment — GSAP
        // interpolates between keyframes with that ease, so the curve is smooth.
        //
        // ROTATION strategy (no counter-rotation):
        //   x: starts side-on (−π/2), pivots through 0 (face reveal), then slightly past
        //   y: monotonically increasing — continuous spin
        //   z: starts 0, arcs to a small positive lean, returns to 0 — one soft wave
        //
        // SCALE strategy:
        //   Climbs steadily to 1.0×, then at the edge-on moment (x≈0, face visible)
        //   it POPS to 2× with a snap ease, then gracefully falls back to 1.1×.
        //   This is the WOW moment — synchronized with the face reveal.
        //
        // POSITION: purely downward Y, shaped easing for cinematic weight.

        const chipTl = gsap.timeline({
          scrollTrigger: {
            ...ST_CONFIG,
            scrub: 3, // Higher scrub = more lag = silkier motion
            onUpdate: () => splineApp.requestRender(),
          },
        });

        // ── ROTATION — PRODUCT SHOWCASE CHOREOGRAPHY ─────────────────────────
        // The chip does a cinematic "hero showcase" — presenting every angle
        // up close to the user like a luxury product video:
        //
        //   0-15%   : FRONT FACE — flat toward user, dramatic entrance
        //   15-30%  : tilt to show SIDE / EDGE profile
        //   30-45%  : rotate to show BACK of the chip
        //   45-60%  : continue past back to show OTHER SIDE
        //   60-75%  : swing around to FRONT again — the money shot
        //   75-100% : settle into final resting angle
        //
        // x controls tilt (nodding), y controls the main spin, z controls lean
        // ── ROTATION ──────────────────────────────────────────────────────────
        // Unified sine.inOut easing across all keyframes keeps velocity
        // perfectly continuous — no hard acceleration edges between stops.
        // Fewer keyframes = fewer seam points = smoother overall curve.
        chipTl.to(
          chipRef.rotation,
          {
            keyframes: [
              // 0% — starting pose (captured from previous section)
              { x: r0x,              y: r0y,                    z: r0z,         ease: "sine.inOut" },
              // 25% — side/edge view, gentle tilt
              { x: -Math.PI * 0.1,  y: r0y + Math.PI * 0.5,   z: r0z + 0.05,  ease: "sine.inOut" },
              // 50% — full 180° back view, nearly flat
              { x: -Math.PI * 0.04, y: r0y + Math.PI * 1.0,   z: r0z - 0.04,  ease: "sine.inOut" },
              // 75% — back to front face — the money shot
              { x: 0,               y: r0y + Math.PI * 2.0,   z: r0z,         ease: "sine.inOut" },
              // 100% — premium resting angle, slight tilt
              { x: Math.PI * 0.03,  y: r0y + Math.PI * 2.5,   z: r0z,         ease: "sine.inOut" },
            ],
            duration: 1,
            immediateRender: false,
          },
          0,
        );

        // ── POSITION ──────────────────────────────────────────────────────────
        // Clean single-arc path: chip drifts down-Y while Z rises to a peak
        // at mid-scroll then gently retreats. No backtracking, no z-spikes.
        // sine.inOut keeps velocity continuous through every keyframe.
        chipTl.to(
          chipRef.position,
          {
            keyframes: [
              { x: 0, y: p0y,       z: p0z,       ease: "sine.inOut" }, // 0%   — start
              { x: 0, y: p0y - 12,  z: p0z + 35,  ease: "sine.inOut" }, // 33%  — zoom in
              { x: 0, y: p0y - 22,  z: p0z + 40,  ease: "sine.inOut" }, // 66%  — peak depth
              { x: 0, y: p0y - 30,  z: p0z + 28,  ease: "sine.inOut" }, // 100% — settle back
            ],
            duration: 1,
            immediateRender: false,
          },
          0,
        );

        // ── SCALE ─────────────────────────────────────────────────────────────
        // Scale up smoothly at the start, hold, then gently breathe once at
        // the front-face reveal. No snappy power4 pops — everything is sine.
        const isMobile = window.innerWidth < 768;
        const targetScale = isMobile ? 1.4 : 2.0;

        chipTl.to(
          chipRef.scale,
          {
            keyframes: [
              // 0%   — original size (hand-off from hero section)
              { x: s0x,                     y: s0y,                     z: s0z,                     ease: "sine.inOut" },
              // 25%  — scale up smoothly to showcase size
              { x: s0x * targetScale,        y: s0y * targetScale,        z: s0z * targetScale,        ease: "sine.inOut" },
              // 66%  — gentle breath in at the front-face money shot
              { x: s0x * (targetScale * 1.06), y: s0y * (targetScale * 1.06), z: s0z * (targetScale * 1.06), ease: "sine.inOut" },
              // 100% — settle back to target size (inherited by next section)
              { x: s0x * targetScale,        y: s0y * targetScale,        z: s0z * targetScale,        ease: "sine.inOut" },
            ],
            duration: 1,
            immediateRender: false,
          },
          0,
        );
      }
    });

    // Refresh ScrollTrigger once the timeline is built to ensure measurements are perfect
    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [splineApp, chipRef]);

  return (
    <section
      ref={wrapperRef}
      id="oryzo-fall"
      className="relative z-40 h-[700vh] w-full"
    >
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen w-full bg-transparent overflow-hidden pointer-events-none"
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"
          style={{ height: "100%" }}
        />

        {FALL_STATEMENTS.map((item, i) => (
          <div
            key={`fall-text-${i}`}
            ref={(el) => {
              textRefs.current[i] = el;
            }}
            className={`absolute ${item.position} ${item.align} select-none opacity-0`}
            style={{ maxWidth: "clamp(280px, 40vw, 560px)" }}
          >
            <div
              className={`fall-line1 block text-[clamp(2.5rem,7vw,9rem)] font-black tracking-tighter text-white leading-[0.9] uppercase`}
              style={{
                fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                letterSpacing: "-0.03em",
              }}
            >
              {item.line1}
            </div>
            <div
              className={`fall-line2 block text-[clamp(2.5rem,7vw,9rem)] font-black tracking-tighter leading-[0.9] uppercase`}
              style={{
                fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                letterSpacing: "-0.03em",
                color: "transparent",
                WebkitTextStroke: "1px rgba(255,255,255,0.8)",
              }}
            >
              {item.line2}
            </div>
            <div
              className="fall-sub mt-4 text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] uppercase text-white font-light opacity-0"
              style={{
                fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {item.sub}
            </div>
          </div>
        ))}

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20">
          <p
            className="text-[8px] tracking-[0.5em] uppercase text-white font-light"
            style={{
              fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
            }}
          >
            Continue
          </p>
          <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </div>
    </section>
  );
}
