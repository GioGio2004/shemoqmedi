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
// Must match the serving host (www) — see canonical-host note in [locale]/layout.tsx.
const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://www.shemoqmedi.space";
const CONVEX_URL =
  process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://proficient-crow-922.convex.cloud";

const LOCALES = ["en", "ka", "ru"] as const;

// Core public marketing routes (path AFTER the locale prefix).
const STATIC_ROUTES = ["", "/privacy", "/terms"];

// NOTE: no per-URL `alternates` here on purpose. hreflang lives in each page's
// HTML <head> (Metadata API `alternates.languages`), which is sufficient for
// search engines. Adding them here too would emit <xhtml:link> elements, which
// makes Chrome render the sitemap as flat text instead of the XML tree.

/**
 * fetchMenuSlugs — slugs that actually own a native /menu/{slug} page.
 *
 * A menu URL belongs in the sitemap only when the site itself links to it.
 * Two sources exist and they are NOT interchangeable:
 *
 *   - publicMenu.listOrganizations → org-born venues. These have real menu
 *     data, and the landing page's partner catalogue links straight to
 *     /{locale}/menu/{slug}. THESE are the indexable menu pages.
 *   - publicVenues.listPublished   → every published `venues` row, including
 *     seeded/unclaimed ones that have no organization behind them. The city
 *     directory deliberately never links those to /menu/{slug} (see the note
 *     in components/landing/sections/CityDirectory.tsx) because there is no
 *     native menu to show — the route only renders a thin fallback shell.
 *
 * Submitting the second group is what produced Ahrefs' "orphan page" (a
 * sitemap URL with zero incoming internal links), while the org-born venues
 * the homepage *does* link went missing from the sitemap entirely. Sourcing
 * from organizations keeps the sitemap and the internal link graph identical.
 */
async function fetchMenuSlugs(): Promise<{ slug: string; updatedAt: number }[]> {
  const now = Date.now();
  try {
    const orgs = await fetchQuery(api.publicMenu.listOrganizations, {}, { url: CONVEX_URL });
    if (!Array.isArray(orgs)) return [];
    return orgs
      .filter((o) => typeof o?.slug === "string" && o.slug.length > 0)
      .map((o) => ({ slug: o.slug as string, updatedAt: now }));
  } catch (err) {
    console.warn("[sitemap] Could not fetch menu slugs from Convex:", err);
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
      });
    }
  }

  // 2. Dynamic venue menu pages (real route — matches buildMenuUrl / MENU_ROUTE_BASE)
  const publishedVenues = await fetchMenuSlugs();
  for (const { slug, updatedAt } of publishedVenues) {
    const path = `/${MENU_ROUTE_BASE}/${slug}`;
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: new Date(updatedAt),
        changeFrequency: "daily",
        priority: 0.9,
      });
    }
  }

  return entries;
}
