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
