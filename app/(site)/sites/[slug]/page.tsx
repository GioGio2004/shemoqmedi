import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { PublicListing } from "@/convex-helpers-api";
import { PageHero } from "@/components/listing/PageHero";
import { AwardBadge, TierBadge } from "@/components/listing/Badges";
import { Countdown } from "@/components/listing/Countdown";
import { InViewVideo } from "@/components/listing/InViewVideo";
import { ScreenshotGallery } from "@/components/listing/ScreenshotGallery";
import { ScoreBreakdown } from "@/components/listing/ScoreBreakdown";
import { PillLink, Tag } from "@/components/site/ui";
import { getListing, withRef } from "@/lib/listings";
import { categoryName, regionName, technologySlug } from "@/lib/collections";
import { formatDate, hostOf } from "@/lib/format";

const BASE_URL = (process.env.NEXT_PUBLIC_URL || "https://www.shemoqmedi.space").replace(/\/+$/, "");

// Rendered on first visit, then cached and refreshed at most once a minute.
// Convex reads are POST requests, which Next treats as uncacheable; force-static
// keeps the page static (ISR) and revalidate refreshes it in the background.
export const dynamic = "force-static";
export const revalidate = 60;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) return { title: "Site not found", robots: { index: false } };
  const title = `${listing.title} by ${listing.creditName}`;
  return {
    title,
    description: listing.tagline,
    alternates: { canonical: `/sites/${slug}` },
    openGraph: {
      type: "article",
      title,
      description: listing.tagline,
      url: `/sites/${slug}`,
      images: listing.coverUrl ? [{ url: listing.coverUrl, width: 1600, height: 1000 }] : [],
    },
    twitter: { card: "summary_large_image" },
  };
}

// Small outline pill matching the badge row height. Mono only for the
// countdown slot (dates); region uses the sans face.
const pill =
  "inline-flex h-6 items-center rounded-full border border-black/15 px-2.5 text-[10px] font-medium tracking-[0.08em] text-black uppercase";
const monoPill = `${pill} font-mono tabular-nums`;

function buildJsonLd(listing: PublicListing) {
  const pageUrl = `${BASE_URL}/sites/${listing.slug}`;
  const category = categoryName(listing.category);
  const rated = listing.communityVotesCount > 0 && listing.finalScore !== null;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        name: listing.title,
        description: listing.tagline,
        url: listing.url,
        image: listing.coverUrl ?? undefined,
        genre: category,
        keywords: listing.technologies.join(", "),
        datePublished: new Date(listing.publishedAt).toISOString(),
        creator: {
          "@type": listing.creatorTier === "solo" ? "Person" : "Organization",
          name: listing.creditName,
          url: listing.creditUrl ?? undefined,
        },
        mainEntityOfPage: pageUrl,
        ...(rated
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: Number(listing.finalScore!.toFixed(2)),
                bestRating: 10,
                worstRating: 1,
                ratingCount: listing.communityVotesCount,
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Websites", item: `${BASE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: category,
            item: `${BASE_URL}/collections/${listing.category}`,
          },
          { "@type": "ListItem", position: 3, name: listing.title, item: pageUrl },
        ],
      },
    ],
  };
}

/** "Voting closed" line for listings outside their window. */
function closedLabel(listing: PublicListing) {
  if (listing.status === "awarded" && listing.awardedAt) {
    return `Awarded ${formatDate(listing.awardedAt)}`;
  }
  return `Voting closed ${formatDate(listing.votingEndsAt)}`;
}

export default async function SitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) notFound();

  const liveUrl = withRef(listing.url);
  const inVoting = listing.status === "in_voting";
  const jsonLd = buildJsonLd(listing);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PageHero
        prelude={`by ${listing.creditName}`}
        title={listing.title}
        titleClassName="text-[clamp(3rem,9vw,9rem)]"
        lede={listing.tagline}
        meta={hostOf(listing.url)}
        action={
          <PillLink href={liveUrl} external>
            Visit live site
          </PillLink>
        }
      />

      {/* Facts row: awards, tier, region, voting state */}
      <section aria-label="Status" className="container-site pb-8">
        <ul className="flex flex-wrap items-center gap-2">
          {listing.awards.map((award) => (
            <li key={award}>
              <AwardBadge award={award} full />
            </li>
          ))}
          <li>
            <TierBadge tier={listing.creatorTier} />
          </li>
          <li>
            <Link href={`/collections/${listing.region}`} className={`${pill} transition-colors hover:border-black`}>
              {regionName(listing.region)}
            </Link>
          </li>
          <li>
            {inVoting ? (
              <Countdown endsAt={listing.votingEndsAt} />
            ) : (
              <span className={monoPill}>{closedLabel(listing)}</span>
            )}
          </li>
        </ul>
      </section>

      {/* Gallery */}
      <section aria-label="Screenshots" className="container-site">
        {/* Click any screenshot to see it whole in a popup (no new tab). */}
        <ScreenshotGallery
          title={listing.title}
          shots={[listing.coverUrl, ...listing.galleryUrls]
            .filter((src): src is string => !!src)
            .map((src, i) => ({ src, alt: `${listing.title} screenshot ${i + 1}` }))}
        />

        {listing.videoUrl && (
          <figure className="mt-6">
            {/* Plays muted on a loop once it scrolls into view; controls stay for pause/unmute. */}
            <InViewVideo
              controls
              poster={listing.coverUrl ?? undefined}
              src={listing.videoUrl}
              aria-label={`${listing.title} walkthrough`}
              className="aspect-video w-full rounded-3xl border border-black/8 bg-white object-cover"
            />
            <figcaption className="eyebrow mt-3">Walkthrough</figcaption>
          </figure>
        )}
      </section>

      {/* Details */}
      <section aria-label="Details" className="container-site mt-12">
        <dl className="grid gap-px overflow-hidden rounded-3xl border border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-6">
            <dt className="eyebrow">Category</dt>
            <dd className="mt-3">
              <Tag href={`/collections/${listing.category}`}>{categoryName(listing.category)}</Tag>
            </dd>
          </div>
          <div className="bg-white p-6">
            <dt className="eyebrow">Built with</dt>
            <dd className="mt-3 flex flex-wrap gap-2">
              {listing.technologies.length === 0 && <span className="text-sm text-black/55">—</span>}
              {listing.technologies.map((name) => {
                const tag = technologySlug(name);
                return (
                  <span key={name} className="font-mono">
                    <Tag href={tag ? `/collections/${tag}` : undefined}>{name}</Tag>
                  </span>
                );
              })}
            </dd>
          </div>
          <div className="bg-white p-6">
            <dt className="eyebrow">Made by</dt>
            <dd className="mt-3 grid gap-1 text-base font-semibold tracking-[-0.02em]">
              {listing.creator ? (
                <Link
                  href={`/creators/${listing.creator.slug}`}
                  className="underline underline-offset-4"
                >
                  {listing.creator.name}
                </Link>
              ) : (
                <span>{listing.creditName}</span>
              )}
              {listing.creditUrl && (
                <a
                  href={withRef(listing.creditUrl)}
                  target="_blank"
                  rel="noopener"
                  className="text-sm font-medium text-black/55 hover:text-black"
                >
                  {hostOf(listing.creditUrl)} ↗
                </a>
              )}
            </dd>
          </div>
          <div className="bg-white p-6">
            <dt className="eyebrow">Listed</dt>
            <dd className="mt-3 text-base font-semibold tracking-[-0.02em]">
              {formatDate(listing.publishedAt)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Scores + voting */}
      <section aria-label="Scores" className="container-site mt-12 pb-24">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <ScoreBreakdown listing={listing} />

          <div className="grid content-start gap-6">
            {inVoting ? (
              <div className="rounded-3xl border border-black/10 p-6 md:p-8">
                <p className="eyebrow">Community vote · 40%</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">Cast your vote</h2>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-black/60">
                  Score Design, Usability, Creativity and Code from 1 to 10. One vote per account.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <PillLink href={`/vote/${listing.slug}`}>Vote on this site</PillLink>
                  <Countdown endsAt={listing.votingEndsAt} />
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-black/10 p-6 md:p-8">
                <p className="eyebrow">Community vote</p>
                <p className="mt-3 text-sm leading-relaxed">
                  Voting has closed for this site. {closedLabel(listing)}.
                </p>
              </div>
            )}

            {!listing.isClaimed && (
              <div className="rounded-3xl border border-black/10 p-6 md:p-8">
                <p className="eyebrow">Unclaimed nominee</p>
                <p className="mt-3 text-base leading-relaxed font-medium tracking-[-0.01em]">
                  Are you the creator of {listing.title}? Claim this project to verify your profile,
                  add team credits, and unlock your official nominee badge.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <PillLink href={`/claim/${listing.slug}`} variant="outline">
                    Claim this project
                  </PillLink>
                  <Link
                    href={`/claim/${listing.slug}?intent=removal`}
                    className="text-xs font-medium text-black/55 underline underline-offset-4 hover:text-black"
                  >
                    Request removal
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <Link
          href="/"
          className="mt-10 inline-block text-sm font-medium underline underline-offset-[5px]"
        >
          ← All websites
        </Link>
      </section>
    </>
  );
}
