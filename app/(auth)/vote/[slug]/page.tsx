import type { Metadata } from "next";
import { MediaImage as Image } from "@/components/site/MediaImage";
import { notFound } from "next/navigation";
import type { PublicListing } from "@/convex-helpers-api";
import { Header } from "@/components/site/Header";
import { PageHero } from "@/components/listing/PageHero";
import { Countdown } from "@/components/listing/Countdown";
import { VoteForm } from "@/components/listing/VoteForm";
import { PillLink } from "@/components/site/ui";
import { getListing, withRef } from "@/lib/listings";
import { formatDate, hostOf } from "@/lib/format";

// Protected by proxy.ts (requires a Clerk session). Rendered per request so
// the open/closed state is always current.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  return {
    title: listing ? `Vote on ${listing.title}` : "Vote",
    robots: { index: false },
  };
}

function isVotingOpen(listing: PublicListing) {
  return listing.status === "in_voting" && listing.votingEndsAt > Date.now();
}

export default async function VotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) notFound();

  const open = isVotingOpen(listing);

  return (
    <>
      <Header />
      <main id="main-content">
        <PageHero
          prelude="cast your vote"
          title={listing.title}
          titleClassName="text-[clamp(2.75rem,8vw,7.5rem)]"
          lede={listing.tagline}
          meta={
            open ? (
              <Countdown endsAt={listing.votingEndsAt} />
            ) : (
              `Voting closed ${formatDate(listing.votingEndsAt)}`
            )
          }
          action={
            <PillLink href={`/sites/${listing.slug}`} variant="outline">
              Back to site
            </PillLink>
          }
        />
        <div className="container-site grid gap-6 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <figure className="grid content-start gap-3">
            <div className="relative aspect-video overflow-hidden rounded-3xl border border-black/8">
              {listing.coverUrl && (
                <Image
                  src={listing.coverUrl}
                  alt={`${listing.title} desktop screenshot`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 680px"
                  className="object-cover object-top"
                />
              )}
            </div>
            {/* Judge the live build, not just this screenshot. */}
            <figcaption className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <span className="text-xs font-medium">
                by {listing.creditName} · {hostOf(listing.url)}
              </span>
              <PillLink href={withRef(listing.url)} external>
                Visit live site
              </PillLink>
            </figcaption>
          </figure>
          <VoteForm slug={listing.slug} title={listing.title} open={open} />
        </div>
      </main>
    </>
  );
}
