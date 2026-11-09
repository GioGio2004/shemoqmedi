import { AWARDS, type AwardSlug } from "@/lib/taxonomy";
import { CROW_PNG, CROW_RATIO } from "@/lib/badgeCrow";

// Award badges, drawn per award: the tier's crow (silver HM, black SOTD, red
// SOTM, gold SOTY), the award name and its date, in a light or dark pill.
// Served at /badge/<award slug>; a badge exists only for a real award.

export const BADGE_W = 220;
export const BADGE_H = 64;
export type BadgeTheme = "light" | "dark";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The date line: "12 Nov 2026" for a day, "Nov 2026" for a month, "2026" for a year. */
export function badgeDate(tier: AwardSlug, period: string, date: string) {
  if (tier === "SOTY" && /^\d{4}$/.test(period)) return period;
  if (tier === "SOTM" && /^\d{4}-\d{2}$/.test(period)) {
    const [y, m] = period.split("-").map(Number);
    return `${MONTHS[m - 1]} ${y}`;
  }
  const [y, m, d] = date.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "Site of the Day · 12 Nov 2026": the badge's alt text and title. */
export function badgeLabel(tier: AwardSlug, period: string, date: string) {
  const name = AWARDS.find((a) => a.slug === tier)?.name ?? tier;
  return `${name} · ${badgeDate(tier, period, date)}`;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function badgeSvg({
  tier,
  period,
  date,
  theme,
}: {
  tier: AwardSlug;
  period: string;
  date: string;
  theme: BadgeTheme;
}) {
  const award = AWARDS.find((a) => a.slug === tier) ?? AWARDS[2];
  const dark = theme === "dark";
  const bg = dark ? "#000000" : "#FFFFFF";
  const fg = dark ? "#FFFFFF" : "#000000";
  const muted = dark ? "#B4B4B4" : "#5C5C5C";
  const stroke = dark ? "#3A3A3A" : "#000000";
  // On the dark badge a black crow would vanish: it sits on a white disc.
  const disc = dark ? "#FFFFFF" : "#F3F3F3";
  const crowW = 34;
  const crowH = Math.round(crowW * CROW_RATIO);
  const label = badgeLabel(tier, period, date);
  const font = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${BADGE_W}" height="${BADGE_H}" viewBox="0 0 ${BADGE_W} ${BADGE_H}" role="img" aria-label="${esc(`${label} on Shemoqmedi`)}">
  <title>${esc(`${label} on Shemoqmedi`)}</title>
  <defs>
    <filter id="tint" color-interpolation-filters="sRGB">
      <feFlood flood-color="${award.color}"/>
      <feComposite in2="SourceAlpha" operator="in"/>
    </filter>
  </defs>
  <rect x="0.5" y="0.5" width="${BADGE_W - 1}" height="${BADGE_H - 1}" rx="${(BADGE_H - 1) / 2}" fill="${bg}" stroke="${stroke}"/>
  <circle cx="32" cy="32" r="23" fill="${disc}" stroke="${award.color}" stroke-width="1.5"/>
  <image href="${CROW_PNG}" x="${32 - crowW / 2}" y="${32 - crowH / 2 - 1}" width="${crowW}" height="${crowH}" filter="url(#tint)"/>
  <g font-family="${font}" fill="${fg}">
    <text x="66" y="22" font-size="8" font-weight="600" letter-spacing="2.2" fill="${muted}">SHEMOQMEDI</text>
    <text x="66" y="38" font-size="12.5" font-weight="700" letter-spacing="0.4">${esc(award.name.toUpperCase())}</text>
    <text x="66" y="52" font-size="9.5" font-weight="500" letter-spacing="0.6" fill="${muted}">${esc(badgeDate(tier, period, date).toUpperCase())}</text>
  </g>
</svg>`;
}

/** Embed code: the badge image, linking to the award page (a followed link, no nofollow). */
export function embedCode(origin: string, slug: string, label: string, theme: BadgeTheme) {
  return (
    `<a href="${origin}/awards/${slug}" target="_blank" rel="noopener" title="${esc(label)} on Shemoqmedi">` +
    `<img src="${origin}/badge/${slug}?theme=${theme}" alt="${esc(label)} — Shemoqmedi" width="${BADGE_W}" height="${BADGE_H}"></a>`
  );
}
