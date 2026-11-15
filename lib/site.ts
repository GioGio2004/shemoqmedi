/**
 * The one canonical origin for metadata, canonicals, sitemap, robots and
 * JSON-LD. Vercel redirects the apex to www, so www is the host that serves
 * 200s. NEXT_PUBLIC_URL may override it (e.g. a staging domain); an empty
 * value or a trailing slash is tolerated.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_URL?.trim() || "https://www.shemoqmedi.space").replace(/\/+$/, "");

export const SITE_NAME = "Shemoqmedi";

/** Absolute URL for a site path ("/sites/x" → "https://www.shemoqmedi.space/sites/x"). */
export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Official social profiles. Shown in the footer and listed as the
 * Organization's sameAs, which tells search engines these accounts and this
 * site are the same "Shemoqmedi" (and not the monastery of the same name).
 */
export const SOCIAL_PROFILES: { label: string; href: string }[] = [
  { label: "Instagram", href: "https://www.instagram.com/shemoqmedi.voloostudio/" },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61587244665349" },
];
