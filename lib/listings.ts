import { cache } from "react";
import { fetchQuery } from "convex/nextjs";
import { unstable_cache } from "next/cache";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { unstable_rethrow } from "next/navigation";
import {
  api,
  type CreatorSummary,
  type JurorPage,
  type JurorPublic,
  type JuryReview,
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

/**
 * Jury reviews for a listing page. Unlike the reads above this never throws:
 * the reviews are one section of the page, so a failed read renders the page
 * without them rather than failing the whole listing.
 */
export const getJuryReviews = cache(async (slug: string): Promise<JuryReview[]> => {
  try {
    return await fetchQuery(api.jury.reviewsForListing, { slug });
  } catch (error) {
    unstable_rethrow(error);
    console.error("jury.reviewsForListing failed:", error);
    return [];
  }
});

export function getJurors(): Promise<(JurorPublic & { evaluations: number })[]> {
  return safe("jury.listPublic", () => fetchQuery(api.jury.listPublic, {}), []);
}

/** Public jurors (claimed and on the jury), for static params and the sitemap. */
export function getJurorSlugs(): Promise<{ slug: string; updatedAt: number }[]> {
  return safe("jury.publicSlugs", () => fetchQuery(api.jury.publicSlugs, {}), []);
}

/** /jury/<slug>; null for unclaimed or removed jurors. */
export const getJurorPage = cache((slug: string): Promise<JurorPage | null> =>
  safe("jury.getBySlug", () => fetchQuery(api.jury.getBySlug, { slug }), null),
);

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

/** The latest Best Solo Creation, for the home hero (today's site comes from lib/sotd). */
export function latestBsc(listings: PublicListing[]) {
  return (
    listings.filter((l) => l.awards.includes("BSC")).sort((a, b) => (b.awardedAt ?? 0) - (a.awardedAt ?? 0))[0] ??
    null
  );
}
