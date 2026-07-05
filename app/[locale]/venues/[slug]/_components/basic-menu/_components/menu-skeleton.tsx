/**
 * MenuSkeleton
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-page skeleton loader that mirrors the exact visual layout of the live
 * menu page. Renders while the Convex `publicMenu.get` query is still loading
 * (`data === undefined`).
 *
 * Design notes:
 *  - Uses `animate-pulse` + `bg-white/[0.07]` shimmer blocks so it looks
 *    great on any background color (dark or light).
 *  - Respects whatever `--theme-bg` the parent injects, since the root
 *    wrapper already has the background applied.
 *  - No JS state — purely CSS-driven animation.
 */

export function MenuSkeleton() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── Sticky Nav Ghost ───────────────────────────────────────────────── */}
      <div className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo ghost */}
          <div className="h-5 w-28 rounded-full bg-white/10 animate-pulse" />
          {/* Nav links ghost */}
          <div className="hidden md:flex gap-8">
            <div className="h-4 w-14 rounded-full bg-white/10 animate-pulse" />
            <div className="h-4 w-14 rounded-full bg-white/10 animate-pulse" />
          </div>
          {/* Hamburger ghost */}
          <div className="md:hidden h-6 w-6 rounded bg-white/10 animate-pulse" />
        </div>
      </div>

      {/* ── Hero Ghost ─────────────────────────────────────────────────────── */}
      <div className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background shimmer */}
        <div className="absolute inset-0 bg-white/[0.03] animate-pulse" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-20 text-center w-full">
          {/* Badge ghost */}
          <div className="mx-auto h-6 w-44 rounded-full bg-white/10 animate-pulse mb-8" />

          {/* Headline ghosts */}
          <div className="space-y-3 mb-8">
            <div className="mx-auto h-14 w-96 max-w-full rounded-xl bg-white/10 animate-pulse" />
            <div className="mx-auto h-14 w-80 max-w-full rounded-xl bg-white/10 animate-pulse" />
          </div>

          {/* Subheadline ghost */}
          <div className="space-y-2 mb-14">
            <div className="mx-auto h-5 w-72 max-w-full rounded-full bg-white/8 animate-pulse" />
            <div className="mx-auto h-5 w-56 max-w-full rounded-full bg-white/8 animate-pulse" />
          </div>

          {/* CTA button ghosts */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <div className="h-14 w-52 rounded-full bg-white/15 animate-pulse" />
            <div className="h-14 w-36 rounded-full bg-white/8 animate-pulse" />
          </div>

          {/* Hero image trio ghosts */}
          <div className="grid grid-cols-3 gap-3 md:gap-5 max-w-3xl mx-auto">
            <div className="aspect-[3/4] rounded-2xl bg-white/10 animate-pulse" />
            <div className="aspect-[3/4] rounded-2xl bg-white/10 animate-pulse -mt-8" />
            <div className="aspect-[3/4] rounded-2xl bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>

      {/* ── Menu Section Ghost ─────────────────────────────────────────────── */}
      <div className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section header ghost */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="space-y-3">
              <div className="h-3 w-24 rounded-full bg-white/10 animate-pulse" />
              <div className="h-10 w-72 max-w-full rounded-xl bg-white/10 animate-pulse" />
              <div className="h-10 w-56 max-w-full rounded-xl bg-white/8 animate-pulse" />
            </div>
            {/* Filter pills ghost */}
            <div className="flex gap-2 flex-wrap">
              {[80, 60, 90, 70].map((w, i) => (
                <div
                  key={i}
                  className="h-9 rounded-full bg-white/10 animate-pulse"
                  style={{ width: `${w}px`, animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>

          {/* Card grid ghost — 6 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} delay={i * 80} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Single skeleton card that mirrors the MenuCard layout */
function SkeletonCard({ delay }: { delay: number }) {
  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.04]"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Image ghost */}
      <div className="aspect-[4/3] bg-white/[0.07] animate-pulse" style={{ animationDelay: `${delay}ms` }} />

      {/* Content ghost */}
      <div className="p-5 space-y-3">
        {/* Title + price row */}
        <div className="flex justify-between items-start">
          <div className="h-5 w-32 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: `${delay}ms` }} />
          <div className="h-5 w-14 rounded-full bg-white/15 animate-pulse" style={{ animationDelay: `${delay}ms` }} />
        </div>

        {/* Description lines */}
        <div className="space-y-1.5">
          <div className="h-3.5 w-full rounded-full bg-white/[0.06] animate-pulse" style={{ animationDelay: `${delay + 50}ms` }} />
          <div className="h-3.5 w-4/5 rounded-full bg-white/[0.06] animate-pulse" style={{ animationDelay: `${delay + 50}ms` }} />
        </div>

        {/* Tags ghost */}
        <div className="flex gap-1.5">
          {[48, 56, 44].map((w, i) => (
            <div
              key={i}
              className="h-5 rounded-full bg-white/[0.07] animate-pulse"
              style={{ width: `${w}px`, animationDelay: `${delay + 100}ms` }}
            />
          ))}
        </div>

        {/* Button ghost */}
        <div className="pt-4 border-t border-white/[0.06] flex justify-end">
          <div className="h-9 w-24 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: `${delay + 150}ms` }} />
        </div>
      </div>
    </div>
  );
}
