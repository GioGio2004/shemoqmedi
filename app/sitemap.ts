import { MetadataRoute } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex-helpers-api";

// ── Force static compilation ──────────────────────────────────────────────────
// fetchQuery uses a POST request under the hood. Next.js automatically assigns
// revalidate: 0 to any POST fetch, which breaks static generation.
// `force-static` overrides that heuristic and tells the compiler to treat this
// file as a static ISR route regardless of the HTTP method used internally.
export const dynamic = "force-static";
export const revalidate = 3600;

// ── Config ────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://shemoqmedi.space";
const CONVEX_URL =
  process.env.NEXT_PUBLIC_CONVEX_URL ??
  "https://proficient-crow-922.convex.cloud";

const LOCALES = ["en", "ka"];

// Core public routes — marketing and discovery pages only.
const STATIC_ROUTES = [
  "",         // Landing page (priority 1.0)
  "/venues",  // Venue directory (priority 0.9)
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * fetchPublishedVenueSlugs — fetches only venues with isPublished = true.
 *
 * Satisfies Condition 2: draft/partially-onboarded venues are NOT included
 * in the sitemap and therefore not submitted to Google for indexing.
 *
 * Uses the new publicVenues.listPublished query, not listOrganizations.
 */
async function fetchPublishedVenueSlugs(): Promise<{ slug: string; updatedAt: number }[]> {
  try {
    const venues = await fetchQuery(
      api.publicVenues.listPublished,
      {},
      { url: CONVEX_URL },
    );

    if (!Array.isArray(venues)) return [];

    return venues
      .filter(
        (v): v is { slug: string; updatedAt: number } & typeof v =>
          typeof v.slug === "string" && v.slug.length > 0,
      )
      .map((v) => ({ slug: v.slug, updatedAt: v.updatedAt }));
  } catch (err) {
    // Graceful degradation: if Convex is unreachable during build,
    // emit only static pages. ISR will retry after `revalidate` seconds.
    console.warn("[sitemap] Could not fetch published venue slugs from Convex:", err);
    return [];
  }
}

// ── Sitemap Export ────────────────────────────────────────────────────────────

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // 1. Static marketing pages ─────────────────────────────────────────────────
  for (const route of STATIC_ROUTES) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: route === "" ? 1.0 : 0.9,
      });
    }
  }

  // 2. Dynamic venue discovery pages ──────────────────────────────────────────
  // Only isPublished = true venues appear here (Condition 2).
  const publishedVenues = await fetchPublishedVenueSlugs();

  for (const { slug, updatedAt } of publishedVenues) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}/venues/${slug}`,
        lastModified: new Date(updatedAt),
        changeFrequency: "daily",
        priority: 0.9,
      });
    }
  }

  return entries;
}
