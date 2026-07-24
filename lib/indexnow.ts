/**
 * lib/indexnow.ts — IndexNow key + submission notes
 * ─────────────────────────────────────────────────────────────────────────────
 * IndexNow lets us ping Bing/Yandex/Seznam (and any participating engine)
 * the moment a URL is created or updated, instead of waiting for a recrawl.
 * Google does not consume IndexNow — Google indexing goes through the
 * sitemap + Search Console flow (see app/sitemap.ts).
 *
 * Key verification: engines fetch https://www.shemoqmedi.space/{KEY}.txt and
 * expect the file body to be exactly the key. That file lives at
 * public/48bccbfb2e5eaf57aae36ae033c82616.txt — if you ever rotate the key,
 * rotate BOTH this constant and the public/*.txt filename+content together.
 *
 * Submitting a URL (one-liner, run anywhere server-side after a content change):
 *
 *   await fetch(`https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${INDEXNOW_KEY}`);
 *
 * Example — after publishing/updating a venue:
 *   await fetch(`https://api.indexnow.org/indexnow?url=${encodeURIComponent("https://www.shemoqmedi.space/en/menu/" + slug)}&key=${INDEXNOW_KEY}`);
 *
 * Batch submission (up to 10,000 URLs) is a POST to https://api.indexnow.org/indexnow
 * with JSON { host, key, urlList } — see https://www.indexnow.org/documentation.
 *
 * No automation is wired yet — this file is the single source of truth for the
 * key so future hooks (venue publish, bag creation, sitemap refresh) import it.
 */

export const INDEXNOW_KEY = "48bccbfb2e5eaf57aae36ae033c82616";

/** Absolute URL of the verification key file served from /public. */
export const INDEXNOW_KEY_LOCATION = `${
  process.env.NEXT_PUBLIC_URL ?? "https://www.shemoqmedi.space"
}/${INDEXNOW_KEY}.txt`;
