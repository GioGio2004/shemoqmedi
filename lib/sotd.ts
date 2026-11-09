import type { PublicListing } from "@/convex-helpers-api";

// Site of the Day: one site a day (Tbilisi calendar days, UTC+4 all year),
// never the same one twice. The backend announces each day's winner from the
// queue at the announce time; `sotdDay` is the day a site won.

export const SOTD_PATH = "/site-of-the-day";

/** Today in Tbilisi (UTC+4, no daylight saving), "2026-11-09". */
export function utcToday(now = Date.now()) {
  return new Date(now + 4 * 3_600_000).toISOString().slice(0, 10);
}

/** "2026-11-09" -> "9 November 2026". */
export function formatDay(day: string, month: "long" | "short" = "long") {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month, year: "numeric", timeZone: "UTC" }).format(
    new Date(`${day}T00:00:00Z`),
  );
}

/** "2026-11" -> "November 2026". */
export function formatMonth(month: string) {
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${month}-01T00:00:00Z`),
  );
}

/** The listing has had its Site of the Day (the award is public). */
export function isSotdWinner(listing: PublicListing) {
  return listing.awards.includes("SOTD");
}

/** The day a public Site of the Day won, or null. */
export function wonOn(listing: PublicListing) {
  return isSotdWinner(listing) ? (listing.sotdDay ?? null) : null;
}

/** The day a site is scheduled to be Site of the Day (later than today), or null. */
export function scheduledFor(listing: PublicListing, today = utcToday()) {
  const day = listing.sotdDay ?? null;
  return day && !isSotdWinner(listing) && day > today ? day : null;
}

/** Every Site of the Day, newest day first. Winners without a day (older data) go last. */
export function sotdWinners(listings: PublicListing[]) {
  return listings
    .filter(isSotdWinner)
    .sort((a, b) => (b.sotdDay ?? "").localeCompare(a.sotdDay ?? "") || (b.awardedAt ?? 0) - (a.awardedAt ?? 0));
}

const dayNumber = (day: string) => Math.floor(Date.parse(`${day}T00:00:00Z`) / 86_400_000);

/**
 * What the home page shows as today's site. Today's Site of the Day if there
 * is one. Otherwise a featured site that changes every day: a site that has
 * never been Site of the Day (past winners are not shown a second time),
 * taken in turn from the best scored, so no site is shown two days running.
 */
export function todaysPick(
  listings: PublicListing[],
  { today = utcToday(), exclude = [] as string[] } = {},
): { listing: PublicListing; kind: "sotd" | "featured" } | null {
  const winner = listings.find((l) => wonOn(l) === today);
  if (winner) return { listing: winner, kind: "sotd" };

  const pool = listings
    .filter((l) => l.coverUrl && !l.sotdDay && !isSotdWinner(l) && !exclude.includes(l.slug))
    .sort(
      (a, b) =>
        (b.finalScore ?? -1) - (a.finalScore ?? -1) || b.publishedAt - a.publishedAt || a.slug.localeCompare(b.slug),
    );
  if (pool.length === 0) return null;
  return { listing: pool[dayNumber(today) % pool.length], kind: "featured" };
}
