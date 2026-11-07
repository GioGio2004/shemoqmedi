import { cache } from "react";
import { fetchQuery } from "convex/nextjs";
import { unstable_rethrow } from "next/navigation";
import {
  api,
  type CreatorSummary,
  type PublicCreator,
  type PublicListing,
} from "@/convex-helpers-api";

// Server-side reads for the public pages. Pages using these must export
// `dynamic = "force-static"` + `revalidate` (Convex reads are POST requests,
// which Next would otherwise treat as uncacheable). Failures degrade to an
// empty state instead of breaking the build or the page.

async function safe<T>(label: string, run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    unstable_rethrow(error);
    console.error(`${label} failed:`, error);
    return fallback;
  }
}

/** Every public listing (max 200), newest first. Filter in code. */
export function getPublicListings(): Promise<PublicListing[]> {
  return safe("listings.listPublic", () => fetchQuery(api.listings.listPublic, {}), []);
}

// cache(): generateMetadata and the page share one read per request.
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
