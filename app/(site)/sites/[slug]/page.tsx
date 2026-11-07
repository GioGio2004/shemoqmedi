import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/listing/PageHero";
import { PillLink, Tag } from "@/components/site/ui";
import { getListing, withRef } from "@/lib/listings";
import { categoryName } from "@/lib/taxonomy";

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://www.shemoqmedi.space";

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

function formatDate(ms: number) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(
    ms,
  );
}

export default async function SitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) notFound();

  const liveUrl = withRef(listing.url);
  const host = new URL(listing.url).host.replace(/^www\./, "");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        name: listing.title,
        description: listing.tagline,
        url: listing.url,
        image: listing.coverUrl ?? undefined,
        genre: categoryName(listing.category),
        keywords: listing.technologies.join(", "),
        datePublished: new Date(listing.publishedAt).toISOString(),
        creator: {
          "@type": "Organization",
          name: listing.creditName,
          url: listing.creditUrl ?? undefined,
        },
        mainEntityOfPage: `${BASE_URL}/sites/${listing.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Websites", item: `${BASE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: categoryName(listing.category),
            item: `${BASE_URL}/category/${listing.category}`,
          },
          { "@type": "ListItem", position: 3, name: listing.title },
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
        prelude={`by ${listing.creditName}`}
        title={listing.title}
        titleClassName="text-[clamp(3rem,9vw,9rem)]"
        lede={listing.tagline}
        meta={host}
        action={
          <PillLink href={liveUrl} external>
            Visit site
          </PillLink>
        }
      />

      <section aria-label="Screenshots" className="container-site">
        <div className={listing.mobileUrl ? "grid gap-6 lg:grid-cols-[1fr_minmax(0,300px)]" : ""}>
          {listing.coverUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener"
              className="relative block aspect-[16/10] overflow-hidden rounded-3xl border border-black/8"
            >
              <Image
                src={listing.coverUrl}
                alt={`${listing.title} desktop screenshot`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1100px"
                className="object-cover object-top"
              />
            </a>
          )}
          {listing.mobileUrl && (
            <div className="relative mx-auto aspect-[9/19.5] w-full max-w-[300px] overflow-hidden rounded-3xl border border-black/8 lg:mx-0">
              <Image
                src={listing.mobileUrl}
                alt={`${listing.title} mobile screenshot`}
                fill
                sizes="300px"
                className="object-cover object-top"
              />
            </div>
          )}
        </div>
      </section>

      <section aria-label="Details" className="container-site mt-12">
        <dl className="grid gap-px overflow-hidden rounded-3xl border border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-6">
            <dt className="eyebrow">Category</dt>
            <dd className="mt-3">
              <Tag href={`/category/${listing.category}`}>{categoryName(listing.category)}</Tag>
            </dd>
          </div>
          <div className="bg-white p-6">
            <dt className="eyebrow">Built with</dt>
            <dd className="mt-3 flex flex-wrap gap-2">
              {listing.technologies.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </dd>
          </div>
          <div className="bg-white p-6">
            <dt className="eyebrow">Made by</dt>
            <dd className="mt-3 text-base font-semibold tracking-[-0.02em]">
              {listing.creditUrl ? (
                <a href={listing.creditUrl} target="_blank" rel="noopener" className="underline underline-offset-4">
                  {listing.creditName} ↗
                </a>
              ) : (
                listing.creditName
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
        <Link href="/" className="mt-10 inline-block text-sm font-medium underline underline-offset-[5px]">
          ← All websites
        </Link>
      </section>
    </>
  );
}
