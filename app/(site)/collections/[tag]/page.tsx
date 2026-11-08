import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/listing/PageHero";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { PillLink, Tag } from "@/components/site/ui";
import {
  allCollections,
  collectionDescription,
  getCollection,
  MIN_INDEXABLE,
  type Collection,
} from "@/lib/collections";
import { COLLECTION_ABOUT } from "@/lib/collectionCopy";
import { getPublicListings } from "@/lib/listings";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

// Convex reads are POST requests, which Next treats as uncacheable; force-static
// keeps the page static (ISR) and revalidate refreshes it in the background.
export const dynamic = "force-static";
export const revalidate = 60;
export const dynamicParams = false;

type Params = { params: Promise<{ tag: string }> };

export function generateStaticParams() {
  return allCollections().map((c) => ({ tag: c.tag }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tag } = await params;
  const collection = getCollection(tag);
  if (!collection) return {};
  // getPublicListings is cache()d, so the page below reuses this read.
  const hits = (await getPublicListings()).filter(collection.match);
  const description = collectionDescription(collection, hits);
  const url = `/collections/${collection.tag}`;
  return {
    title: { absolute: collection.title },
    description,
    alternates: {
      canonical: url,
      // /ka is the Georgian version of the Georgia collection (paired only
      // while this page is indexable; hreflang to a noindex page is an error).
      ...(collection.tag === "georgia" && hits.length >= MIN_INDEXABLE
        ? { languages: { en: url, ka: absoluteUrl("/ka"), "x-default": url } }
        : {}),
    },
    // Replaces the root openGraph, so the shared fields and image are repeated.
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url,
      title: collection.title,
      description,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Shemoqmedi: the web's finest websites" }],
    },
    // Thin pages stay reachable and pass their links on, but are not indexed
    // until they fill up (they are left out of the sitemap too).
    ...(hits.length < MIN_INDEXABLE ? { robots: { index: false, follow: true } } : {}),
  };
}

const PRELUDE: Record<Collection["kind"], string> = {
  category: "the best",
  technology: "the best",
  region: "the best",
  award: "all the",
  status: "voting now",
};

/** Startups share the "status" kind with the nominees but are not a live vote. */
function preludeFor(collection: Collection) {
  return collection.tag === "startups" ? "the best" : PRELUDE[collection.kind];
}

/** Awards and the live nominees list browse as one group. */
function group(kind: Collection["kind"]) {
  return kind === "status" ? "award" : kind;
}

/**
 * Smaller type for longer headings, so they wrap in two or three lines. The
 * leading is restated because tailwind-merge drops PageHero's with its size.
 */
function headingSize(heading: string) {
  if (heading.length <= 10) return undefined;
  if (heading.length <= 18) return "text-[clamp(3rem,9vw,9rem)] leading-[0.88]";
  return "text-[clamp(2.25rem,7vw,7rem)] leading-[0.9]";
}

export default async function CollectionPage({ params }: Params) {
  const { tag } = await params;
  const collection = getCollection(tag);
  if (!collection) notFound();

  const all = await getPublicListings();
  const listings = all.filter(collection.match);
  // Only link siblings that have something to show.
  const related = allCollections().filter(
    (c) => c.tag !== collection.tag && group(c.kind) === group(collection.kind) && all.some(c.match),
  );
  const url = absoluteUrl(`/collections/${collection.tag}`);
  const about = COLLECTION_ABOUT[collection.tag];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": url,
        name: collection.title,
        description: collectionDescription(collection, listings),
        url,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: listings.length,
          itemListElement: listings.map((l, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: absoluteUrl(`/sites/${l.slug}`),
            name: l.title,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: collection.name, item: url },
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
        prelude={preludeFor(collection)}
        title={collection.heading}
        titleClassName={headingSize(collection.heading)}
        lede={collection.intro}
        meta={`${listings.length} ${listings.length === 1 ? "website" : "websites"}`}
        action={
          <PillLink href="/submit" variant="outline">
            Submit your site
          </PillLink>
        }
      />

      {related.length > 0 && (
        <nav aria-label="Related collections" className="container-site pb-12">
          <ul className="flex flex-wrap gap-2">
            {related.map((c) => (
              <li key={c.tag}>
                <Tag href={`/collections/${c.tag}`}>{c.name}</Tag>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <section aria-label={collection.heading} className="container-site pb-24">
        <ListingGrid listings={listings} />
      </section>

      {about && (
        <section aria-labelledby="about-collection" className="container-site border-t border-black/10 py-16 md:py-24">
          <h2 id="about-collection" className="eyebrow">
            About {collection.heading.toLowerCase().startsWith("this") ? "the nominees" : collection.heading}
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
