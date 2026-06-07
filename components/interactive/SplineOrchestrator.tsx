"use client";

import { useState, useCallback } from "react";
import { Application, SPEObject } from "@splinetool/runtime";
import NfcScrollyTelling from "@/components/interactive/NfcScrollyTelling";
import HorizontalGallery from "@/components/HorizontalGallery";
import OryzoFallSection from "@/components/interactive/OryzoFallSection";
import OryzoEditorialGallery from "@/components/interactive/OryzoEditorialGallery";
import TheImpactSection from "@/components/interactive/TheImpactSection";

/**
 * SplineOrchestrator — Client Component
 *
 * Coordinates all scroll sections and passes the shared chip ref
 * down so each section can bind its own GSAP timeline to the same
 * 3D object.
 *
 * Section order (after hero):
 *   1. HorizontalGallery      — first gallery (small cards, gallery scroll)
 *   2. OryzoFallSection       — cinematic fall transition + chip tilt reveal
 *   3. OryzoEditorialGallery  — second gallery (full-bleed editorial, Oryzo-style)
 *                               → chip snaps face-on at end of this section
 *   4. TheImpactSection       — testimonials void + CTA/pre-order
 */

interface SplineOrchestratorProps {
  sceneUrl: string;
}

export default function SplineOrchestrator({
  sceneUrl,
}: SplineOrchestratorProps) {
  const [splineApp, setSplineApp] = useState<Application | null>(null);
  const [chipObj, setChipObj] = useState<SPEObject | null>(null);

  const handleChipReady = useCallback((app: Application, chip: SPEObject) => {
    setSplineApp(app);
    setChipObj(chip);
  }, []);

  return (
    <>
      {/* ── Section 1: Hero 3D intro ──────────────────────────────────────
          NfcScrollyTelling renders:
            • Fixed Spline canvas (z-0)
            • Brutalist SHEMOQMEDI wordmark (z-30, fades on scroll)
            • Hero scroll wrapper (z-40, h-[200vh])                       */}
      <NfcScrollyTelling sceneUrl={sceneUrl} onChipReady={handleChipReady} />

      {/* ── Section 2: First horizontal gallery ──────────────────────────
          Small-card gallery. Chip rotates in sync with gallery scroll.   */}
      <div className="relative z-10 w-full">
        <HorizontalGallery splineApp={splineApp} chipRef={chipObj} />
      </div>

      {/* ── Section 3: Oryzo-style fall transition ────────────────────────
          Cinematic text statements. Chip tilts to perspective view.
          300vh scroll distance.                                           */}
      <OryzoFallSection splineApp={splineApp} chipRef={chipObj} />

      {/* ── Section 4: Second gallery — full-bleed editorial ──────────────
          Oryzo.ai-inspired horizontal carousel.
          Full viewport height panels, massive typography overlaid on images.
          At end: chip snaps to face-on (rotation → 0,0,0).               */}
      <div className="relative z-10 w-full">
        <OryzoEditorialGallery splineApp={splineApp} chipRef={chipObj} />
      </div>

      {/* ── Section 5: The Impact / CTA ───────────────────────────────────
          Testimonials void + choose your NTAG + pre-order button.
          Chip is now face-on from Section 4 — TheImpactSection receives
          it already settled so its own animations continue from there.   */}
      <TheImpactSection splineApp={splineApp} chipRef={chipObj} />
    </>
  );
}
