import type { Metadata } from "next";
import type { PublicListing } from "@/convex-helpers-api";
import { HeroFrame } from "@/components/listing/HeroShowcase";
import { ListingCard } from "@/components/listing/ListingCard";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { PageHero } from "@/components/listing/PageHero";
import { PillLink, Tag } from "@/components/site/ui";
import { COLLECTION_ABOUT } from "@/lib/collectionCopy";
import { MIN_INDEXABLE } from "@/lib/collections";
import { getPublicListings } from "@/lib/listings";
import { SITE_NAME, absoluteUrl } from "@/lib/site";
import { SOTD_PATH, formatDay, formatMonth, sotdWinners, utcToday, wonOn } from "@/lib/sotd";

// Convex reads are POST requests, which Next treats as uncacheable; force-static
// keeps the page static (ISR) and revalidate refreshes it in the background,
// so a new day's winner shows within a minute of 00:00 UTC.
export const dynamic = "force-static";
export const revalidate = 60;

const TITLE = `Site of the Day: Daily Website Award Winners (${new Date().getFullYear()})`;
const FIXED_DESCRIPTION =
  "One website a day, scored 8.50 or more by the jury and the community on design, usability, creativity and code. Every Site of the Day, by date.";

/** Names the latest winners once there are enough of them, like the collection pages. */
function description(winners: PublicListing[]) {
  if (winners.length < MIN_INDEXABLE) return FIXED_DESCRIPTION;
  const names = [...new Map(winners.map((l) => [l.title.toLowerCase(), l.title])).values()];
  for (const k of [3, 2, 1]) {
    const text = `${winners.length} Site of the Day winners, one a day: ${names.slice(0, k).join(", ")} and more. Scored by the jury and the community.`;
    if (text.length <= 160) return text;
  }
  return FIXED_DESCRIPTION;
}

export async function generateMetadata(): Promise<Metadata> {
  // getPublicListings is cache()d, so the page below reuses this read.
  const winners = sotdWinners(await getPublicListings());
  const text = description(winners);
  return {
    title: { absolute: TITLE },
    description: text,
    alternates: { canonical: SOTD_PATH },
    // Replaces the root openGraph, so the shared fields and image are repeated.
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: SOTD_PATH,
      title: TITLE,
      description: text,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Shemoqmedi: the web's finest websites" }],
    },
    // Reachable and followed from day one, indexed once it has a few winners.
    ...(winners.length < MIN_INDEXABLE ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Winners grouped by month ("2026-11"), newest first. Winners without a day go last. */
function byMonth(winners: PublicListing[]) {
  const groups = new Map<string, PublicListing[]>();
  for (const listing of winners) {
    const key = listing.sotdDay?.slice(0, 7) ?? "earlier";
    groups.set(key, [...(groups.get(key) ?? []), listing]);
  }
  return [...groups];
}

export default async function SiteOfTheDayPage() {
  const listings = await getPublicListings();
  const winners = sotdWinners(listings);
  const today = utcToday();
  const current = winners.find((l) => wonOn(l) === today) ?? null;
  const archive = winners.filter((l) => l !== current);
  const url = absoluteUrl(SOTD_PATH);
  const about = COLLECTION_ABOUT.sotd;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": url,
        name: "Site of the Day",
        description: description(winners),
        url,
        mainEntity: {
          "@type": "ItemList",
          itemListOrder: "https://schema.org/ItemListOrderDescending",
          numberOfItems: winners.length,
          itemListElement: winners.map((l, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: absoluteUrl(`/sites/${l.slug}`),
            name: l.sotdDay ? `${l.title} (${formatDay(l.sotdDay)})` : l.title,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Site of the Day", item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PageHero
        prelude="one website a day"
        title="Site of the Day"
        titleClassName="text-[clamp(3rem,9vw,9rem)] leading-[0.88]"
        lede="Every day, one site that scored 8.50 or more with the jury and the community. Never the same site twice."
        meta={`${winners.length} ${winners.length === 1 ? "winner" : "winners"}`}
        action={
          <PillLink href="/submit" variant="outline">
            Submit your site
          </PillLink>
        }
      />

      <nav aria-label="Other awards" className="container-site pb-12">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Tag href="/collections/bsc">Best Solo Creation</Tag>
          </li>
          <li>
            <Tag href="/collections/hm">Honorable Mention</Tag>
          </li>
          <li>
            <Tag href="/collections/nominees">Nominees</Tag>
          </li>
          <li>
            <Tag href="/how-we-score">How we score</Tag>
          </li>
        </ul>
      </nav>

      {current && (
        <section aria-label="Today's Site of the Day" className="container-site pb-16 md:pb-24">
          <HeroFrame label={`Today · ${formatDay(today)}`} listing={current} wide />
        </section>
      )}

      {winners.length === 0 ? (
        <section className="container-site pb-24">
          <ListingGrid listings={[]} emptyTitle="The first Site of the Day is coming soon." />
        </section>
      ) : (
        byMonth(archive).map(([month, items]) => (
          <section key={month} aria-labelledby={`month-${month}`} className="container-site pb-16 md:pb-24">
            <h2
              id={`month-${month}`}
              className="mb-8 border-t border-black/10 pt-6 text-[clamp(1.5rem,2.6vw,2.25rem)] leading-none font-semibold tracking-[-0.045em]"
            >
              {month === "earlier" ? "Earlier" : formatMonth(month)}
            </h2>
            <ol className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {items.map((listing) => (
                <li key={listing.slug}>
                  {listing.sotdDay && (
                    <p className="mb-3 font-mono text-[11px] tracking-[0.08em] text-black/55 uppercase">
                      <time dateTime={listing.sotdDay}>{formatDay(listing.sotdDay)}</time>
                    </p>
                  )}
                  <ListingCard listing={listing} />
                </li>
              ))}
            </ol>
          </section>
        ))
      )}

      {about && (
        <section aria-labelledby="about-sotd" className="container-site border-t border-black/10 py-16 md:py-24">
          <h2 id="about-sotd" className="eyebrow">
            About Site of the Day
          </h2>
          <div className="mt-6 grid max-w-2xl gap-5 text-[15px] leading-relaxed text-black/70">
            {about.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
