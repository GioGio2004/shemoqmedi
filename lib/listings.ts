import { fetchQuery } from "convex/nextjs";
import { unstable_rethrow } from "next/navigation";
import { api, type PublicListing } from "@/convex-helpers-api";

// Server-side reads for the public pages. Failures (e.g. the backend
// functions are not deployed yet) degrade to an empty state instead of
// breaking the build or the page.

export async function getPublishedListings(category?: string): Promise<PublicListing[]> {
  try {
    return await fetchQuery(api.listings.listPublished, category ? { category } : {});
  } catch (error) {
    unstable_rethrow(error);
    console.error("listPublished failed:", error);
    return [];
  }
}

export async function getListing(slug: string): Promise<PublicListing | null> {
  try {
    return await fetchQuery(api.listings.getPublishedBySlug, { slug });
  } catch (error) {
    unstable_rethrow(error);
    console.error("getPublishedBySlug failed:", error);
    return null;
  }
}

export async function getCategoryCounts() {
  try {
    return await fetchQuery(api.listings.categoryCounts, {});
  } catch (error) {
    unstable_rethrow(error);
    console.error("categoryCounts failed:", error);
    return { total: 0, byCategory: {} as Record<string, number> };
  }
}

export async function getPublishedSlugs() {
  try {
    return await fetchQuery(api.listings.publishedSlugs, {});
  } catch (error) {
    unstable_rethrow(error);
    console.error("publishedSlugs failed:", error);
    return [];
  }
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
