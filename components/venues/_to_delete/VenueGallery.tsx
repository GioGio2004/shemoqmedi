"use client";

// components/venues/VenueGallery.tsx
// ─────────────────────────────────────────────────────────────────────────────
// "The Reveal" — a minimalist hover-index gallery for venues.
//
// Desktop: venue names are large and quiet; hovering a row floats that venue's
//          cover photo in near the cursor, and dims every other row.
// Mobile:  the same list, but each row carries an inline thumbnail (hover has no
//          meaning on touch) so it still reads as a gallery.
//
// Data is passed in from the Server Component parent (page.tsx) via `fetchQuery`
// so the venue names + links are in the initial HTML — crawlable by Google and
// visible before any JavaScript runs. This component only adds the interactivity.
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { useRef, useState, useCallback } from "react";
import { ArrowUpRight } from "lucide-react";
import { buildMenuUrl } from "@/lib/routes";

export interface GalleryVenue {
  _id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

const FALLBACKS = [
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=900",
  "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=80&w=900",
  "https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=900",
  "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=900",
];

interface VenueGalleryProps {
  venues: GalleryVenue[];
  locale: string;
}

export default function VenueGallery({ venues, locale }: VenueGalleryProps) {
  const [active, setActive] = useState<number | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  // Cursor tracking for the floating preview (throttled to one update per frame).
  const handleMove = useCallback((e: React.MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      setPos({ x, y });
      rafRef.current = null;
    });
  }, []);

  if (!venues || venues.length === 0) {
    return (
      <section
        id="venues"
        className="relative z-10 w-full bg-black px-6 py-32 border-t border-white/[0.05]"
      >
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
          <div className="w-12 h-px bg-white/10" />
          <p className="text-white/25 text-xs font-light tracking-[0.3em] uppercase">
            Venues coming soon
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="venues"
      className="relative z-10 w-full bg-black px-6 md:px-10 py-24 md:py-32 border-t border-white/[0.05]"
    >
      <div className="max-w-6xl mx-auto">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-14 md:mb-24 flex items-end justify-between gap-8">
          <div>
            <p className="text-[10px] tracking-[0.45em] uppercase text-white/25 mb-4 font-light">
              Powered by Voloo
            </p>
            <h2 className="text-5xl md:text-7xl font-extralight tracking-tighter text-white leading-[0.9]">
              Our Venues
            </h2>
          </div>
          <p className="hidden sm:block text-[11px] tracking-[0.3em] uppercase text-white/25 font-light shrink-0 pb-2">
            {String(venues.length).padStart(2, "0")}{" "}
            {venues.length === 1 ? "Venue" : "Venues"}
          </p>
        </div>

        {/* ── The Reveal — index list ────────────────────────────────────── */}
        <ul
          className="relative list-none p-0 m-0 border-t border-white/[0.08]"
          onMouseMove={handleMove}
          onMouseLeave={() => setActive(null)}
        >
          {venues.map((venue, i) => {
            const dimmed = active !== null && active !== i;
            return (
              <li key={venue._id} className="border-b border-white/[0.08]">
                <Link
                  href={buildMenuUrl(locale, venue.slug)}
                  onMouseEnter={() => setActive(i)}
                  className="group flex items-center gap-5 md:gap-8 py-6 md:py-8 transition-opacity duration-500"
                  style={{ opacity: dimmed ? 0.28 : 1 }}
                >
                  {/* Index */}
                  <span className="text-[11px] md:text-sm font-mono text-white/30 w-8 shrink-0 tabular-nums pt-1.5 md:pt-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Mobile-only inline thumbnail (hover is meaningless on touch) */}
                  <span className="md:hidden shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.08]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={venue.imageUrl || FALLBACKS[i % FALLBACKS.length]}
                      alt={venue.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </span>

                  {/* Name */}
                  <span className="flex-1 min-w-0">
                    <span className="block text-3xl md:text-6xl lg:text-7xl font-extralight tracking-tight text-white leading-none truncate transition-transform duration-500 md:group-hover:translate-x-3">
                      {venue.name}
                    </span>
                  </span>

                  {/* Right meta + arrow */}
                  <span className="flex items-center gap-3 md:gap-5 shrink-0 pt-1.5 md:pt-2">
                    <span className="hidden md:inline text-[10px] tracking-[0.3em] uppercase text-white/30 font-light">
                      View Menu
                    </span>
                    <span className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-white/[0.15] flex items-center justify-center text-white/70 transition-all duration-300 md:group-hover:bg-white md:group-hover:text-black md:group-hover:border-white">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ── Bottom rule ────────────────────────────────────────────────── */}
        <div className="mt-16 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/[0.05]" />
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/20 font-light shrink-0">
            Every venue live on Shemoqmedi
          </p>
          <div className="flex-1 h-px bg-white/[0.05]" />
        </div>
      </div>

      {/* ── Floating cursor-follow preview (desktop only) ────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none fixed z-30 hidden md:block"
        style={{
          left: pos.x,
          top: pos.y,
          transform: "translate(-50%, -50%)",
          opacity: active !== null ? 1 : 0,
          transition: "opacity 400ms ease",
        }}
      >
        <div
          className="w-[300px] h-[380px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          style={{
            transform: `rotate(-4deg) scale(${active !== null ? 1 : 0.9})`,
            transition: "transform 500ms cubic-bezier(0.16,1,0.3,1)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
          }}
        >
          {active !== null && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={
                venues[active]?.imageUrl ||
                FALLBACKS[active % FALLBACKS.length]
              }
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>
    </section>
  );
}
