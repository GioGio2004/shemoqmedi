import Link from "next/link";
import type { PublicListing } from "@/convex-helpers-api";
import { ArrowIcon } from "@/components/site/ui";
import { DragRail } from "./DragRail";
import { ListingCard } from "./ListingCard";

/**
 * Sites in their voting window (7 days, extended to 14 when the jury needs
 * more time), closing soonest first, as a horizontal rail you can drag with the mouse or step through with the arrow buttons.
 * Hidden when nothing is in voting.
 */
export function LiveVotingRail({ listings }: { listings: PublicListing[] }) {
  const nominees = listings
    .filter((l) => l.status === "in_voting")
    .sort((a, b) => a.votingEndsAt - b.votingEndsAt);
  if (nominees.length === 0) return null;

  return (
    <section aria-labelledby="live-voting-title" className="border-t border-black/10 py-16 md:py-24">
      <div className="container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Live voting</p>
            <h2
              id="live-voting-title"
              className="mt-3 text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] font-semibold tracking-[-0.055em]"
            >
              Nominees this week
            </h2>
          </div>
          <Link
            href="/collections/nominees"
            className="group inline-flex items-center gap-2 self-start text-[11.5px] font-semibold tracking-[0.05em] uppercase md:self-auto"
          >
            All nominees
            <ArrowIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="-mx-6 mt-10 md:mt-12">
          <DragRail
            label="Nominees this week"
            controlsClassName="px-6"
            className="flex snap-x snap-mandatory scroll-px-6 gap-6 overflow-x-auto px-6 pb-4 md:gap-8"
          >
            {nominees.map((listing) => (
              <li key={listing.slug} className="w-[80vw] shrink-0 snap-start md:w-[45%] lg:w-[32%]">
                <ListingCard listing={listing} showCountdown />
              </li>
            ))}
          </DragRail>
        </div>
      </div>
    </section>
  );
}
