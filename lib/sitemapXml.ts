import type { MetadataRoute } from "next";

// Next writes sitemap values into the XML exactly as given, with no escaping
// (next/dist/build/webpack/loaders/metadata/resolve-route-data.js). One "&" in
// a listing title is enough to make the whole file unreadable, and Google then
// drops every URL in it. So every string in the sitemap is escaped here first.
// If a later Next version starts escaping by itself, remove this: titles would
// show "&amp;" twice over.

/** Escape text for an XML element or attribute; drops characters XML forbids. */
export function xmlEscape(value: string) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeDeep<T>(value: T): T {
  if (typeof value === "string") return xmlEscape(value) as T;
  if (Array.isArray(value)) return value.map(escapeDeep) as T;
  if (value instanceof Date) return value;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, escapeDeep(v)])) as T;
  }
  return value;
}

/** Escape every string of a sitemap: URLs, image and video fields, alternates. */
export function escapeSitemap(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  return entries.map(escapeDeep);
}
