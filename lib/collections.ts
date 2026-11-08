import type { PublicListing } from "@/convex-helpers-api";
import {
  AWARDS,
  CATEGORIES,
  CREATOR_TIERS,
  REGIONS,
  TECHNOLOGIES,
  VOTING_DAYS,
  listingCategories,
} from "@/lib/taxonomy";

// Programmatic SEO collections: one static page per category, technology,
// region and award at /collections/<tag>. Tags are unique across kinds.

export type CollectionKind = "category" | "technology" | "region" | "award" | "status";

/**
 * Below this many listings a collection is thin: its page is noindex,follow
 * and it is left out of the sitemap. It turns indexable on its own once it
 * fills up. Never set it below 2.
 */
export const MIN_INDEXABLE = 2;

export type Collection = {
  tag: string;
  kind: CollectionKind;
  name: string; // "Next.js", used for nav labels and breadcrumbs
  /** The page's H1, e.g. "Next.js websites". */
  heading: string;
  /** One visible sentence under the H1. */
  intro: string;
  /** <title>, e.g. "Best Next.js Websites & Web Design Inspiration (2026)" */
  title: string;
  /** Meta description when there are too few listings to name any. */
  description: string;
  /** Meta description that names real listings; `list` is "A, B and more". */
  summarize: ((count: number, list: string) => string) | null;
  match: (listing: PublicListing) => boolean;
};

const year = () => new Date().getFullYear();

const SCORED_BY = "Scored by an independent jury and the community.";
const PILLARS_LINE = "design, usability, creativity and code";

/** "Best Portfolio Websites & …", without a second "&" for "Food & Drink". */
function bestTitle(name: string) {
  return name.includes("&")
    ? `Best ${name} Websites: Web Design Inspiration (${year()})`
    : `Best ${name} Websites & Web Design Inspiration (${year()})`;
}

/** Mid-sentence form: "portfolio", "e-commerce", but "AI" and "SaaS". */
const CATEGORY_PHRASE: Record<string, string> = { ai: "AI", saas: "SaaS" };
const categoryPhrase = (slug: string, name: string) => CATEGORY_PHRASE[slug] ?? name.toLowerCase();

/** "built with …": "a custom CMS" reads better than "Custom CMS". */
const TECH_PHRASE: Record<string, string> = {
  "custom-cms": "a custom CMS",
  "custom-audio": "custom audio",
};

function build(): Collection[] {
  const out: Collection[] = [];
  for (const c of CATEGORIES) {
    const phrase = categoryPhrase(c.slug, c.name);
    out.push({
      tag: c.slug,
      kind: "category",
      name: c.name,
      heading: `${c.name} websites`,
      intro: `Hand-picked ${phrase} websites, scored on ${PILLARS_LINE}.`,
      title: bestTitle(c.name),
      description: `The best ${phrase} websites for web design inspiration, hand-reviewed and scored by an independent jury and the community.`,
      summarize: (n, list) => `${n} hand-picked ${phrase} websites: ${list}. ${SCORED_BY}`,
      match: (l) => listingCategories(l).includes(c.slug),
    });
  }
  for (const t of TECHNOLOGIES) {
    const existing = out.find((x) => x.tag === t.slug);
    if (existing) {
      // "ai" is both a category and a technology. One collection holds both,
      // so a listing's "AI" technology tag links to a page that contains it.
      const prev = existing.match;
      existing.match = (l) => prev(l) || l.technologies.includes(t.name);
      existing.intro = `AI products and websites built with AI, scored on ${PILLARS_LINE}.`;
      existing.description =
        "AI products and AI-built websites, hand-reviewed and scored by an independent jury and the community.";
      existing.summarize = (n, list) => `${n} AI products and AI-built websites: ${list}. ${SCORED_BY}`;
      continue;
    }
    const phrase = TECH_PHRASE[t.slug] ?? t.name;
    out.push({
      tag: t.slug,
      kind: "technology",
      name: t.name,
      heading: `${t.name} websites`,
      intro: `Websites built with ${phrase}, each scored on ${PILLARS_LINE}.`,
      title: bestTitle(t.name),
      description: `The best websites built with ${phrase}: hand-reviewed, then scored on ${PILLARS_LINE} by a jury and the community.`,
      summarize: (n, list) =>
        `${n} websites built with ${phrase}: ${list}. Each one scored on ${PILLARS_LINE}.`,
      match: (l) => l.technologies.includes(t.name),
    });
  }
  for (const r of REGIONS) {
    const georgia = r.slug === "georgia";
    const where = georgia ? "made in Georgia" : "from around the world";
    out.push({
      tag: r.slug,
      kind: "region",
      name: r.name,
      heading: georgia ? "Websites from Georgia" : "Websites worldwide",
      intro: `Websites ${where}, scored by an independent jury and the community.`,
      title: georgia
        ? `Best Websites from Georgia (Tbilisi): Georgian Web Design (${year()})`
        : `Best Websites from Around the World (${year()})`,
      description: georgia
        ? "The best Georgian web design: websites made in Georgia, hand-reviewed and scored by an independent jury and the community."
        : "The best websites from around the world, hand-reviewed and scored by an independent jury and the community.",
      summarize: (n, list) => `${n} websites ${where}: ${list}. ${SCORED_BY}`,
      match: (l) => l.region === r.slug,
    });
  }
  const AWARD_INTRO: Record<(typeof AWARDS)[number]["slug"], string> = {
    SOTD: `The highest-scoring websites after ${VOTING_DAYS} days of jury and community voting.`,
    BSC: "The finest websites built by one person, without an agency budget.",
    HM: `Websites that came close to Site of the Day after ${VOTING_DAYS} days of voting.`,
  };
  for (const a of AWARDS) {
    out.push({
      tag: a.slug.toLowerCase(),
      kind: "award",
      name: a.name,
      heading: `${a.name} winners`,
      intro: AWARD_INTRO[a.slug],
      title: `${a.name} Winners | Web Design Awards (${year()})`,
      description:
        a.slug === "BSC"
          ? "Best Solo Creation: the finest websites built by one person, without an agency budget."
          : `Every ${a.name} winner on Shemoqmedi, with jury and community scores for ${PILLARS_LINE}.`,
      summarize: (n, list) =>
        `${n} ${a.name} ${n === 1 ? "winner" : "winners"}: ${list}. With jury and community scores for ${PILLARS_LINE}.`,
      match: (l) => l.awards.includes(a.slug),
    });
  }
  out.push({
    tag: "nominees",
    kind: "status",
    name: "Nominees",
    heading: "This week's nominees",
    intro: `Websites in their ${VOTING_DAYS}-day voting window right now. Sign in and score them.`,
    title: `Live Nominees: Vote on This Week's Best Websites (${year()})`,
    description: `Websites in their ${VOTING_DAYS}-day voting window right now. Sign in and score them.`,
    summarize: null, // changes every week; the fixed line stays accurate
    match: (l) => l.status === "in_voting",
  });
  return out;
}

export function allCollections(): Collection[] {
  return build();
}

export function getCollection(tag: string): Collection | null {
  return build().find((c) => c.tag === tag) ?? null;
}

/**
 * Meta description for a collection page. Once it is indexable it names its
 * best-scored listings, so each snippet is specific and current; otherwise
 * (or if that would pass 160 characters) it is the fixed description.
 */
export function collectionDescription(collection: Collection, hits: PublicListing[]): string {
  if (!collection.summarize || hits.length < MIN_INDEXABLE) return collection.description;
  const best = [...hits].sort((a, b) => (b.finalScore ?? -1) - (a.finalScore ?? -1));
  // Distinct names only: two listings can share a title.
  const titles = [...new Map(best.map((l) => [l.title.toLowerCase(), l.title])).values()];
  for (const k of [2, 1]) {
    const names = titles.slice(0, k);
    const list = hits.length > names.length ? `${names.join(", ")} and more` : names.join(" and ");
    const text = collection.summarize(hits.length, list);
    if (text.length <= 160) return text;
  }
  return collection.description;
}

// ── Name helpers ─────────────────────────────────────────────────────────────

export function categoryName(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

export function technologySlug(name: string) {
  return TECHNOLOGIES.find((t) => t.name === name)?.slug ?? null;
}

export function regionName(slug: string) {
  return REGIONS.find((r) => r.slug === slug)?.name ?? slug;
}

export function tierBadge(slug: string) {
  return CREATOR_TIERS.find((t) => t.slug === slug)?.badge ?? slug;
}

export function awardName(slug: string) {
  return AWARDS.find((a) => a.slug === slug)?.name ?? slug;
}
