import type { PublicListing } from "@/convex-helpers-api";
import { ListingCard } from "@/components/listing/ListingCard";
import { getPublicListings } from "@/lib/listings";

/**
 * Up to `count` other public listings: the same category first, then sites
 * sharing a technology, then the newest. Within each group, more shared
 * technologies rank higher; ties keep the newest-first order of `all`.
 */
export function pickRelated(listing: PublicListing, all: PublicListing[], count = 3) {
  const others = all.filter((l) => l.slug !== listing.slug);
  const shared = (l: PublicListing) =>
    l.technologies.filter((t) => listing.technologies.includes(t)).length;
  const byShared = (a: PublicListing, b: PublicListing) => shared(b) - shared(a);

  const sameCategory = others.filter((l) => l.category === listing.category).sort(byShared);
  const sameTech = others
    .filter((l) => l.category !== listing.category && shared(l) > 0)
    .sort(byShared);
  const picked = new Set([...sameCategory, ...sameTech]);
  const newest = others.filter((l) => !picked.has(l));

  return [...sameCategory, ...sameTech, ...newest].slice(0, count);
}

/**
 * "More websites" row at the end of a listing page, so every listing links
 * to its neighbours (for visitors and crawlers alike). Server component;
 * renders nothing when there is no other listing. Cards never preload their
 * images: the row is below the fold and must not compete with the cover.
 * They show the screenshot only, no hover-preview video: three more videos
 * streaming on every listing page view would eat the media bandwidth.
 */
export async function RelatedListings({ listing }: { listing: PublicListing }) {
  const related = pickRelated(listing, await getPublicListings());
  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-title" className="border-t border-black/10 py-16 md:py-24">
      <div className="container-site">
        <p className="eyebrow">Keep browsing</p>
        <h2
          id="related-title"
          className="mt-3 text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] font-semibold tracking-[-0.055em]"
        >
          More websites
        </h2>
        <ul className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 md:mt-12 md:grid-cols-2 lg:grid-cols-3">
          {related.map((l) => (
            <li key={l.slug}>
              <ListingCard listing={{ ...l, videoUrl: null }} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
