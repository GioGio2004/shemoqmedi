"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Suspense, lazy } from "react";
import Image from "next/image";
import { Application, SPEObject } from "@splinetool/runtime";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CHIP_SCALE } from "@/components/HorizontalGallery";

gsap.registerPlugin(ScrollTrigger);

const Spline = lazy(() => import("@splinetool/react-spline"));

/** The normal UI-size scale the chip settles at after the hero scroll. */
const CHIP_FINAL_SCALE = 0.5;

interface NfcScrollyTellingProps {
  sceneUrl: string;
  onChipReady?: (app: Application, chip: SPEObject) => void;
}

export default function NfcScrollyTelling({
  sceneUrl,
  onChipReady,
}: NfcScrollyTellingProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const chipObjRef = useRef<SPEObject | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const [splineLoaded, setSplineLoaded] = useState(false);

  const onLoad = useCallback(
    (app: Application) => {
      appRef.current = app;
      const ntagChip = app.findObjectByName("NFC_Coaster");

      if (ntagChip) {
        chipObjRef.current = ntagChip;

        // ── Initial State: Chip dominates the viewport ──────────────────────
        gsap.set(ntagChip.scale, {
          x: CHIP_SCALE,
          y: CHIP_SCALE,
          z: CHIP_SCALE,
        });

        // Dead center in the camera's view
        gsap.set(ntagChip.position, { x: 0, y: 0 });

        app.requestRender();
        onChipReady?.(app, ntagChip);
      } else {
        console.warn(
          "[NfcScrollyTelling] NFC_Coaster not found. Available objects:",
          app.getAllObjects().map((o) => o.name),
        );
      }

      setSplineLoaded(true);
    },
    [onChipReady],
  );

  useEffect(() => {
    return () => {
      appRef.current?.dispose();
    };
  }, []);

  /* ── Hero GSAP Timeline ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!splineLoaded) return;

    const heroUI = document.getElementById("hero-ui-layer");
    const scrollContainer = document.getElementById("hero-scroll-container");
    const heroBg = document.getElementById("hero-bg-layer");
    if (!heroUI || !scrollContainer) return;

    const chip = chipObjRef.current;
    const app = appRef.current;

    const ctx = gsap.context(() => {
      const sharedTrigger: ScrollTrigger.Vars = {
        trigger: scrollContainer,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
        onUpdate: () => {
          if (app) app.requestRender();
        },
      };

      const heroTl = gsap.timeline({ scrollTrigger: sharedTrigger });

      // ── Act 1: The UI Layer softly expands and fades out ─────────────────
      heroTl.to(
        heroUI,
        {
          scale: 1.05,
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
        },
        0,
      );

      // ── Act 1: Background fades out slowly ───────────────────────────────
      if (heroBg) {
        heroTl.to(
          heroBg,
          {
            opacity: 0,
            duration: 1, // Slow fade as requested
            ease: "power1.inOut",
          },
          0,
        );
      }

      // ── Act 1: Chip scales down and rotates ──────────────────────────────
      if (chip && app) {
        heroTl.to(
          chip.scale,
          {
            x: CHIP_FINAL_SCALE,
            y: CHIP_FINAL_SCALE,
            z: CHIP_FINAL_SCALE,
            duration: 1,
            ease: "power2.inOut",
          },
          0,
        );

        heroTl.to(
          chip.rotation,
          {
            y: chip.rotation.y + Math.PI * 1.5,
            z: chip.rotation.z + Math.PI * 0.25,
            duration: 1,
            ease: "power1.inOut",
          },
          0,
        );
      }
    }, wrapperRef);

    ctxRef.current = ctx;
    return () => ctx.revert();
  }, [splineLoaded]);

  return (
    <div ref={wrapperRef} className="relative z-0">
      {/* ── Layer 0: Background Image ── */}
      <div id="hero-bg-layer" className="fixed inset-0 w-full h-dvh z-0">
        <Image
          src="/bg-coffee.jpg"
          alt="Coffee Background"
          fill
          className="object-cover object-center opacity-60"
          priority
        />
      </div>

      {/* ── Layer 1: Fixed Spline 3D Canvas ── */}
      <div className="fixed inset-0 w-full h-dvh z-10 pointer-events-none">
        <Suspense
          fallback={
            <div className="w-full h-full bg-transparent" aria-hidden="true" />
          }
        >
          <Spline scene={sceneUrl} onLoad={onLoad} />
        </Suspense>
      </div>

      {/* ── Layer 5: Absolute Obsidian UI ── */}
      <div
        id="hero-ui-layer"
        className="fixed inset-0 z-30 pointer-events-none p-6 md:p-12 flex flex-col justify-between"
        aria-hidden="true"
      >
        {/* Top Header Row */}
        <div className="flex justify-between items-start w-full">
          <div>
            <h1
              className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none drop-shadow-2xl"
              style={{
                fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              NTAG
            </h1>
            <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-white mt-2 font-bold">
              Shemoqmedi Space
            </p>
          </div>

          <div className="text-right hidden md:block bg-black px-4 py-2 border border-white/20">
            <p className="text-[9px] tracking-[0.4em] uppercase text-white/60 font-light mb-1">
              System
            </p>
            <p className="text-xs tracking-widest text-white font-bold">
              NFC_CORE // 01
            </p>
          </div>
        </div>

        {/* Bottom Technical Spec Card - Solid Black Brutalism */}
        <div className="max-w-sm bg-[#050505] border border-white/20 p-6 md:p-8 mb-8 md:mb-0 relative overflow-hidden">
          {/* Subtle architectural grid lines in the background of the card */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-white animate-pulse" />
              <p className="text-[10px] tracking-[0.4em] uppercase text-white font-bold">
                The Digital Bridge
              </p>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight tracking-tight">
              The Instant Menu Dropper.
            </h2>

            <p className="text-xs md:text-sm font-light text-white/70 leading-relaxed mb-6">
              Passive NFC technology engineered for premium venues. Deliver your
              full digital menu directly to guests' phones with a single tap.
              Zero friction. Zero battery.
            </p>

            <div className="w-full h-px bg-white/20" />

            <div className="mt-4 flex justify-between items-center">
              <p className="text-[9px] tracking-[0.2em] uppercase text-white/50 font-bold">
                Crafted for Hospitality
              </p>
              <p className="text-[9px] tracking-[0.2em] uppercase text-white font-black bg-white/10 px-2 py-1">
                v1.0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Layer 6: Hero Scroll Container ── */}
      <div
        id="hero-scroll-container"
        className="relative z-40 h-[200vh]"
        aria-hidden="true"
      />
    </div>
  );
}
