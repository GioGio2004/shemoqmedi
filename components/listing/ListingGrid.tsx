import Image from "next/image";
import Link from "next/link";
import type { PublicListing } from "@/convex-helpers-api";
import { categoryName } from "@/lib/taxonomy";
import { PillLink } from "@/components/site/ui";

/** The screenshots do the talking: big image, one line of facts under it. */
export function ListingGrid({ listings }: { listings: PublicListing[] }) {
  if (listings.length === 0) {
    return (
      <div className="container-site mt-10">
        <div className="flex flex-col items-start gap-6 rounded-3xl border border-black/10 p-8 md:p-12">
          <p className="max-w-lg text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.045em]">
            Nothing listed here yet.
          </p>
          <PillLink href="/submit">Submit the first site</PillLink>
        </div>
      </div>
    );
  }

  return (
    <ul className="container-site mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing, i) => (
        <li key={listing.slug}>
          <ListingCard listing={listing} priority={i < 3} />
        </li>
      ))}
    </ul>
  );
}

function ListingCard({ listing, priority }: { listing: PublicListing; priority: boolean }) {
  return (
    <article>
      <Link href={`/sites/${listing.slug}`} className="group block">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-black/8 bg-white">
          {listing.coverUrl && (
            <Image
              src={listing.coverUrl}
              alt={`${listing.title} website screenshot`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          )}
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h2 className="truncate text-base font-semibold tracking-[-0.02em] group-hover:underline group-hover:underline-offset-4">
            {listing.title}
          </h2>
          <span className="eyebrow shrink-0">{categoryName(listing.category)}</span>
        </div>
        <p className="mt-1 truncate text-sm text-black/55">
          {listing.creditName}
          {listing.technologies.length > 0 && ` · ${listing.technologies.slice(0, 2).join(", ")}`}
        </p>
      </Link>
    </article>
  );
}
