/**
 * Paths of the old Voloo site (tap menus, menu templates, localized pages)
 * that are gone for good. proxy.ts answers them with 410 Gone, which search
 * engines drop from their index faster than a 404. Old URLs that have a live
 * page are redirected in next.config.ts instead, and those redirects run
 * before proxy.ts, so they never reach this list.
 */

// Top-level Voloo pages and the menu templates.
// Keep in sync with the gone entries of proxy.ts's matcher (Next needs those
// as literals, so they cannot be built from this list).
const GONE_TOP_LEVEL = new Set([
  "menu",
  "menu-examples",
  "venues",
  "volooaimenu",
  "experimenr",
  "admin",
  "acoustic-shop",
  "auto-1",
  "auto-shop",
  "modern",
  "shoes",
  "coffee",
  "coffee-2",
  "coffee-3",
  "coffee-4",
  "dark-menu",
  "light-menu",
  "modern-restaurant",
  "regular",
  "beauty",
  "construction",
  "shop",
]);

const LOCALES = new Set(["en", "ka", "ru"]);

/** True when the path belongs to the retired Voloo site. */
export function isGonePath(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return false;
  const [first] = parts;
  // /en/... and /ru/... (anything left after next.config's redirects), and
  // /ka/... but never /ka itself: that is the live Georgian page.
  if (LOCALES.has(first)) return first === "ka" ? parts.length > 1 : true;
  return GONE_TOP_LEVEL.has(first);
}

export const GONE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Page removed | Shemoqmedi</title>
<style>body{margin:0;min-height:100dvh;display:grid;place-items:center;font:500 16px/1.4 ui-sans-serif,system-ui,sans-serif;background:#fff;color:#000}main{padding:24px;text-align:center}h1{font-size:clamp(4rem,16vw,12rem);line-height:.86;letter-spacing:-.065em;margin:0 0 24px}a{color:#000}</style>
</head>
<body><main><h1>410</h1><p>This page was removed for good.</p><p><a href="/">All websites</a></p></main></body>
</html>`;
