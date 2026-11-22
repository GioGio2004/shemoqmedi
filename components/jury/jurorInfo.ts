import { SITE_NAME } from "@/lib/site";
import { JURY_CATEGORIES, type JuryCategory } from "@/lib/taxonomy";

/** Only http(s) links are rendered; anything else (javascript:, data:) is dropped. */
export function safeUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/**
 * A LinkedIn profile link in one canonical form, "https://www.linkedin.com/in/<id>/",
 * however it was typed (no www, country subdomain, query, missing slash), so
 * every page and the structured data (sameAs) name the same URL. Other hosts:
 * as safeUrl.
 */
export function linkedinUrl(raw: string | null | undefined): string | null {
  const url = safeUrl(raw);
  if (!url) return null;
  const u = new URL(url);
  if (!/(^|\.)linkedin\.com$/i.test(u.hostname)) return url;
  const path = u.pathname.replace(/\/+$/, "");
  return `https://www.linkedin.com${path}/`;
}

/** "Design & UI"; jurors without a panel are just "Jury". */
export function panelName(category: JuryCategory | null) {
  return JURY_CATEGORIES.find((c) => c.slug === category)?.name ?? "Jury";
}

/** Google shows roughly 60–65 characters of a title (it cuts by width). */
const TITLE_MAX = 65;

/**
 * "Name, Role: Shemoqmedi Jury" when it fits in TITLE_MAX; else the role's
 * first part ("Full Stack Developer & CMO at Ostati.AI | CTO at Stafika" →
 * "Full Stack Developer & CMO at Ostati.AI"); else just "Name: Shemoqmedi Jury".
 */
export function jurorTitle(name: string, role: string) {
  const end = `: ${SITE_NAME} Jury`;
  const short = role.split(/\s+[|·•–—]\s+|,\s+/)[0]?.trim() ?? "";
  for (const r of [role.trim(), short]) {
    const t = `${name}, ${r}${end}`;
    if (r && t.length <= TITLE_MAX) return t;
  }
  return `${name}${end}`;
}

