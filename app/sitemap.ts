import { MetadataRoute } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex-helpers-api";
import { MENU_ROUTE_BASE } from "@/lib/routes";

// ── Force static compilation ──────────────────────────────────────────────────
// fetchQuery uses a POST request under the hood. Next.js automatically assigns
// revalidate: 0 to any POST fetch, which breaks static generation.
// `force-static` overrides that and treats this as a static ISR route.
export const dynamic = "force-static";
export const revalidate = 3600;

// ── Config ────────────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://shemoqmedi.space";
const CONVEX_URL =
  process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://proficient-crow-922.convex.cloud";

const LOCALES = ["en", "ka", "ru"] as const;

// Core public marketing routes (path AFTER the locale prefix).
const STATIC_ROUTES = ["", "/privacy", "/terms"];

// hreflang alternates map for a locale-less path.
function languagesFor(path: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const l of LOCALES) map[l] = `${BASE_URL}/${l}${path}`;
  map["x-default"] = `${BASE_URL}/en${path}`;
  return map;
}

/**
 * fetchPublishedVenueSlugs — only venues with isPublished = true.
 * Draft / partially-onboarded venues are never submitted to Google.
 */
async function fetchPublishedVenueSlugs(): Promise<{ slug: string; updatedAt: number }[]> {
  try {
    const venues = await fetchQuery(api.publicVenues.listPublished, {}, { url: CONVEX_URL });
    if (!Array.isArray(venues)) return [];
    return venues
      .filter(
        (v): v is { slug: string; updatedAt: number } & typeof v =>
          typeof v.slug === "string" && v.slug.length > 0,
      )
      .map((v) => ({ slug: v.slug, updatedAt: v.updatedAt }));
  } catch (err) {
    console.warn("[sitemap] Could not fetch published venue slugs from Convex:", err);
    return [];
  }
}

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
        priority: route === "" ? 1.0 : 0.4,
        alternates: { languages: languagesFor(route) },
      });
    }
  }

  // 2. Dynamic venue menu pages (real route — matches buildMenuUrl / MENU_ROUTE_BASE)
  const publishedVenues = await fetchPublishedVenueSlugs();
  for (const { slug, updatedAt } of publishedVenues) {
    const path = `${MENU_ROUTE_BASE}/${slug}`;
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: new Date(updatedAt),
        changeFrequency: "daily",
        priority: 0.9,
        alternates: { languages: languagesFor(path) },
      });
    }
  }

  return entries;
}
