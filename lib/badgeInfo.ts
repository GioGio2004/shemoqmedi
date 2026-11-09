import { AWARDS, type AwardSlug } from "@/lib/taxonomy";

// Badge facts that don't need the artwork: shapes, themes, labels, URLs and
// embed code. Safe to import in client components (the drawing itself is in
// lib/badgeSvg.ts, server only, with the artwork).

/** Seal: the round stamp (512 × 512). Tag: the horizontal strip (112 high, width by its text). */
export type BadgeShape = "seal" | "tag";
export type BadgeTheme = "light" | "dark";

export const SEAL_SIZE = 512;
export const TAG_HEIGHT = 112;

/** Each award's own look, as designed: the theme used when none is asked for. */
export const SIGNATURE_THEME: Record<AwardSlug, BadgeTheme> = {
  SOTY: "dark",
  SOTM: "dark",
  SOTD: "light",
  BSC: "light",
  HM: "light",
  F100: "dark",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * The line under the award's name: "12 Nov 2026" for a day, "Nov 2026" for
 * a month, "2026" for a year, "No. 017" for a First 100 member.
 */
export function badgeDate(tier: AwardSlug, period: string, date: string) {
  if (tier === "F100") return `No. ${period}`;
  if (tier === "SOTY" && /^\d{4}$/.test(period)) return period;
  if (tier === "SOTM" && /^\d{4}-\d{2}$/.test(period)) {
    const [y, m] = period.split("-").map(Number);
    return `${MONTHS[m - 1]} ${y}`;
  }
  const [y, m, d] = date.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function awardName(tier: AwardSlug) {
  return AWARDS.find((a) => a.slug === tier)?.name ?? tier;
}

/** "Site of the Day · 12 Nov 2026", "First 100 · Honorary No. 017": alt text and titles. */
export function badgeLabel(tier: AwardSlug, period: string, date: string) {
  return tier === "F100"
    ? `First 100 · Honorary ${badgeDate(tier, period, date)}`
    : `${awardName(tier)} · ${badgeDate(tier, period, date)}`;
}

export type BadgeOptions = {
  shape: BadgeShape;
  /** Omitted: the award's signature look. */
  theme?: BadgeTheme;
  /** The crow hops when the image loads, then nods now and then. */
  motion?: boolean;
};

/** /badge/<award slug> with its options (defaults left out of the URL). */
export function badgePath(slug: string, { shape, theme, motion }: BadgeOptions) {
  const query = new URLSearchParams();
  if (shape === "seal") query.set("shape", "seal");
  if (theme) query.set("theme", theme);
  if (motion) query.set("motion", "1");
  const q = query.toString();
  return `/badge/${slug}${q ? `?${q}` : ""}`;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Embed code: the badge image linking to the award's page (a plain followed
 * link). `width`/`height` are the size on the page; `corner` pins the badge
 * to the bottom-right of the window instead of sitting in the page.
 */
export function embedCode({
  origin,
  slug,
  label,
  width,
  height,
  corner,
  ...options
}: BadgeOptions & { origin: string; slug: string; label: string; width: number; height: number; corner?: boolean }) {
  const src = `${origin}${badgePath(slug, options)}`.replace(/&/g, "&amp;");
  const link =
    `<a href="${origin}/awards/${slug}" target="_blank" rel="noopener" title="${esc(label)} on Shemoqmedi">` +
    `<img src="${src}" alt="${esc(label)} — Shemoqmedi" width="${width}" height="${height}" loading="lazy" style="display:block"></a>`;
  return corner ? `<div style="position:fixed;right:16px;bottom:16px;z-index:9999">${link}</div>` : link;
}
