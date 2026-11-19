import type { PublicListing } from "@/convex-helpers-api";

/** Shown where the score would be while a site is still being judged. */
export const SEALED_SCORES_COPY = "Scores are revealed when judging closes.";

/**
 * Whether a listing's scores are still sealed. The backend returns null
 * scores and no reviews while a site is in voting (so jurors can't herd and
 * owners can't lobby); this also treats in_voting as sealed in case an older
 * backend without `scoresRevealed` is still serving.
 */
export function scoresSealed(listing: Pick<PublicListing, "status" | "scoresRevealed">) {
  return listing.scoresRevealed === false || listing.status === "in_voting";
}
