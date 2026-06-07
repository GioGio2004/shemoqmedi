import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/HeroSection";
import SplineOrchestrator from "@/components/interactive/SplineOrchestrator";
import OnboardedVenues from "@/components/OnboardedVenues";

/**
 * Home — Server Component
 *
 * Root page implementing the 6-layer stacking architecture:
 *   Layer 1 (bg-black)  — base dark background via <main>
 *   Layer 2 (z-0/fixed) — Spline 3D canvas (via SplineOrchestrator)
 *   Layer 3 (z-10)      — post-processing / depth overlays (future)
 *   Layer 4 (z-20)      — 2D artistic sketches (future)
 *   Layer 5 (z-30)      — HTML DOM content (hero card, typography, buttons)
 *   Layer 6 (z-40)      — Invisible GSAP ScrollTrigger scroll wrappers
 *
 * SplineOrchestrator coordinates the Spline canvas, hero scroll wrapper,
 * and HorizontalGallery — passing the chip ref between them so the 3D
 * rotation timeline shares the exact same trigger as the gallery scroll.
 */

const SPLINE_NFC_SCENE =
  "https://prod.spline.design/9rMrcEyXyHMDU75H/scene.splinecode";

export default function Home() {
  return (
    <main className="relative w-full bg-black text-white selection:bg-gray-600 font-sans">
      {/* ── Fixed Layers ──────────────────────────────────────
          Layer 5: HeroSection (fixed z-30)
          Navbar:  fixed z-50                                   */}
      <HeroSection />
      <Navbar />

      {/* ── Scrolling Document Flow ───────────────────────────
          SplineOrchestrator renders:
            1. NfcScrollyTelling (fixed canvas z-0 + hero wrapper z-40)
            2. HorizontalGallery (z-10, synced 3D rotation)     */}
      <SplineOrchestrator sceneUrl={SPLINE_NFC_SCENE} />

      {/* ── Footer + Venues block (z-10) ───────────────────────
          Everything below lives in a single opaque z-10 wrapper
          so the Spline canvas is fully hidden beneath it — the
          3D animation "stops" exactly at the top of this block.  */}
      <div className="relative z-10 w-full bg-black">

        {/* Venues showcase — merged into footer so canvas stops here */}
        <OnboardedVenues />

        <footer
          id="contact"
          className="relative flex flex-col items-center justify-center
                     min-h-[60vh] w-full px-6 py-24 border-t border-white/[0.05]"
        >
          <p className="text-[10px] tracking-[0.35em] uppercase text-white/25 mb-6 font-light">
            Get in touch
          </p>
          <h2 className="text-3xl md:text-4xl font-extralight text-white mb-4 text-center leading-[1.2]">
            Ready to elevate your venue?
          </h2>
          <div className="w-12 h-px bg-white/15 mb-6" />
          <p className="text-white/35 text-base font-light text-center max-w-md mb-10">
            We work exclusively with hospitality businesses who demand the
            highest standard of craft and technology.
          </p>
          <a
            href="mailto:hello@shemoqmedi.space"
            className="px-8 py-3 text-sm font-light
                       bg-white/[0.06] border border-white/15 rounded-full
                       text-white/70 transition-all duration-400
                       hover:bg-white/15 hover:text-white hover:border-white/25
                       hover:shadow-lg hover:shadow-white/[0.05]"
          >
            hello@shemoqmedi.space
          </a>
          <div className="absolute bottom-8 text-center">
            <p className="text-[9px] tracking-[0.3em] uppercase text-white/15 font-light">
              © {new Date().getFullYear()} Voloo Ecosystem — Shemoqmedi.space
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
