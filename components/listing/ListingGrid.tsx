import type { PublicListing } from "@/convex-helpers-api";
import { PillLink } from "@/components/site/ui";
import { ListingCard } from "./ListingCard";

/** 3-column directory grid (1 / 2 / 3 columns). Server wrapper around ListingCard. */
export function ListingGrid({
  listings,
  emptyTitle = "Nothing listed here yet.",
  className,
}: {
  listings: PublicListing[];
  emptyTitle?: string;
  className?: string;
}) {
  if (listings.length === 0) {
    return (
      <div className={className}>
        <div className="flex flex-col items-start gap-6 rounded-3xl border border-black/10 p-8 md:p-12">
          <p className="max-w-lg text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.045em]">
            {emptyTitle}
          </p>
          <PillLink href="/submit">Submit a site</PillLink>
        </div>
      </div>
    );
  }

  return (
    <ul className={`grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3 ${className ?? ""}`}>
      {listings.map((listing, i) => (
        <li key={listing.slug}>
          <ListingCard listing={listing} priority={i < 3} />
        </li>
      ))}
    </ul>
  );
}
