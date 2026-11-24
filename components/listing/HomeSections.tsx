import Link from "next/link";
import type { CreatorSummary, PublicListing } from "@/convex-helpers-api";
import { ArrowIcon, PillLink } from "@/components/site/ui";
import { CreatorGrid } from "@/components/creators/CreatorCard";
import { ListingGrid } from "./ListingGrid";

/** Sites on the home page; the rest are on /websites with every filter. */
export const HOME_LATEST = 20;
/** Creators on the home page; the rest are on /creators. */
export const HOME_CREATORS = 8;

const title = "mt-3 text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] font-semibold tracking-[-0.055em]";

function SectionHead({ id, eyebrow, heading, href, label }: { id: string; eyebrow: string; heading: string; href: string; label: string }) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className={title}>
          {heading}
        </h2>
      </div>
      <Link
        href={href}
        className="group inline-flex items-center gap-2 self-start text-[11.5px] font-semibold tracking-[0.05em] uppercase md:self-auto"
      >
        {label}
        <ArrowIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </div>
  );
}

/** The newest sites (listings arrive newest first), and a way to all of them. */
export function LatestSites({ listings }: { listings: PublicListing[] }) {
  const latest = listings.slice(0, HOME_LATEST);
  const all = `Browse all ${listings.length} ${listings.length === 1 ? "website" : "websites"}`;
  return (
    <section id="directory" aria-labelledby="latest-title" className="border-t border-black/10 pt-16 pb-16 md:pt-24 md:pb-24">
      <div className="container-site grid gap-10 md:gap-12">
        <SectionHead id="latest-title" eyebrow="Directory" heading="Latest websites" href="/websites" label="All websites" />
        <ListingGrid listings={latest} />
        {listings.length > latest.length && (
          <div className="flex justify-center">
            <PillLink href="/websites">{all}</PillLink>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Creators on the home page: the most awarded first, and among equals those
 * with a photo (a filled-in profile reads better than initials).
 */
export function FeaturedCreators({ creators }: { creators: CreatorSummary[] }) {
  if (creators.length === 0) return null;
  const picked = [...creators]
    .sort(
      (a, b) =>
        b.awards - a.awards || Number(Boolean(b.photoUrl)) - Number(Boolean(a.photoUrl)) || b.nominations - a.nominations,
    )
    .slice(0, HOME_CREATORS);
  return (
    <section aria-labelledby="creators-title" className="border-t border-black/10 pt-16 pb-24 md:pt-24">
      <div className="container-site grid gap-10 md:gap-12">
        <SectionHead
          id="creators-title"
          eyebrow="The people behind the work"
          heading="Creators"
          href="/creators"
          label={`All ${creators.length} creators`}
        />
        <CreatorGrid creators={picked} />
      </div>
    </section>
  );
}
