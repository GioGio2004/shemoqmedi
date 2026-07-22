import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, ArrowUpRight, UtensilsCrossed } from "lucide-react";
import { buildMenuUrl } from "@/lib/routes";

type Venue = {
  _id: string;
  slug: string;
  name: string;
  category: "cafe" | "restaurant" | "bar" | "hotel" | "other";
  description: string;
  address: string;
  coverImage: string | null;
  tags: string[];
  googleRating: number | null;
  googleReviewCount: number | null;
  updatedAt: number;
};

const CATEGORY_LABELS: Record<Venue["category"], string> = {
  cafe:       "Café",
  restaurant: "Restaurant",
  bar:        "Bar",
  hotel:      "Hotel",
  other:      "Venue",
};

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800";

interface VenueDirectoryGridProps {
  venues: Venue[];
  locale: string;
}

export default function VenueDirectoryGrid({ venues, locale }: VenueDirectoryGridProps) {
  if (venues.length === 0) {
    return (
      <section className="px-6 md:px-12 py-24 flex flex-col items-center gap-4">
        <div className="w-12 h-px bg-white/10" />
        <p className="text-white/20 text-sm font-light tracking-widest uppercase">
          No published venues yet
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Venue directory"
      className="px-6 md:px-12 py-12 pb-24"
    >
      {/* Count label */}
      <p className="text-[10px] tracking-[0.3em] uppercase text-white/20 font-light mb-8">
        {venues.length} {venues.length === 1 ? "Venue" : "Venues"} Listed
      </p>

      {/* Grid */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0">
        {venues.map((venue) => (
          <li key={venue._id}>
            <article className="group relative h-[380px] rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.07] hover:border-white/20 transition-all duration-500 flex flex-col">
              {/* Cover image */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={venue.coverImage ?? PLACEHOLDER_IMAGE}
                  alt={`${venue.name} — ${CATEGORY_LABELS[venue.category]} in Tbilisi`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-55 group-hover:opacity-75"
                />
                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              </div>

              {/* Category + rating badges */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.1] border border-white/[0.15] backdrop-blur-sm text-[9px] font-medium tracking-[0.15em] uppercase text-white/70">
                  <UtensilsCrossed className="w-2.5 h-2.5" />
                  {CATEGORY_LABELS[venue.category]}
                </span>

                {venue.googleRating !== null && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 backdrop-blur-sm text-[9px] font-semibold text-amber-400">
                    <Star className="w-2.5 h-2.5 fill-amber-400" />
                    {venue.googleRating.toFixed(1)}
                    {venue.googleReviewCount !== null && (
                      <span className="text-amber-400/60 font-normal">
                        ({venue.googleReviewCount.toLocaleString()})
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                {/* Address */}
                {venue.address && (
                  <p className="flex items-center gap-1.5 text-[10px] text-white/35 font-light mb-2 line-clamp-1">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    {venue.address}
                  </p>
                )}

                <h2 className="text-white font-semibold text-xl leading-tight tracking-tight mb-1 group-hover:text-white/90 transition-colors">
                  {venue.name}
                </h2>

                <p className="text-white/35 text-xs font-light leading-relaxed line-clamp-2 mb-4">
                  {venue.description}
                </p>

                {/* CTAs */}
                <div className="flex items-center gap-2">
                  <Link
                    href={buildMenuUrl(locale, venue.slug)}
                    className="flex-1 text-center py-2 px-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-white/70 bg-white/[0.06] border border-white/[0.12] rounded-full hover:bg-white/10 hover:text-white transition-all duration-200"
                  >
                    View Venue
                  </Link>
                  <Link
                    href={buildMenuUrl(locale, venue.slug)}
                    className="flex items-center gap-1.5 py-2 px-4 text-[10px] font-semibold tracking-[0.15em] uppercase text-black bg-white rounded-full hover:bg-white/90 transition-all duration-200"
                  >
                    View Menu
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
