import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/listing/PageHero";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { PillLink, Tag } from "@/components/site/ui";
import { allCollections, getCollection, type Collection } from "@/lib/collections";
import { getPublicListings } from "@/lib/listings";

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://www.shemoqmedi.space";

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
  const url = `/collections/${collection.tag}`;
  return {
    title: { absolute: collection.title },
    description: collection.description,
    alternates: { canonical: url },
    openGraph: { title: collection.title, description: collection.description, url },
  };
}

const PRELUDE: Record<Collection["kind"], string> = {
  category: "the best of",
  technology: "built with",
  region: "the best of",
  award: "winners of",
  status: "voting now",
};

/** Awards and the live nominees list browse as one group. */
function group(kind: Collection["kind"]) {
  return kind === "status" ? "award" : kind;
}

export default async function CollectionPage({ params }: Params) {
  const { tag } = await params;
  const collection = getCollection(tag);
  if (!collection) notFound();

  const listings = (await getPublicListings()).filter(collection.match);
  const related = allCollections().filter(
    (c) => c.tag !== collection.tag && group(c.kind) === group(collection.kind),
  );
  const url = `${BASE_URL}/collections/${collection.tag}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": url,
        name: collection.title,
        description: collection.description,
        url,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: listings.length,
          itemListElement: listings.map((l, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${BASE_URL}/sites/${l.slug}`,
            name: l.title,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
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
        prelude={PRELUDE[collection.kind]}
        title={collection.name}
        titleClassName={collection.name.length > 10 ? "text-[clamp(3rem,9vw,9rem)]" : undefined}
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

      <section aria-label={`${collection.name} websites`} className="container-site pb-24">
        <ListingGrid listings={listings} />
      </section>
    </>
  );
}
