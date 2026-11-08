// Which badge a listing has earned, and the /badges link that opens the
// generator with it chosen. Badge links on creators' own sites are the main
// way the site earns followed backlinks, so every public listing gets one:
// its highest award, or "Official Nominee" if it won none.

export type BadgeSlug = "sotd" | "bsc" | "hm" | "nominee";

export function earnedBadge(listing: { awards: readonly string[] }): BadgeSlug {
  if (listing.awards.includes("SOTD")) return "sotd";
  if (listing.awards.includes("BSC")) return "bsc";
  if (listing.awards.includes("HM")) return "hm";
  return "nominee";
}

export function badgeHref(slug: string, badge: BadgeSlug) {
  return `/badges?site=${encodeURIComponent(slug)}&badge=${badge}`;
}
