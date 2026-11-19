import type { OwnListing } from "@/convex-helpers-api";

/** The remove action a row in "Your sites" offers, with honest copy. */
export type RemovalAction = {
  kind: "delete" | "archive" | "restore";
  label: string;
  /** Asked before acting. */
  confirm: string;
};

/**
 * What the owner (or submitter) can do with a listing, from the backend's
 * own answer (myListings.removal / canRestore):
 *   delete   never public, no awards: gone for good with its screenshots
 *   archive  it has been public or won something: hidden, everything kept, restorable
 *   restore  withdrawn earlier: back as it was
 * null: nothing to offer (a submission they don't own once it is public).
 */
export function removalAction(
  listing: Pick<OwnListing, "title" | "status" | "awards" | "removal" | "canRestore">,
): RemovalAction | null {
  if (listing.canRestore) {
    return {
      kind: "restore",
      label: "Restore",
      confirm: `Put "${listing.title}" back on the site as it was?`,
    };
  }
  if (listing.removal === "delete") {
    return {
      kind: "delete",
      label: listing.status === "pending" ? "Withdraw and delete" : "Delete",
      confirm: `Delete "${listing.title}"? It and its screenshots are deleted for good. This can't be undone.`,
    };
  }
  if (listing.removal === "archive") {
    const keeps = listing.awards.length > 0 ? "its awards, scores and votes" : "its scores and votes";
    return {
      kind: "archive",
      label: "Archive",
      confirm: `Archive "${listing.title}"? Its page comes off the site and any badges you embedded stop showing, but ${keeps} are kept and you can restore it any time. A site that has been public or won an award can't be deleted.`,
    };
  }
  return null;
}
