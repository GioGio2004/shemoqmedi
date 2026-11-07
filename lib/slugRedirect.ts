import { cache } from "react";
import { fetchQuery } from "convex/nextjs";
import { unstable_rethrow } from "next/navigation";
import { api } from "@/convex-helpers-api";

/**
 * Where a renamed listing lives now: the current slug of the public listing
 * that used to be at `slug` (the admin keeps previous slugs), or null. The
 * listing page answers an old /sites/<slug> with a 308 to the new one, so
 * indexed URLs, backlinks and embedded badges keep working after a rename.
 * Errors (Convex down, or a backend without the query yet) count as "no
 * redirect", which falls through to the 404.
 */
export const resolveListingSlug = cache(async (slug: string): Promise<string | null> => {
  try {
    const current = await fetchQuery(api.listings.resolveSlug, { slug });
    return typeof current === "string" && current !== "" && current !== slug ? current : null;
  } catch (error) {
    unstable_rethrow(error);
    console.error("listings.resolveSlug failed:", error);
    return null;
  }
});
