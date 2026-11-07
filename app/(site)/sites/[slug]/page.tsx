import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { PublicListing } from "@/convex-helpers-api";
import { PageHero } from "@/components/listing/PageHero";
import { AwardBadge, TierBadge } from "@/components/listing/Badges";
import { Countdown } from "@/components/listing/Countdown";
import { InViewVideo } from "@/components/listing/InViewVideo";
import { RelatedListings } from "@/components/listing/RelatedListings";
import { ScreenshotGallery } from "@/components/listing/ScreenshotGallery";
import { ScoreBreakdown } from "@/components/listing/ScoreBreakdown";
import { PillLink, Tag } from "@/components/site/ui";
import { getListing, getPublicSlugs, withRef } from "@/lib/listings";
import { resolveListingSlug } from "@/lib/slugRedirect";
import { categoryName, regionName, technologySlug } from "@/lib/collections";
import { formatDate, formatScore, hostOf } from "@/lib/format";
import { isImageKit, optimizedImageUrl } from "@/lib/imageLoader";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import { AWARDS } from "@/lib/taxonomy";

// Rendered on first visit, then cached and refreshed at most once a minute.
// Convex reads are POST requests, which Next treats as uncacheable; force-static
// keeps the page static (ISR) and revalidate refreshes it in the background.
export const dynamic = "force-static";
export const revalidate = 60;

// Every public listing is prerendered at build, so the first visit after a
// deploy (often Googlebot's) is a cache hit. New listings still render on
// demand (dynamicParams stays true).
export async function generateStaticParams() {
  const slugs = await getPublicSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

// ── SEO copy ────────────────────────────────────────────────────────────────

const TITLE_MAX = 60; // before the layout's " | Shemoqmedi"
const DESCRIPTION_MAX = 160;
const listFormat = new Intl.ListFormat("en", { type: "conjunction" });
const list = (items: string[]) => listFormat.format(items);

/** The listing's awards, best first (SOTD, BSC, HM). */
function rankedAwards(listing: PublicListing) {
  return AWARDS.filter((a) => listing.awards.includes(a.slug));
}

/** Category for running text: "architecture", "AI", "SaaS"; null for "other". */
function categoryPhrase(slug: string) {
  if (slug === "other") return null;
  const name = categoryName(slug);
  return /^(AI|SaaS)$/.test(name) ? name : name.toLowerCase();
}

/**
 * Search title, aiming at "<brand> website" and design queries:
 * "Kencho Group: Architecture Website by Giorgi Khvichia", or with an award
 * "FLOEMA Website by Bürocratik: Site of the Day". The first variant that
 * fits in TITLE_MAX wins; the H1 stays the plain listing title.
 */
function listingTitle(listing: PublicListing) {
  const title = listing.title.trim();
  const credit = listing.creditName.trim();
  const named = credit.toLowerCase() !== title.toLowerCase(); // a portfolio named after its maker
  const site = listing.category === "other" ? null : `${categoryName(listing.category)} Website`;
  const award = rankedAwards(listing)[0]?.name;
  const options = [
    award && named && `${title} Website by ${credit}: ${award}`,
    award && named && `${title} by ${credit}: ${award}`,
    award && `${title} Website: ${award}`,
    site && named && `${title}: ${site} by ${credit}`,
    site && `${title}: ${site}`,
    named && `${title} Website by ${credit}`,
    named && `${title} by ${credit}`,
    `${title} Website`,
  ].filter((t): t is string => !!t);
  return options.find((t) => t.length <= TITLE_MAX) ?? title;
}

/** "Text" → "Text." (leaves . ! ? … and a closing quote or bracket alone). */
function asSentence(text: string) {
  const s = text.trim().replace(/\s+/g, " ");
  return !s || /[.!?…]["'”’)\]]?$/.test(s) ? s : `${s}.`;
}

/** As many whole leading sentences of `text` as fit in `max` ("" if not even one). */
function leadingSentences(text: string, max: number) {
  let out = "";
  for (const sentence of text.split(/(?<=[.!?…]["'”’)\]]?)\s+/)) {
    const next = out ? `${out} ${sentence}` : sentence;
    if (next.length > max) break;
    out = next;
  }
  return out;
}

/** Cut at a word boundary so the result, with its "…", fits in `max`. */
function clip(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const atWord = cut.replace(/\s+\S*$/, "") || cut;
  return `${atWord.replace(/[\s,;:.!?–—-]+$/, "")}…`;
}

/**
 * Meta description (~150-160 chars): the jury note (or the tagline), then
 * what it is ("Architecture website by Giorgi Khvichia, built with Next.js,
 * GSAP, and Motion."), then the award or score. A long lead is trimmed to
 * whole sentences; if none fits, the facts come first and the lead is cut.
 */
function listingDescription(listing: PublicListing) {
  const lead = asSentence(listing.juryNote?.trim() || listing.tagline);
  const what = listing.category === "other" ? "Website" : `${categoryName(listing.category)} website`;
  const stack = listing.technologies.length
    ? `, built with ${list(listing.technologies.slice(0, 3))}`
    : "";
  const facts = `${what} by ${listing.creditName.trim()}${stack}.`;
  const awards = rankedAwards(listing).map((a) => a.name);
  const verdict = awards.length
    ? `Awarded ${list(awards)} on ${SITE_NAME}.`
    : listing.finalScore !== null
      ? `Scored ${formatScore(listing.finalScore)}/10 on ${SITE_NAME}.`
      : "";

  const join = (...parts: string[]) => parts.filter(Boolean).join(" ");
  // The lead trimmed to whole sentences that leave room for `tail` ("" if none fits).
  const fit = (tail: string) => leadingSentences(lead, DESCRIPTION_MAX - tail.length - 1);
  const led = (head: string, ...tail: string[]) => (head ? join(head, ...tail) : "");
  const candidates = [
    join(lead, facts, verdict),
    led(fit(join(facts, verdict)), facts, verdict),
    join(lead, facts),
    led(fit(facts), facts),
  ];
  return (
    candidates.find((text) => text && text.length <= DESCRIPTION_MAX) ??
    clip(join(facts, verdict, lead), DESCRIPTION_MAX)
  );
}

/**
 * Social card from the cover: ImageKit crops it to a 1200x630 JPG from the top.
 * No cover: the site's default card (this page's openGraph replaces the root's,
 * so app/opengraph-image.tsx would not apply on its own).
 */
function socialImage(listing: PublicListing) {
  const src = listing.coverUrl;
  if (!src) {
    return { url: "/opengraph-image", width: 1200, height: 630, alt: "Shemoqmedi: the web's finest websites" };
  }
  const alt = `${listing.title} website by ${listing.creditName}`;
  if (!isImageKit(src)) return { url: src, alt }; // older Convex file: real size unknown
  const url = new URL(src);
  url.searchParams.set("tr", "w-1200,h-630,fo-top,f-jpg,q-80");
  return { url: url.toString(), width: 1200, height: 630, alt };
}

/**
 * The walkthrough poster resized and cached (same path as MediaImage: Next's
 * optimiser, or ImageKit with NEXT_PUBLIC_IMAGE_CDN=imagekit), never the
 * full-size original. 1920 is in images.deviceSizes.
 */
function posterUrl(src: string) {
  return optimizedImageUrl(src, 1920);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) return { title: "Site not found", robots: { index: false } };

  const title = listingTitle(listing);
  const description = listingDescription(listing);
  const url = absoluteUrl(`/sites/${listing.slug}`);
  const image = socialImage(listing);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      locale: "en_US",
      title,
      description,
      url,
      publishedTime: new Date(listing.publishedAt).toISOString(),
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

// Small outline pill matching the badge row height. Mono only for the
// countdown slot (dates); region uses the sans face.
const pill =
  "inline-flex h-6 items-center rounded-full border border-black/15 px-2.5 text-[10px] font-medium tracking-[0.08em] text-black uppercase";
const monoPill = `${pill} font-mono tabular-nums`;

/**
 * WebPage + CreativeWork + BreadcrumbList. No rating markup: Google shows
 * review stars only for specific types (not CreativeWork), and the final
 * score is jury-weighted, not an average of user ratings.
 */
function buildJsonLd(listing: PublicListing, meta: { title: string; description: string }) {
  const pageUrl = absoluteUrl(`/sites/${listing.slug}`);
  const category = categoryName(listing.category);
  const published = new Date(listing.publishedAt).toISOString();
  const images = [listing.coverUrl, ...listing.galleryUrls].filter((src): src is string => !!src);
  const awards = rankedAwards(listing);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": pageUrl,
        url: pageUrl,
        name: meta.title,
        description: meta.description,
        inLanguage: "en",
        isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: SITE_NAME, url: `${SITE_URL}/` },
        primaryImageOfPage: listing.coverUrl ?? undefined,
        datePublished: published,
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        mainEntity: { "@id": `${pageUrl}#work` },
      },
      {
        "@type": "CreativeWork",
        "@id": `${pageUrl}#work`,
        name: listing.title,
        description: listing.tagline,
        url: listing.url,
        image: images.length > 0 ? images : undefined,
        genre: category,
        keywords: listing.technologies.length > 0 ? listing.technologies.join(", ") : undefined,
        datePublished: published,
        creator: {
          "@type": listing.creatorTier === "solo" ? "Person" : "Organization",
          // Same @id as the creator profile's main entity.
          ...(listing.creator ? { "@id": `${absoluteUrl(`/creators/${listing.creator.slug}`)}#creator` } : {}),
          name: listing.creditName,
          url: listing.creditUrl ?? undefined,
        },
        ...(awards.length > 0 ? { award: awards.map((a) => `${SITE_NAME} ${a.name}`) } : {}),
        mainEntityOfPage: { "@id": pageUrl },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: category,
            item: absoluteUrl(`/collections/${listing.category}`),
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
  if (!listing) {
    // Renamed in the admin: send the old URL (and its ranking) to the new one.
    const current = await resolveListingSlug(slug);
    if (current) permanentRedirect(`/sites/${current}`);
    notFound();
  }

  const liveUrl = withRef(listing.url);
  const inVoting = listing.status === "in_voting";
  const jsonLd = buildJsonLd(listing, {
    title: listingTitle(listing),
    description: listingDescription(listing),
  });

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
              <Link href={`/collections/${award.toLowerCase()}`} className="group inline-flex">
                <AwardBadge award={award} full className="transition-colors group-hover:bg-black/80" />
              </Link>
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
          credit={listing.creditName}
          category={categoryPhrase(listing.category)}
          srcs={[listing.coverUrl, ...listing.galleryUrls].filter((src): src is string => !!src)}
        />

        {listing.videoUrl && (
          <figure className="mt-6">
            {/* Plays muted on a loop once it scrolls into view; our own play/pause button, no browser bar. */}
            <InViewVideo
              toggle
              toggleLabel="walkthrough"
              poster={listing.coverUrl ? posterUrl(listing.coverUrl) : undefined}
              src={listing.videoUrl}
              aria-label={`${listing.title} walkthrough`}
              className="aspect-video w-full rounded-3xl border border-black/8 bg-white object-cover"
            />
            <figcaption className="eyebrow mt-3">Walkthrough</figcaption>
          </figure>
        )}
      </section>

      {/* Jury note: the owner's own short review */}
      {listing.juryNote?.trim() && (
        <section aria-labelledby="jury-note-title" className="container-site mt-12">
          <h2 id="jury-note-title" className="eyebrow">
            Jury note
          </h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed tracking-[-0.01em]">{listing.juryNote}</p>
        </section>
      )}

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

      {/* Up to 3 neighbouring listings: same category, then shared stack, then newest */}
      <RelatedListings listing={listing} />
    </>
  );
}
