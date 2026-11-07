import type { Metadata } from "next";
import { PageHero } from "@/components/listing/PageHero";
import { CategoryPills } from "@/components/listing/CategoryPills";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { PillLink } from "@/components/site/ui";
import { getCategoryCounts, getPublishedListings } from "@/lib/listings";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Static HTML from the CDN, refreshed in the background at most once a
// minute, so newly approved sites appear without a deploy. (Convex reads are
// POST requests, which Next treats as uncacheable; force-static overrides that.)
export const dynamic = "force-static";
export const revalidate = 60;

export default async function Home() {
  const [listings, counts] = await Promise.all([getPublishedListings(), getCategoryCounts()]);

  return (
    <>
      <PageHero
        prelude="the web's finest"
        title="Websites"
        lede="Sites worth seeing, submitted by the people who built them and approved by hand."
        meta={`${counts.total} ${counts.total === 1 ? "website" : "websites"}`}
        action={<PillLink href="/submit" variant="outline">Submit your site</PillLink>}
      />
      <CategoryPills counts={counts} />
      <ListingGrid listings={listings} />
    </>
  );
}
