/**
 * HeroSection — Server Component
 *
 * Brutalist typography layout.
 * The massive "SHEMOQMEDI" wordmark is rendered by NfcScrollyTelling
 * (it needs GSAP refs), so this component provides the surrounding
 * context: an overline tag and a scroll cue fixed at the bottom.
 *
 * No `use client` — fully static, SEO-friendly.
 */
export default function HeroSection() {
  return (
    <section
      id="hero"
      className="fixed inset-0 z-30 pointer-events-none"
      aria-label="Hero section"
    >
      {/* ── Top-left overline ─────────────────────────────────── */}
      <div
        className="absolute left-8 md:left-12"
        style={{ top: "max(env(safe-area-inset-top), 2rem)" }}
      >
        <p
          className="text-[10px] tracking-[0.5em] uppercase text-white/30 font-light"
          style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
        >
          The Voloo Ecosystem
        </p>
      </div>

      {/* ── Bottom-center scroll cue ─────────────────────────── */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ bottom: "max(env(safe-area-inset-bottom), 2.5rem)" }}
      >
        <p
          className="text-[9px] tracking-[0.4em] uppercase text-white/20 font-light"
          style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
        >
          Scroll
        </p>
        <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
