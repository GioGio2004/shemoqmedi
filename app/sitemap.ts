import type { MetadataRoute } from "next";
import type { PublicListing } from "@/convex-helpers-api";
import { allCollections, MIN_INDEXABLE } from "@/lib/collections";
import { getCreators, getPublicListings, getPublicSlugs } from "@/lib/listings";
import { absoluteUrl } from "@/lib/site";

// Convex reads are POST requests, which Next treats as uncacheable; force-static
// keeps the page static (ISR) and revalidate refreshes it in the background.
export const dynamic = "force-static";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sites, creators, listings] = await Promise.all([
    getPublicSlugs(),
    getCreators(),
    getPublicListings(),
  ]);

  // PublicListing has no updatedAt; publicSlugs carries it.
  const updated = new Map(sites.map((s) => [s.slug, s.updatedAt]));
  /** lastmod of a hub page: the newest change among the listings it shows. */
  const newest = (ls: PublicListing[]) =>
    ls.length ? new Date(Math.max(...ls.map((l) => updated.get(l.slug) ?? l.publishedAt))) : undefined;

  return [
    {
      url: absoluteUrl("/"),
      lastModified: newest(listings),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/creators"),
      // A creator's updatedAt already includes their live listings' changes.
      lastModified: creators.length
        ? new Date(Math.max(...creators.map((c) => c.updatedAt)))
        : undefined,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    { url: absoluteUrl("/badges"), changeFrequency: "monthly", priority: 0.3 },
    // Thin collections are noindex until they fill up, so they stay out.
    ...allCollections().flatMap((c) => {
      const items = listings.filter(c.match);
      if (items.length < MIN_INDEXABLE) return [];
      return [
        {
          url: absoluteUrl(`/collections/${c.tag}`),
          lastModified: newest(items),
          changeFrequency: "daily" as const,
          priority: 0.7,
        },
      ];
    }),
    ...sites.map((s) => ({
      url: absoluteUrl(`/sites/${s.slug}`),
      lastModified: new Date(s.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...creators.map((c) => ({
      url: absoluteUrl(`/creators/${c.slug}`),
      lastModified: new Date(c.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
