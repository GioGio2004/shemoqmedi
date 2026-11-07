import type { MetadataRoute } from "next";
import { allCollections } from "@/lib/collections";
import { getCreators, getPublicSlugs } from "@/lib/listings";

// Must match the serving host (www); see the canonical-host note in app/layout.tsx.
const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://www.shemoqmedi.space";

// Convex reads are POST requests, which Next treats as uncacheable; force-static
// keeps the page static (ISR) and revalidate refreshes it in the background.
export const dynamic = "force-static";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sites, creators] = await Promise.all([getPublicSlugs(), getCreators()]);
  return [
    { url: `${BASE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/creators`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/badges`, changeFrequency: "monthly", priority: 0.3 },
    ...allCollections().map((c) => ({
      url: `${BASE_URL}/collections/${c.tag}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...sites.map((s) => ({
      url: `${BASE_URL}/sites/${s.slug}`,
      lastModified: new Date(s.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...creators.map((c) => ({
      url: `${BASE_URL}/creators/${c.slug}`,
      lastModified: new Date(c.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
