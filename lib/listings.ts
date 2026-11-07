import { cache } from "react";
import { fetchQuery } from "convex/nextjs";
import { unstable_cache } from "next/cache";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { unstable_rethrow } from "next/navigation";
import {
  api,
  type CreatorSummary,
  type PublicCreator,
  type PublicListing,
} from "@/convex-helpers-api";
import { allCollections } from "@/lib/collections";

// Server-side reads for the public pages. Pages using these must export
// `dynamic = "force-static"` + `revalidate` (Convex reads are POST requests,
// which Next would otherwise treat as uncacheable).
//
// Failures: during `next build` a read degrades to an empty state so a Convex
// outage cannot fail a deploy. At runtime (first render or ISR revalidation)
// it throws, so Next keeps serving the last good page instead of caching an
// empty page or a 404 for a real listing. A genuine "not found" is a null
// result, not an error, and still returns null.

async function safe<T>(label: string, run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    unstable_rethrow(error);
    console.error(`${label} failed:`, error);
    if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) return fallback;
    throw error;
  }
}

// cache(): generateMetadata and the page share one read per render (fetchQuery
// is a POST, which Next does not dedupe).

/** Every public listing (max 200), newest first. Filter in code. */
export const getPublicListings = cache(
  (): Promise<PublicListing[]> =>
    safe("listings.listPublic", () => fetchQuery(api.listings.listPublic, {}), []),
);

export const getListing = cache((slug: string): Promise<PublicListing | null> =>
  safe("listings.getPublicBySlug", () => fetchQuery(api.listings.getPublicBySlug, { slug }), null),
);

export function getPublicSlugs() {
  return safe("listings.publicSlugs", () => fetchQuery(api.listings.publicSlugs, {}), []);
}

export const getCreator = cache(
  (slug: string): Promise<{ creator: PublicCreator; listings: PublicListing[] } | null> =>
    safe("creators.getBySlug", () => fetchQuery(api.creators.getBySlug, { slug }), null),
);

export function getCreators(): Promise<CreatorSummary[]> {
  return safe("creators.listPublic", () => fetchQuery(api.creators.listPublic, {}), []);
}

/**
 * Listings per collection tag, for the footer. The footer renders on every
 * public page, so this is cached across requests for an hour instead of adding
 * a full listings read to each page render. It throws on a Convex error (the
 * error is not cached); the caller picks the fallback.
 */
export const getCollectionCounts = unstable_cache(
  async (): Promise<Record<string, number>> => {
    const listings = await fetchQuery(api.listings.listPublic, {});
    return Object.fromEntries(
      allCollections().map((c) => [c.tag, listings.filter(c.match).length]),
    );
  },
  ["collection-counts"],
  { revalidate: 3600 },
);

/** The live URL with our referral marker, so creators see where visits come from. */
export function withRef(url: string) {
  try {
    const u = new URL(url);
    u.searchParams.set("ref", "shemoqmedi.space");
    return u.toString();
  } catch {
    return url;
  }
}

/** Latest Site of the Day and latest Best Solo Creation, for the home hero. */
export function heroPicks(listings: PublicListing[]) {
  const byAward = (award: string) =>
    listings
      .filter((l) => l.awards.includes(award as PublicListing["awards"][number]))
      .sort((a, b) => (b.awardedAt ?? 0) - (a.awardedAt ?? 0))[0] ?? null;
  const bsc = byAward("BSC");
  const sotd =
    byAward("SOTD") ??
    // No SOTD yet: the most recent other award winner, else the top-scored nominee.
    listings
      .filter((l) => l.awards.length > 0 && l.slug !== bsc?.slug)
      .sort((a, b) => (b.awardedAt ?? 0) - (a.awardedAt ?? 0))[0] ??
    listings
      .filter((l) => l.status === "in_voting" && l.finalScore !== null && l.slug !== bsc?.slug)
      .sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0))[0] ??
    null;
  return { sotd, bsc };
}
