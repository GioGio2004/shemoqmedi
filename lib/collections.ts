import type { PublicListing } from "@/convex-helpers-api";
import { AWARDS, CATEGORIES, CREATOR_TIERS, REGIONS, TECHNOLOGIES } from "@/lib/taxonomy";

// Programmatic SEO collections: one static page per category, technology,
// region and award at /collections/<tag>. Tags are unique across kinds.

export type CollectionKind = "category" | "technology" | "region" | "award" | "status";

export type Collection = {
  tag: string;
  kind: CollectionKind;
  name: string; // "Next.js"
  /** <title>, e.g. "Best Next.js Websites & Web Design Inspiration (2026)" */
  title: string;
  description: string;
  match: (listing: PublicListing) => boolean;
};

const year = () => new Date().getFullYear();

function build(): Collection[] {
  const out: Collection[] = [];
  for (const c of CATEGORIES) {
    out.push({
      tag: c.slug,
      kind: "category",
      name: c.name,
      title: `Best ${c.name} Websites & Web Design Inspiration (${year()})`,
      description: `Hand-reviewed ${c.name.toLowerCase()} websites, scored by an independent jury and the community.`,
      match: (l) => l.category === c.slug,
    });
  }
  for (const t of TECHNOLOGIES) {
    if (out.some((x) => x.tag === t.slug)) continue; // e.g. "ai" is already a category
    out.push({
      tag: t.slug,
      kind: "technology",
      name: t.name,
      title: `Best ${t.name} Websites & Web Design Inspiration (${year()})`,
      description: `The best websites built with ${t.name}, reviewed and scored on shemoqmedi.`,
      match: (l) => l.technologies.includes(t.name),
    });
  }
  for (const r of REGIONS) {
    out.push({
      tag: r.slug,
      kind: "region",
      name: r.slug === "georgia" ? "Georgian" : "Global",
      title:
        r.slug === "georgia"
          ? `Best Georgian Websites & Web Design from Georgia (${year()})`
          : `Best Websites from Around the World (${year()})`,
      description:
        r.slug === "georgia"
          ? "The finest websites made in Georgia, reviewed and scored on shemoqmedi."
          : "The finest websites from around the world, reviewed and scored on shemoqmedi.",
      match: (l) => l.region === r.slug,
    });
  }
  for (const a of AWARDS) {
    out.push({
      tag: a.slug.toLowerCase(),
      kind: "award",
      name: a.name,
      title: `${a.name} Winners | Web Design Awards (${year()})`,
      description:
        a.slug === "BSC"
          ? "Best Solo Creation: the finest websites built by one person, without an agency budget."
          : `Every website awarded ${a.name} on shemoqmedi.`,
      match: (l) => l.awards.includes(a.slug),
    });
  }
  out.push({
    tag: "nominees",
    kind: "status",
    name: "Nominees",
    title: `Live Nominees: Vote on This Week's Best Websites (${year()})`,
    description: "Websites in their 7-day voting window right now. Sign in and score them.",
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
