"use client";

import { MediaImage as Image } from "@/components/site/MediaImage";
import Link from "next/link";
import type { PublicListing } from "@/convex-helpers-api";
import { categoryName } from "@/lib/collections";
import { outboundRel, withRefClient } from "@/lib/ref";
import { cn } from "@/lib/utils";
import { AwardBadge, ScoreBadge } from "./Badges";
import { Countdown } from "./Countdown";
import { ArrowIcon } from "@/components/site/ui";

/**
 * Directory card. 16:9 screenshot only: preview videos play on the listing
 * page alone, so grids of cards stay light and fast (a dozen looping videos
 * on the home page was most of its weight). On hover: slow zoom and a
 * floating "Visit site" pill.
 */
export function ListingCard({
  listing,
  priority = false,
  showCountdown,
}: {
  listing: PublicListing;
  priority?: boolean;
  showCountdown?: boolean;
}) {
  const countdown = showCountdown ?? listing.status === "in_voting";

  return (
    <article className="group relative">
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-black/8 bg-white">
        <Link href={`/sites/${listing.slug}`} aria-label={listing.title} className="absolute inset-0 block">
          {listing.coverUrl && (
            <Image
              src={listing.coverUrl}
              alt={`${listing.title} website screenshot`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap gap-1.5">
          {listing.awards.map((a) => (
            <AwardBadge key={a} award={a} />
          ))}
          {countdown && <Countdown endsAt={listing.votingEndsAt} />}
        </div>

        <a
          href={withRefClient(listing.url)}
          target="_blank"
          rel={outboundRel(listing)}
          className={cn(
            "absolute right-3 bottom-3 inline-flex min-h-9 items-center gap-2 rounded-full bg-black py-1 pr-1 pl-3.5 text-[10.5px] font-semibold tracking-[0.05em] text-white uppercase",
            "translate-y-2 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100",
          )}
        >
          Visit site
          <span className="grid size-7 place-items-center rounded-full bg-white text-black">
            <ArrowIcon className="size-3.5" />
          </span>
        </a>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="truncate text-base font-semibold tracking-[-0.02em]">
          <Link href={`/sites/${listing.slug}`} className="hover:underline hover:underline-offset-4">
            {listing.title}
          </Link>
        </h3>
        <ScoreBadge score={listing.finalScore} className="shrink-0 text-[11px]" />
      </div>
      <p className="mt-1 truncate text-sm text-black/55">
        {listing.creator ? (
          <Link href={`/creators/${listing.creator.slug}`} className="hover:text-black">
            {listing.creditName}
          </Link>
        ) : (
          listing.creditName
        )}
        {" · "}
        {categoryName(listing.category)}
      </p>
      {listing.technologies.length > 0 && (
        <p className="mt-2 font-mono text-[10px] tracking-[0.08em] text-black/55 uppercase">
          {listing.technologies.slice(0, 2).join(" · ")}
        </p>
      )}
    </article>
  );
}
