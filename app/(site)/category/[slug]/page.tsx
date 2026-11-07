import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/listing/PageHero";
import { CategoryPills } from "@/components/listing/CategoryPills";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { PillLink } from "@/components/site/ui";
import { getCategoryCounts, getPublishedListings } from "@/lib/listings";
import { CATEGORIES } from "@/lib/taxonomy";

// Convex reads are POST requests, which Next treats as uncacheable; force-static
// keeps the page static (ISR) and revalidate refreshes it in the background.
export const dynamic = "force-static";
export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

function findCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = findCategory(slug);
  if (!category) return {};
  const title = `Best ${category.name} websites`;
  const description = `A curated showcase of the best ${category.name.toLowerCase()} websites, submitted by their creators.`;
  return {
    title,
    description,
    alternates: { canonical: `/category/${slug}` },
    openGraph: { title, description, url: `/category/${slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = findCategory(slug);
  if (!category) notFound();

  const [listings, counts] = await Promise.all([
    getPublishedListings(slug),
    getCategoryCounts(),
  ]);
  const count = counts.byCategory[slug] ?? 0;

  return (
    <>
      <PageHero
        prelude="the best of"
        title={category.name}
        meta={`${count} ${count === 1 ? "website" : "websites"}`}
        action={<PillLink href="/submit" variant="outline">Submit your site</PillLink>}
      />
      <CategoryPills active={slug} counts={counts} />
      <ListingGrid listings={listings} />
    </>
  );
}
