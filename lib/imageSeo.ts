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

/**
 * The listing's walkthrough video, described for search engines: VideoObject
 * data on the listing page and a <video:video> entry in the sitemap. Google
 * needs a title, a description, a thumbnail and the upload date; contentUrl is
 * the file itself (Cloudflare R2). Null when the listing has no video or no
 * cover to use as the thumbnail.
 */
export function listingVideo(
  listing: Pick<PublicListing, "videoUrl" | "coverUrl" | "title" | "creditName" | "tagline" | "publishedAt">,
) {
  if (!listing.videoUrl || !listing.coverUrl) return null;
  const tagline = listing.tagline.trim();
  return {
    name: `${listing.title} website walkthrough`,
    description: `A screen recording of the ${listing.title} website by ${listing.creditName}${
      tagline ? `: ${tagline}` : "."
    }`,
    thumbnailUrl: listing.coverUrl,
    contentUrl: listing.videoUrl,
    uploadDate: new Date(listing.publishedAt).toISOString(),
  };
}
