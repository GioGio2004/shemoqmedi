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

const STATIC_ROUTES = [
  "", // Landing page (priority 1.0)
  "/coffee",
  "/coffee-2",
  "/coffee-3",
  "/coffee-4",
  "/auto-1",
  "/auto-shop",
  "/beauty",
  "/construction",
  "/shop",
  "/modern",
  "/acoustic-shop",
  "/regular",
  "/modern-restaurant",
  "/shoes",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Fetches all active organization slugs using Convex's official server-side
 * `fetchQuery` helper from `convex/nextjs`.
 *
 * Unlike a raw `fetch()`, `fetchQuery` is:
 *  - Fully typed via the `api` reference from convex-helpers-api.ts
 *  - Not treated as a "dynamic" fetch by Next.js (no revalidate: 0 footgun)
 *  - Compatible with ISR — the `export const revalidate` above controls caching
 *
 * The `convexUrl` option is required here because we only have the
 * NEXT_PUBLIC_ prefixed variable (there is no separate server-only CONVEX_URL).
 */
async function fetchVenueSlugs(): Promise<string[]> {
  try {
    const organizations = await fetchQuery(
      api.publicMenu.listOrganizations,
      {},
      { url: CONVEX_URL },
    );

    if (!Array.isArray(organizations)) return [];

    return organizations
      .map((org: { slug?: string }) => org.slug)
      .filter(
        (slug): slug is string => typeof slug === "string" && slug.length > 0,
      );
  } catch (err) {
    // Graceful degradation: if Convex is unreachable during build,
    // we emit only the static pages. The ISR will retry after `revalidate` seconds.
    console.warn("[sitemap] Could not fetch venue slugs from Convex:", err);
    return [];
  }
}

// ── Sitemap Export ────────────────────────────────────────────────────────────

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // 1. Static marketing / template pages ─────────────────────────────────────
  for (const route of STATIC_ROUTES) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: route === "" ? 1.0 : 0.8,
      });
    }
  }

  // 2. Dynamic venue menu pages ───────────────────────────────────────────────
  const venueSlugs = await fetchVenueSlugs();

  for (const slug of venueSlugs) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}/${slug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.9,
      });
    }
  }

  return entries;
}
