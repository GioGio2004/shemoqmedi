import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { PublicCreator, PublicListing } from "@/convex-helpers-api";
import { PageHero } from "@/components/listing/PageHero";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { TierBadge } from "@/components/listing/Badges";
import { PillLink } from "@/components/site/ui";
import { regionName } from "@/lib/collections";
import { hostOf } from "@/lib/format";
import { isImageKit } from "@/lib/imageLoader";
import { getCreator, getCreators } from "@/lib/listings";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

// Pre-rendered at build for every known creator, then refreshed at most once
// a minute; a new creator renders on first visit. Convex reads are POST
// requests, which Next treats as uncacheable; force-static keeps the page
// static (ISR) and revalidate refreshes it in the background.
export const dynamic = "force-static";
export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCreators()).map(({ slug }) => ({ slug }));
}

/** "A", "A and B", "A, B and 3 more" (a repeated title is named once). */
function nameWorks(titles: string[]) {
  const unique = [...new Set(titles)];
  if (unique.length <= 2) return unique.join(" and ");
  return `${unique.slice(0, 2).join(", ")} and ${unique.length - 2} more`;
}

/** Snippet for a creator without a bio: who they are and what they made. */
function fallbackDescription(creator: PublicCreator, listings: PublicListing[]) {
  const who = `${creator.name}, ${creator.tier === "solo" ? "solo developer" : "design agency"}${
    creator.location ? ` in ${creator.location}` : ""
  }`;
  if (listings.length === 0) return `${who}. Websites, jury and community scores and awards on ${SITE_NAME}.`;
  return `Websites by ${who}: ${nameWorks(listings.map((l) => l.title))}. Scored by a jury and the community on ${SITE_NAME}.`;
}

/**
 * Share image from a listing screenshot. ImageKit crops it to a 1200x630 JPG
 * from the top (JPG for the crawlers that skip WebP); an older Convex file
 * is used as it is, with no size declared since it is unknown.
 */
function coverOgImage(src: string, alt: string) {
  if (!isImageKit(src)) return { url: src, alt };
  const u = new URL(src);
  u.searchParams.set("tr", "w-1200,h-630,fo-top,f-jpg,q-80");
  return { url: u.toString(), width: 1200, height: 630, alt };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCreator(slug);
  if (!data) return { title: "Creator not found", robots: { index: false } };
  const { creator, listings } = data;
  const title = `${creator.name}: websites and awards`;
  const description = creator.bio ?? fallbackDescription(creator, listings);
  const cover = listings.find((l) => l.coverUrl);
  return {
    title,
    description,
    alternates: { canonical: `/creators/${creator.slug}` },
    // Replaces the root openGraph, so the shared fields are repeated here.
    openGraph: {
      type: "profile",
      siteName: SITE_NAME,
      locale: "en_US",
      url: `/creators/${creator.slug}`,
      title,
      description,
      images: [
        cover
          ? coverOgImage(cover.coverUrl!, `${cover.title} website by ${creator.name}`)
          : { url: "/opengraph-image", width: 1200, height: 630, alt: "Shemoqmedi: the web's finest websites" },
      ],
    },
  };
}

/** Only http(s) links are rendered; anything else (javascript:, data:) is dropped. */
function safeWebsite(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

const mono = "font-mono text-[11px] font-medium tracking-[0.08em] uppercase tabular-nums";

export default async function CreatorPage({ params }: Params) {
  const { slug } = await params;
  const data = await getCreator(slug);
  if (!data) notFound();
  const { creator, listings } = data;
  const website = safeWebsite(creator.website);

  // ProfilePage about one Person (solo) or Organization (agency). The
  // creator's @id is the one listing pages use for their creator, so both
  // describe one entity; each work's @id is the listing page's CreativeWork.
  const url = absoluteUrl(`/creators/${creator.slug}`);
  const creatorId = `${url}#creator`;
  const solo = creator.tier === "solo";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": url,
        url,
        name: `${creator.name}: websites and awards`,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: { "@id": creatorId },
      },
      {
        "@type": solo ? "Person" : "Organization",
        "@id": creatorId,
        name: creator.name,
        url: website ?? url,
        description: creator.bio ?? undefined,
        sameAs: website ? [website] : undefined,
        ...(creator.location
          ? { [solo ? "homeLocation" : "location"]: { "@type": "Place", name: creator.location } }
          : {}),
      },
      ...listings.map((listing) => {
        const page = absoluteUrl(`/sites/${listing.slug}`);
        return {
          "@type": "CreativeWork",
          "@id": `${page}#work`,
          name: listing.title,
          url: listing.url,
          mainEntityOfPage: { "@id": page },
          image: listing.coverUrl ?? undefined,
          creator: { "@id": creatorId },
        };
      }),
    ],
  };

  const counters = [
    ["SOTD", creator.awards.SOTD],
    ["BSC", creator.awards.BSC],
    ["HM", creator.awards.HM],
    ["Nominations", creator.nominations],
  ] as const;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PageHero
        prelude={creator.tier === "solo" ? "solo developer" : "agency"}
        title={creator.name}
        titleClassName={creator.name.length > 10 ? "text-[clamp(3rem,9vw,9rem)]" : undefined}
        lede={creator.bio ?? undefined}
        action={
          creator.isClaimed === false ? (
            <PillLink href={`/claim/${creator.slug}?type=creator`} variant="outline">
              Claim this profile
            </PillLink>
          ) : undefined
        }
      />

      <section aria-label="Creator facts" className="container-site pb-12">
        <dl className="flex flex-col items-start gap-4 border-y border-black/10 py-6 md:flex-row md:flex-wrap md:items-center md:gap-x-10">
          <div>
            <dt className="sr-only">Type</dt>
            <dd>
              <TierBadge tier={creator.tier} />
            </dd>
          </div>
          <div>
            <dt className="sr-only">Location</dt>
            <dd className="text-sm">{creator.location ?? regionName(creator.region)}</dd>
          </div>
          {website && (
            <div>
              <dt className="sr-only">Website</dt>
              <dd>
                <a
                  href={website}
                  target="_blank"
                  rel="noopener"
                  className="text-sm underline decoration-black/20 underline-offset-4 hover:decoration-black"
                >
                  {hostOf(website)}
                </a>
              </dd>
            </div>
          )}
          <div className="md:ml-auto">
            <dt className="sr-only">Record</dt>
            <dd className={mono}>
              {counters.map(([label, n], i) => (
                <span key={label}>
                  {i > 0 && <span aria-hidden="true"> · </span>}
                  {label} {n}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-label={`Websites by ${creator.name}`} className="container-site pb-24">
        <ListingGrid listings={listings} emptyTitle="No public websites yet." />
      </section>
    </>
  );
}
