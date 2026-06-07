"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Application, SPEObject } from "@splinetool/runtime";

gsap.registerPlugin(ScrollTrigger);

interface TheImpactSectionProps {
  splineApp: Application | null;
  chipRef: SPEObject | null;
}

type VariantKey = "Standard" | "Pro" | "Elite";

interface VariantDetail {
  title: string;
  description: string;
  features: string[];
}

const VARIANT_DETAILS: Record<VariantKey, VariantDetail> = {
  Standard: {
    title: "NTAG STANDARD",
    description:
      "The original. Refined until it feels inevitable. Lifts just enough, grips just right, and quietly disappears into your day like it was never there.",
    features: [
      "Matte Polymer Body",
      "Standard Range NFC",
      "Voloo App Core Suite",
    ],
  },
  Pro: {
    title: "NTAG PRO",
    description:
      "Engineered for performance. Brushed aluminum bezel with enhanced range and multi-app support for venues seeking a premium edge.",
    features: [
      "Brushed Aluminum Bezel",
      "High-Range Antenna",
      "Custom URL Mapping",
      "Priority Venue Setup",
    ],
  },
  Elite: {
    title: "NTAG ELITE",
    description:
      "The pinnacle of our craft. Hand-polished obsidian steel, custom laser engraving, and dedicated priority concierge support.",
    features: [
      "Obsidian Steel Frame",
      "Max-Range Coil",
      "Custom Engraving",
      "VIP Support",
      "Lifetime Replacement Warranty",
    ],
  },
};

export default function TheImpactSection({
  splineApp,
  chipRef,
}: TheImpactSectionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const topUIRef = useRef<HTMLDivElement>(null);
  const bottomUIRef = useRef<HTMLDivElement>(null);

  const [activeVariant, setActiveVariant] = useState<VariantKey>("Standard");

  useEffect(() => {
    const wrapper = wrapperRef.current;

    // STRICT GUARD: Do not run any GSAP code until the DOM, Spline, and the Chip exist.
    if (!wrapper || !splineApp || !chipRef) {
      console.log(
        "⏳ [TheImpactSection] Waiting for Spline before building ScrollTrigger...",
      );

      // Fallback: if spline never loads, still reveal the UI so it's not invisible forever.
      // We use a short timeout as a graceful fallback — the GSAP animation is prettier but
      // this ensures content is never permanently hidden.
      const fallbackTimer = setTimeout(() => {
        if (topUIRef.current) gsap.set(topUIRef.current, { opacity: 1, y: 0 });
        if (bottomUIRef.current)
          gsap.set(bottomUIRef.current, { opacity: 1, y: 0 });
      }, 2000);

      return () => clearTimeout(fallbackTimer);
    }

    console.log(
      "✅ [TheImpactSection] Spline ready — building scroll timeline.",
    );

    // Capture chip's current state from whatever OryzoEditorialGallery left it in.
    // Do NOT use hardcoded 0 values — animate relative to current state to avoid snaps.
    const startPosX = chipRef.position.x;
    const startPosY = chipRef.position.y;
    const startPosZ = chipRef.position.z;
    const startRotX = chipRef.rotation.x;
    const startRotY = chipRef.rotation.y;
    const startRotZ = chipRef.rotation.z;
    const startScaleX = chipRef.scale.x;
    const startScaleY = chipRef.scale.y;
    const startScaleZ = chipRef.scale.z;

    const ctx = gsap.context(() => {
      const sharedScrollTrigger: ScrollTrigger.Vars = {
        trigger: wrapper,
        start: "top top",
        end: "bottom bottom",
        scrub: 4,
        invalidateOnRefresh: true,
        // Call requestRender on EVERY update so the 3D canvas stays live
        onUpdate: () => splineApp.requestRender(),
      };

      // ── DOM UI timeline (text / buttons) ─────────────────────────────────────
      // Note: shared onUpdate above drives the render; this is a separate timeline
      // for the UI elements only so they animate smoothly.
      const uiTl = gsap.timeline({
        scrollTrigger: { ...sharedScrollTrigger },
      });

      if (topUIRef.current && bottomUIRef.current) {
        uiTl
          .fromTo(
            topUIRef.current,
            { opacity: 0, y: -30 },
            { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" },
            0.4,
          )
          .fromTo(
            bottomUIRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" },
            0.5,
          );
      }

      // ── 3D Chip timeline ──────────────────────────────────────────────────────
      // Single unified tween with keyframes — ONE authoritative interpolation path.
      // Two separate tweens on the same property caused GSAP to fight itself,
      // making the chip appear to spin more than intended.
      const chipTl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "bottom bottom",
          scrub: 4,
          invalidateOnRefresh: true,
          onUpdate: () => splineApp.requestRender(),
        },
      });

      // ── Rotation — slow quarter-turn with a gentle tilt ─────────────────────
      chipTl.to(
        chipRef.rotation,
        {
          y: startRotY + Math.PI * 0.001, // 90° Y spin
          x: startRotX + Math.PI * 0.08, // ~15° forward tilt — adds depth
          z: startRotZ + Math.PI * 0.03, // ~5° lean — subtle premium feel
          ease: "sine.inOut",
          duration: 1,
          immediateRender: false,
        },
        0,
      );

      // ── Position — single smooth arc to centre ───────────────────────────────
      chipTl.to(
        chipRef.position,
        {
          keyframes: [
            { x: 0, y: startPosY, z: startPosZ, ease: "sine.inOut" }, // 0%
            {
              x: 0,
              y: startPosY * 0.4,
              z: startPosZ * 0.4,
              ease: "sine.inOut",
            }, // 50%
            { x: 0, y: 0, z: 0, ease: "sine.inOut" }, // 100%
          ],
          duration: 1,
          immediateRender: false,
        },
        0,
      );

      // ── Scale — one gentle breath, no pops ──────────────────────────────────
      chipTl.to(
        chipRef.scale,
        {
          keyframes: [
            {
              x: startScaleX,
              y: startScaleY,
              z: startScaleZ,
              ease: "sine.inOut",
            },
            {
              x: startScaleX * 1.05,
              y: startScaleY * 1.05,
              z: startScaleZ * 1.05,
              ease: "sine.inOut",
            },
            {
              x: startScaleX,
              y: startScaleY,
              z: startScaleZ,
              ease: "sine.inOut",
            },
          ],
          duration: 1,
          immediateRender: false,
        },
        0,
      );
    }, wrapper);

    // Do NOT call ScrollTrigger.refresh() here — it invalidates the pinned
    // OryzoEditorialGallery section above. GSAP's invalidateOnRefresh handles
    // recalculation when the window resizes.

    return () => ctx.revert();
  }, [splineApp, chipRef]);

  return (
    <section
      ref={wrapperRef}
      // ─── KEY FIX ───────────────────────────────────────────────────────────
      // bg-transparent (NOT bg-[#0a0a0a]) so the fixed Spline canvas (z-0) shows
      // through. The original opaque background was blocking the 3D animation entirely.
      // A gradient on the sticky inner container provides legibility without hiding
      // the canvas.
      className="relative z-40 h-[250vh] w-full bg-transparent"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-12 px-6 md:px-12 lg:px-24 pointer-events-none">
        {/*
          ── Dark gradient overlay for text legibility ─────────────────────────
          We need enough contrast for the UI text but the canvas must remain
          visible. A radial vignette centred behind the text achieves this without
          covering the chip in the middle of the viewport.
        */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 120% 60% at 50% 0%, rgba(10,10,10,0.75) 0%, transparent 70%), " +
              "radial-gradient(ellipse 120% 60% at 50% 100%, rgba(10,10,10,0.75) 0%, transparent 70%)",
            zIndex: 0,
          }}
          aria-hidden="true"
        />

        {/* TOP UI: Title & Selectors */}
        <div
          ref={topUIRef}
          className="relative flex flex-col items-center z-10 pt-8 opacity-0 pointer-events-auto"
        >
          <h3 className="text-white/80 text-sm md:text-base font-bold tracking-[0.2em] uppercase mb-2">
            Choose Your Own
          </h3>
          <h2 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter text-[#f4eedc] uppercase mb-8 text-center">
            NTAG
          </h2>

          {/* Pill Buttons */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {(["Standard", "Pro", "Elite"] as VariantKey[]).map((variant) => (
              <button
                key={variant}
                onClick={() => setActiveVariant(variant)}
                className={`py-2 px-6 rounded-full text-xs md:text-sm font-bold tracking-widest uppercase transition-all duration-300 border ${
                  activeVariant === variant
                    ? "bg-[#2a130e] border-[#ff4a1c] text-[#ff4a1c]"
                    : "bg-transparent border-white/20 text-white/60 hover:border-white/50 hover:text-white"
                }`}
              >
                {variant === "Standard"
                  ? "NTAG"
                  : `NTAG ${variant.toUpperCase()}`}
              </button>
            ))}
          </div>
        </div>

        {/* BOTTOM UI: Split Description & Features */}
        <div
          ref={bottomUIRef}
          className="relative w-full flex flex-col md:flex-row justify-between items-start md:items-end z-10 pb-8 opacity-0 pointer-events-auto gap-8 md:gap-12"
        >
          {/* Left Side: Description */}
          <div className="w-full md:w-1/3 text-left">
            <h4 className="text-white font-bold text-xl md:text-2xl mb-4 tracking-tight">
              {VARIANT_DETAILS[activeVariant].title}
            </h4>
            <p className="text-white/60 font-medium text-sm leading-relaxed max-w-sm">
              {VARIANT_DETAILS[activeVariant].description}
            </p>
          </div>

          {/* Right Side: Features List */}
          <div className="w-full md:w-1/3 flex flex-col gap-3">
            {VARIANT_DETAILS[activeVariant].features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-white/40 text-xs shrink-0">
                  +
                </div>
                <span className="text-white/80 font-medium text-sm tracking-wide">
                  {feature}
                </span>
              </div>
            ))}

            {/* CTA Button */}
            <button className="mt-6 py-4 px-8 w-full md:w-auto bg-[#f4eedc] text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors duration-300">
              Pre-Order Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
