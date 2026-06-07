"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { useLocale } from "next-intl";
import { api } from "@/convex-helpers-api";
import { ArrowUpRight } from "lucide-react";

/**
 * OnboardedVenues — Client Component
 *
 * Showcases all cafes and restaurants onboarded on the platform.
 * Dark-themed, no animation — designed to blend into the black landing page.
 * Data is live from Convex via publicMenu.listOrganizations.
 */
export default function OnboardedVenues() {
  const locale = useLocale();
  const organizations = useQuery(api.publicMenu.listOrganizations);

  return (
    <section
      id="venues"
      className="relative z-10 w-full bg-black px-6 py-24 md:py-32 border-t border-white/[0.05]"
    >
      <div className="max-w-7xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="mb-16 md:mb-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <p className="text-[10px] tracking-[0.45em] uppercase text-white/25 mb-4 font-light">
              Powered by Voloo
            </p>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white leading-none uppercase">
              Our Venues
            </h2>
          </div>
          <p className="text-white/35 text-sm font-light max-w-xs text-left md:text-right leading-relaxed">
            Every cafe and restaurant running their digital experience on the
            Shemoqmedi platform.
          </p>
        </div>

        {/* ── Loading Skeleton ───────────────────────────────────── */}
        {organizations === undefined && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[320px] rounded-2xl bg-white/[0.04] border border-white/[0.06] animate-pulse"
              />
            ))}
          </div>
        )}

        {/* ── Empty State ────────────────────────────────────────── */}
        {organizations !== undefined && organizations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-px bg-white/10" />
            <p className="text-white/20 text-sm font-light tracking-widest uppercase">
              No venues yet
            </p>
          </div>
        )}

        {/* ── Venue Grid ─────────────────────────────────────────── */}
        {organizations !== undefined && organizations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {organizations.map(
              (org: {
                _id: string;
                slug: string;
                imageUrl: string | null;
                name: string;
              }) => (
                <Link
                  key={org._id}
                  href={`/${locale}/custom-ui-test/${org.slug}`}
                  className="group relative h-[320px] rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.07] hover:border-white/20 transition-all duration-500 block"
                >
                  {/* Cover image */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={
                        org.imageUrl ||
                        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600"
                      }
                      alt={org.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-80"
                    />
                    {/* gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  </div>

                  {/* Live badge */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.08] border border-white/[0.12] backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-medium tracking-[0.2em] uppercase text-white/60">
                      Live
                    </span>
                  </div>

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10 flex items-end justify-between">
                    <div>
                      <p className="text-[9px] tracking-[0.3em] uppercase text-white/30 mb-1 font-light">
                        Digital Menu
                      </p>
                      <h3 className="text-white font-semibold text-lg leading-tight tracking-tight group-hover:text-white/90 transition-colors">
                        {org.name}
                      </h3>
                    </div>

                    {/* Arrow icon — slides in on hover */}
                    <div className="w-9 h-9 rounded-full border border-white/[0.15] bg-white/[0.06] backdrop-blur-sm flex items-center justify-center text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ),
            )}
          </div>
        )}

        {/* ── Bottom rule / count ───────────────────────────────── */}
        {organizations !== undefined && organizations.length > 0 && (
          <div className="mt-12 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/[0.05]" />
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/20 font-light shrink-0">
              {organizations.length}{" "}
              {organizations.length === 1 ? "Venue" : "Venues"} Onboarded
            </p>
            <div className="flex-1 h-px bg-white/[0.05]" />
          </div>
        )}
      </div>
    </section>
  );
}
