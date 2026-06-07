"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Application, SPEObject } from "@splinetool/runtime";

gsap.registerPlugin(ScrollTrigger);

/**
 * OryzoEditorialGallery — Client Component
 *
 * The second horizontal gallery — full-bleed editorial style inspired by Oryzo.ai.
 *
 * Key differences from the first HorizontalGallery:
 *  - Panels are FULL VIEWPORT HEIGHT (100vh) with no gap
 *  - Typography is MASSIVE and overlaid directly on the image
 *  - Alternating panel types: wide photo panels + narrow colored text panels
 *  - Each panel has a single bold keyword and a small overline/subline
 *  - 3D chip continues rotating AND snaps face-on at the very end
 *
 * After the carousel completes:
 *  - Chip rotation snaps to (0, 0, 0) — perfectly face-on to viewer
 *  - Chip position centers back to (0, 0, 0)
 *  - The "CHOOSE YOUR NTAG" CTA section fades in
 */

/** Panel configuration for the editorial gallery */
interface EditorialPanel {
  type: "photo" | "color";
  src?: string;
  alt?: string;
  bgColor?: string;
  width: string;
  headline: string;
  overline: string;
  subline: string;
  textColor: string;
  overlineColor: string;
}

const EDITORIAL_PANELS: EditorialPanel[] = [
  {
    type: "photo",
    src: "/gallery/01-retro-cafe.png",
    alt: "Retro cafe interior with NFC coaster on table",
    width: "w-[75vw]",
    headline: "Always\nOn.",
    overline: "24/7 Uptime. No power required.",
    subline: "Passive NFC — zero battery, zero maintenance.",
    textColor: "text-white",
    overlineColor: "text-white/50",
  },
  {
    type: "color",
    bgColor: "#7C4D2A",
    width: "w-[35vw]",
    headline: "Runs\nAnywhere.",
    overline: "No more QR codes.",
    subline: "Works with any NFC-enabled device.",
    textColor: "text-white",
    overlineColor: "text-white/60",
  },
  {
    type: "photo",
    src: "/gallery/02-espresso-detail.png",
    alt: "Precision espresso setup with Voloo coaster",
    width: "w-[65vw]",
    headline: "Perfect\nby Design.",
    overline: "Crafted for hospitality.",
    subline: "Every detail. Every surface. Considered.",
    textColor: "text-white",
    overlineColor: "text-white/50",
  },
  {
    type: "color",
    bgColor: "#1A1A1A",
    width: "w-[40vw]",
    headline: "Drop\nTested.",
    overline: "Test conditions: Hard surface.",
    subline: "Built to outlast every table, every night.",
    textColor: "text-white",
    overlineColor: "text-white/40",
  },
  {
    type: "photo",
    src: "/gallery/03-hotel-lobby.png",
    alt: "Luxury hotel lobby with Voloo NFC technology",
    width: "w-[70vw]",
    headline: "Grand\nHospitality.",
    overline: "Supporting the classics.",
    subline: "From boutique cafés to 5-star hotels.",
    textColor: "text-white",
    overlineColor: "text-white/50",
  },
  {
    type: "color",
    bgColor: "#2D1F3D",
    width: "w-[38vw]",
    headline: "The\nLegacy.",
    overline: "Ancient Greece, c. 500 BCE",
    subline: "The coaster has always been essential. We made it smart.",
    textColor: "text-white",
    overlineColor: "text-white/60",
  },
];

interface OryzoEditorialGalleryProps {
  splineApp: Application | null;
  chipRef: SPEObject | null;
}

export default function OryzoEditorialGallery({
  splineApp,
  chipRef,
}: OryzoEditorialGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slider = sliderRef.current;
    const container = containerRef.current;
    if (!slider || !container) return;

    const panels = gsap.utils.toArray<HTMLElement>(".editorial-panel");
    if (panels.length === 0) return;

    const getScrollWidth = () => slider.scrollWidth - window.innerWidth;
    const getScrollAmount = () => -getScrollWidth();
    const getEndValue = () => `+=${getScrollWidth()}`;

    const ctx = gsap.context(() => {
      // ── 2D: Horizontal slide ─────────────────────────────────────────────
      const galTrigger: ScrollTrigger.Vars = {
        trigger: container,
        pin: true,
        scrub: 1.8,
        end: getEndValue,
        invalidateOnRefresh: true,
      };

      gsap.to(panels, {
        x: getScrollAmount,
        ease: "none",
        scrollTrigger: galTrigger,
      });

      // ── Typography: Each panel's headline does a subtle parallax reveal ──
      panels.forEach((panel) => {
        const headline = panel.querySelector(".editorial-headline");
        const overline = panel.querySelector(".editorial-overline");
        if (!headline || !overline) return;

        gsap.fromTo(
          headline,
          { y: 25, opacity: 0.6 },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top top",
              end: getEndValue,
              scrub: 2,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      // ── 3D Chip: Synchronized rotation + face-on snap at end ─────────────
      if (chipRef && splineApp) {
        const startRotX = chipRef.rotation.x;
        const startRotY = chipRef.rotation.y;
        const startRotZ = chipRef.rotation.z;
        const startPosY = chipRef.position.y;
        const startPosZ = chipRef.position.z;
        const startScaleX = chipRef.scale.x;
        const startScaleY = chipRef.scale.y;
        const startScaleZ = chipRef.scale.z;

        const chipTl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: getEndValue,
            scrub: 1.8,
            invalidateOnRefresh: true,
          },
        });

        // Phase 1 (0%–75%): Smooth, steady, chill rotation
        chipTl.to(
          chipRef.rotation,
          {
            x: startRotX + Math.PI * 0.2, // Very slight tilt
            y: startRotY + Math.PI * 1.0, // One slow, elegant spin
            z: startRotZ, // Keep Z steady
            duration: 0.75,
            ease: "none", // 'none' ensures a perfectly steady spin as you scroll
            immediateRender: false,
          },
          0,
        );

        chipTl.to(
          chipRef.position,
          {
            y: startPosY + 5, // Just a tiny, calm float
            z: startPosZ + 5, // Barely moving
            duration: 0.75,
            ease: "none",
            immediateRender: false,
          },
          0,
        );

        // Phase 2 (75%–100%): Smoothly transition to face the user perfectly
        chipTl.to(
          chipRef.rotation,
          {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.25,
            ease: "power2.inOut", // Gentle, elegant snap to face-on
            immediateRender: false,
          },
          0.75,
        );

        chipTl.to(
          chipRef.position,
          {
            y: 0,
            z: 0,
            duration: 0.25,
            ease: "power2.inOut",
            immediateRender: false,
          },
          0.75,
        );

        // Scale up smoothly for the final CTA presentation over the last 25%
        chipTl.to(
          chipRef.scale,
          {
            x: startScaleX * 1.1,
            y: startScaleY * 1.1,
            z: startScaleZ * 1.1,
            duration: 0.25,
            ease: "power2.inOut",
            immediateRender: false,
          },
          0.75,
        );
      }
    });

    return () => ctx.revert();
  }, [splineApp, chipRef]);

  return (
    <section
      ref={containerRef}
      id="editorial-gallery"
      className="relative h-screen w-full overflow-hidden bg-transparent z-10"
    >
      {/* Section header */}
      <div className="absolute top-10 left-12 z-20 pointer-events-none">
        <p
          className="text-[10px] tracking-[0.35em] uppercase text-white/20 font-light"
          style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
        >
          In the wild
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-2">
        <p
          className="text-[8px] tracking-[0.5em] uppercase text-white/20 font-light"
          style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
        >
          Scroll to continue
        </p>
        <div className="w-px h-6 bg-gradient-to-b from-white/20 to-transparent" />
      </div>

      {/* Slider */}
      <div
        ref={sliderRef}
        className="flex h-full w-max flex-nowrap items-stretch"
      >
        {EDITORIAL_PANELS.map((panel, i) => (
          <div
            key={`editorial-${i}`}
            className={`editorial-panel relative ${panel.width} shrink-0 overflow-hidden`}
          >
            {/* Background */}
            {panel.type === "photo" && panel.src ? (
              <>
                <Image
                  src={panel.src}
                  alt={panel.alt || ""}
                  fill
                  sizes="70vw"
                  className="object-cover object-center"
                  priority={i < 2}
                  quality={80}
                />
                {/* Dark gradient overlay for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
              </>
            ) : (
              <div
                className="absolute inset-0"
                style={{ backgroundColor: panel.bgColor }}
              />
            )}

            {/* Vertical border between panels */}
            {i < EDITORIAL_PANELS.length - 1 && (
              <div className="absolute right-0 top-0 bottom-0 w-px bg-white/[0.06] z-30" />
            )}

            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-12 z-20">
              {/* Overline — top of panel */}
              <p
                className={`editorial-overline text-[9px] tracking-[0.4em] uppercase font-light ${panel.overlineColor}`}
                style={{
                  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                {panel.overline}
              </p>

              {/* Headline — bottom of panel, massive */}
              <div>
                <h2
                  className={`editorial-headline font-black tracking-tighter leading-[0.88] uppercase ${panel.textColor} whitespace-pre-line`}
                  style={{
                    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                    fontSize:
                      panel.type === "color"
                        ? "clamp(3.5rem, 6.5vw, 8rem)"
                        : "clamp(4rem, 8vw, 11rem)",
                  }}
                >
                  {panel.headline}
                </h2>
                <p
                  className={`mt-4 text-xs md:text-sm font-light leading-relaxed max-w-xs ${
                    panel.type === "color" ? "text-white/50" : "text-white/40"
                  }`}
                  style={{
                    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                  }}
                >
                  {panel.subline}
                </p>
              </div>
            </div>

            {/* Panel index — subtle corner number */}
            <div className="absolute top-10 right-10 z-30 pointer-events-none">
              <span
                className="text-[9px] tracking-[0.3em] text-white/15 font-light"
                style={{
                  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                0{i + 1}
              </span>
            </div>
          </div>
        ))}

        {/* End panel — teaser for next section */}
        <div className="editorial-panel relative w-[25vw] shrink-0 bg-black flex items-center justify-center">
          <div className="text-center">
            <p
              className="text-[8px] tracking-[0.5em] uppercase text-white/20 font-light mb-3"
              style={{
                fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              Up next
            </p>
            <p
              className="text-white/40 font-extralight text-sm"
              style={{
                fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              Choose yours →
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
