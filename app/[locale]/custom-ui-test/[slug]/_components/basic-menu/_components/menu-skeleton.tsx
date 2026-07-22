/**
 * MenuSkeleton — RULED loading frame
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-page skeleton loader that mirrors the visual layout of the live menu
 * page. Renders while the Convex `publicMenu.get` query is still loading
 * (`data === undefined`).
 *
 * Design notes (spec §5.4):
 *  - Recolored to the RULED tokens: `--v-bg` ground, `--v-line` shimmer
 *    blocks, 2px radius everywhere, 1px hairline separators.
 *  - No JS state — purely CSS-driven animation.
 */

export function MenuSkeleton() {
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: "var(--v-bg, #0A0A0A)" }}
    >
      {/* Local shimmer utility — ghost blocks are hairline-colored, 2px radius */}
      <style>{`
        .msk {
          background: var(--v-line, rgba(244,243,240,0.14));
          border-radius: 2px;
        }
        .msk-hair {
          background: var(--v-line, rgba(244,243,240,0.14));
          height: 1px;
        }
      `}</style>

      {/* ── Nav Ghost — hairline bottom, safe-area aware ──────────────────── */}
      <div
        className="fixed top-0 w-full z-50"
        style={{
          background: "color-mix(in srgb, var(--v-bg, #0A0A0A) 88%, transparent)",
          borderBottom: "1px solid var(--v-line, rgba(244,243,240,0.14))",
          paddingTop: "max(env(safe-area-inset-top), 0px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo ghost */}
          <div className="msk h-5 w-28 animate-pulse" />
          {/* Breadcrumb ghost */}
          <div className="msk hidden md:block h-2.5 w-36 animate-pulse" />
          {/* Controls ghost */}
          <div className="flex gap-3">
            <div className="msk h-8 w-16 animate-pulse" />
            <div className="msk h-8 w-8 animate-pulse rounded-full" />
          </div>
        </div>
      </div>

      {/* ── Hero Ghost ─────────────────────────────────────────────────────── */}
      <div className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-20 text-center w-full">
          {/* Mono badge ghost */}
          <div className="msk mx-auto h-6 w-44 animate-pulse mb-8" />

          {/* Headline ghosts */}
          <div className="space-y-3 mb-8">
            <div className="msk mx-auto h-14 w-96 max-w-full animate-pulse" />
            <div className="msk mx-auto h-14 w-80 max-w-full animate-pulse" />
          </div>

          {/* Subheadline ghost */}
          <div className="space-y-2 mb-14">
            <div className="msk mx-auto h-4 w-72 max-w-full animate-pulse" />
            <div className="msk mx-auto h-4 w-56 max-w-full animate-pulse" />
          </div>

          {/* CTA button ghosts */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <div className="msk w-52 animate-pulse" style={{ height: 52 }} />
            <div
              className="w-36 animate-pulse rounded-[2px]"
              style={{
                height: 52,
                border: "1px solid var(--v-line, rgba(244,243,240,0.14))",
              }}
            />
          </div>

          {/* Hero image trio ghosts — 2px frames */}
          <div className="grid grid-cols-3 gap-3 md:gap-5 max-w-3xl mx-auto">
            <div className="msk aspect-[3/4] animate-pulse" />
            <div className="msk aspect-[3/4] animate-pulse -mt-8" />
            <div className="msk aspect-[3/4] animate-pulse" />
          </div>
        </div>
      </div>

      {/* ── Menu Section Ghost — RULED header lockup ──────────────────────── */}
      <div className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Index row ghost */}
          <div className="flex justify-between items-baseline mb-3">
            <div className="msk h-2.5 w-20 animate-pulse" />
            <div className="msk h-2.5 w-14 animate-pulse" />
          </div>
          {/* Rule */}
          <div className="msk-hair w-full mb-6" />
          {/* Heading ghosts */}
          <div className="space-y-3 mb-14">
            <div className="msk h-10 w-72 max-w-full animate-pulse" />
            <div className="msk h-10 w-56 max-w-full animate-pulse" />
          </div>

          {/* Filter chips ghost */}
          <div className="flex gap-2 flex-wrap mb-12">
            {[80, 60, 90, 70].map((w, i) => (
              <div
                key={i}
                className="h-9 animate-pulse rounded-[2px]"
                style={{
                  width: `${w}px`,
                  border: "1px solid var(--v-line, rgba(244,243,240,0.14))",
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>

          {/* Card grid ghost — mirrors the 2/2/3 MenuCard grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} delay={i * 80} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Single skeleton card that mirrors the MenuCard layout (full-bleed image) */
function SkeletonCard({ delay }: { delay: number }) {
  return (
    <div
      className="overflow-hidden flex flex-col h-[280px] sm:h-[320px] rounded-[2px]"
      style={{
        border: "1px solid var(--v-line, rgba(244,243,240,0.14))",
        background: "var(--v-bg-raise, #111110)",
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Header row ghost */}
      <div className="p-3 sm:p-4 flex justify-between items-start">
        <div className="msk h-3.5 w-24 animate-pulse" style={{ animationDelay: `${delay}ms` }} />
        <div className="msk h-3.5 w-12 animate-pulse" style={{ animationDelay: `${delay}ms` }} />
      </div>

      <div className="flex-1" />

      {/* Bottom panel ghost */}
      <div
        className="p-3 sm:p-4 space-y-2"
        style={{
          borderTop: "1px solid var(--v-line, rgba(244,243,240,0.14))",
        }}
      >
        <div className="msk h-3 w-full animate-pulse" style={{ animationDelay: `${delay + 50}ms` }} />
        <div className="msk h-3 w-4/5 animate-pulse" style={{ animationDelay: `${delay + 50}ms` }} />
        <div className="flex justify-between items-center pt-2">
          <div className="msk h-2.5 w-12 animate-pulse" style={{ animationDelay: `${delay + 100}ms` }} />
          <div className="msk h-7 w-16 animate-pulse" style={{ animationDelay: `${delay + 150}ms` }} />
        </div>
      </div>
    </div>
  );
}
