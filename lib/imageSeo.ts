import type { PublicListing } from "@/convex-helpers-api";

// Screenshots are the main content of the site, so Google Images gets told
// about every one: in the image sitemap (app/sitemap.ts) and as ImageObject
// data on the listing page. Both use the original file URL (ImageKit, or an
// older Convex file), the stable address of the image; the page itself shows
// resized copies through /_next/image.

/** Every screenshot of a listing, cover first. */
export function listingImageUrls(listing: Pick<PublicListing, "coverUrl" | "galleryUrls">) {
  return [listing.coverUrl, ...listing.galleryUrls].filter((src): src is string => !!src);
}

/** Caption for screenshot `i` of `count` ("Floema website, screenshot 2 of 5"). */
export function screenshotCaption(title: string, i: number, count: number) {
  return `${title} website, ${i === 0 ? "main screenshot" : `screenshot ${i + 1} of ${count}`}`;
}
