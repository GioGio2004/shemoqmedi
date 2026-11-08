/** Adds ?ref=shemoqmedi.space so site owners see our referrals (client-safe). */
export function withRefClient(url: string) {
  try {
    const u = new URL(url);
    u.searchParams.set("ref", "shemoqmedi.space");
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * rel for links out to a listed site or its creator. Unclaimed listings stay
 * nofollow until the owner claims them; claiming turns the link dofollow.
 */
export function outboundRel(listing: { isDoFollow?: boolean; isClaimed: boolean }) {
  return (listing.isDoFollow ?? listing.isClaimed) ? "noopener" : "nofollow noopener";
}
