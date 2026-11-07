import { MetadataRoute } from "next";
import { getPublishedSlugs } from "@/lib/listings";
import { CATEGORIES } from "@/lib/taxonomy";

// Must match the serving host (www); see the canonical-host note in app/layout.tsx.
const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://www.shemoqmedi.space";

// Convex reads are POST requests, which Next treats as uncacheable; force-static
// keeps the page static (ISR) and revalidate refreshes it in the background.
export const dynamic = "force-static";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sites = await getPublishedSlugs();
  return [
    { url: `${BASE_URL}/`, changeFrequency: "daily", priority: 1 },
    ...CATEGORIES.map((c) => ({
      url: `${BASE_URL}/category/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...sites.map((s) => ({
      url: `${BASE_URL}/sites/${s.slug}`,
      lastModified: new Date(s.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
