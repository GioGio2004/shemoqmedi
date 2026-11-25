// Listing taxonomy, copied from shemoqmedi-admin/convex/lib/taxonomy.ts (the
// backend validates against that file). Keep the two lists identical.

export const CATEGORIES = [
  // Studios & portfolios
  { slug: "portfolio", name: "Portfolio" },
  { slug: "agency", name: "Agency" },
  { slug: "photography", name: "Photography" },
  { slug: "illustration", name: "Illustration & Art" },
  { slug: "film", name: "Film & Video" },
  { slug: "3d-motion", name: "3D & Motion" },
  { slug: "architecture", name: "Architecture" },
  { slug: "interior", name: "Interior Design" },
  // Product & tech
  { slug: "saas", name: "SaaS" },
  { slug: "ai", name: "AI" },
  { slug: "fintech", name: "Fintech" },
  { slug: "web3", name: "Crypto & Web3" },
  { slug: "dev-tools", name: "Developer Tools" },
  { slug: "apps", name: "Mobile Apps" },
  { slug: "hardware", name: "Hardware & Devices" },
  { slug: "corporate", name: "Business & Corporate" },
  // Brands & shopping
  { slug: "e-commerce", name: "E-Commerce" },
  { slug: "fashion", name: "Fashion" },
  { slug: "beauty", name: "Beauty & Cosmetics" },
  { slug: "food-drink", name: "Food & Drink" },
  { slug: "home-living", name: "Furniture & Home" },
  { slug: "automotive", name: "Automotive" },
  // Places & experiences
  { slug: "hospitality", name: "Hospitality" },
  { slug: "real-estate", name: "Real Estate" },
  { slug: "travel", name: "Travel" },
  { slug: "health", name: "Health & Wellness" },
  { slug: "sports", name: "Sports & Fitness" },
  { slug: "events", name: "Events & Festivals" },
  // Culture & media
  { slug: "editorial", name: "Editorial" },
  { slug: "culture", name: "Culture" },
  { slug: "music", name: "Music & Sound" },
  { slug: "games", name: "Games & Entertainment" },
  { slug: "education", name: "Education" },
  { slug: "institutions", name: "Museums & Institutions" },
  { slug: "nonprofit", name: "Non-profit & Causes" },
  { slug: "experimental", name: "Experimental" },
  { slug: "other", name: "Other" },
] as const;

/**
 * CATEGORIES in groups, for the site's menu and pickers. Every category
 * except "other" is in exactly one group, in CATEGORIES order.
 */
export const CATEGORY_GROUPS = [
  {
    name: "Studios & portfolios",
    slugs: ["portfolio", "agency", "photography", "illustration", "film", "3d-motion", "architecture", "interior"],
  },
  {
    name: "Product & tech",
    slugs: ["saas", "ai", "fintech", "web3", "dev-tools", "apps", "hardware", "corporate"],
  },
  { name: "Brands & shopping", slugs: ["e-commerce", "fashion", "beauty", "food-drink", "home-living", "automotive"] },
  { name: "Places & experiences", slugs: ["hospitality", "real-estate", "travel", "health", "sports", "events"] },
  {
    name: "Culture & media",
    slugs: ["editorial", "culture", "music", "games", "education", "institutions", "nonprofit", "experimental"],
  },
] as const;

/** `slug` is used in /collections/<slug> URLs. */
export const TECHNOLOGIES = [
  { slug: "nextjs", name: "Next.js" },
  { slug: "react", name: "React" },
  { slug: "typescript", name: "TypeScript" },
  { slug: "vue", name: "Vue" },
  { slug: "nuxt", name: "Nuxt" },
  { slug: "svelte", name: "Svelte" },
  { slug: "astro", name: "Astro" },
  { slug: "webflow", name: "Webflow" },
  { slug: "framer", name: "Framer" },
  { slug: "wordpress", name: "WordPress" },
  { slug: "shopify", name: "Shopify" },
  { slug: "tailwind", name: "Tailwind" },
  { slug: "gsap", name: "GSAP" },
  { slug: "motion", name: "Motion" },
  { slug: "threejs", name: "Three.js" },
  { slug: "webgl", name: "WebGL" },
  { slug: "lenis", name: "Lenis" },
  { slug: "convex", name: "Convex" },
  { slug: "ai", name: "AI" },
  { slug: "mcp", name: "MCP" },
  { slug: "custom-cms", name: "Custom CMS" },
  { slug: "custom-audio", name: "Custom Audio" },
] as const;

export const REGIONS = [
  { slug: "georgia", name: "Georgia" },
  { slug: "global", name: "Global" },
] as const;

export const CREATOR_TIERS = [
  { slug: "solo", name: "Solo developer", badge: "Solo dev" },
  { slug: "agency", name: "Agency / team", badge: "Agency" },
] as const;

/**
 * Highest first (mirrors the backend). Tiers: Site of the Year > Site of the
 * Month > Site of the Day > Honorable Mention; Best Solo Creation is a side
 * award for solo makers; First 100 is the honorary badge given to the first
 * hundred sites. Badge colours live in lib/badgeSvg.ts.
 */
export const AWARDS = [
  { slug: "SOTY", name: "Site of the Year", short: "SOTY" },
  { slug: "SOTM", name: "Site of the Month", short: "SOTM" },
  { slug: "SOTD", name: "Site of the Day", short: "SOTD" },
  { slug: "BSC", name: "Best Solo Creation", short: "BSC" },
  { slug: "HM", name: "Honorable Mention", short: "HM" },
  { slug: "F100", name: "First 100", short: "F100" },
] as const;

/** Jury pillars and their weight in the final score (mirrors the backend). */
export const PILLARS = [
  { key: "design", name: "Design", weight: 0.4 },
  { key: "usability", name: "Usability", weight: 0.3 },
  { key: "creativity", name: "Creativity", weight: 0.2 },
  { key: "content", name: "Content", weight: 0.1 },
] as const;

type PillarScores = Record<(typeof PILLARS)[number]["key"], number>;

/**
 * Pillar scores from the server, in the current shape. A backend from before
 * the Content pillar sends `code` instead of `content` (seen when the site
 * deploys before the backend does); a missing pillar reads as 0 rather than
 * crashing the page.
 */
export function toPillars(raw: Partial<PillarScores> & { code?: number }): PillarScores {
  return {
    design: raw.design ?? 0,
    usability: raw.usability ?? 0,
    creativity: raw.creativity ?? 0,
    content: raw.content ?? raw.code ?? 0,
  };
}

/** A vote's weighted score: Design 40% + Usability 30% + Creativity 20% + Content 10%. */
export function weightedScore(scores: Record<(typeof PILLARS)[number]["key"], number>) {
  return PILLARS.reduce((sum, p) => sum + scores[p.key] * p.weight, 0);
}

/**
 * The award rules as the backend serves them (awards.publicRules, built from
 * shemoqmedi-admin/convex/lib/scoring.ts and lib/config.ts). Pages read the
 * live object through getAwardRules() in lib/listings.ts.
 */
export type AwardRules = {
  pillars: { key: string; name: string; weight: number }[];
  scoreMin: number;
  scoreMax: number;
  decimals: number;
  /** Always false: community votes are shown but never decide an award. */
  communityCounts: boolean;
  minVotes: number;
  honorableMentionMin: number;
  sotdMin: number;
  bscMin: number;
  /** "HH:MM" in timeZone. */
  announceTime: string;
  timeZone: string;
  monthlyRoundDays: number;
  yearlyRoundDays: number;
  /** "MM-DD". */
  yearlyAnnounceDate: string;
  resubmitMonths: number;
};

/**
 * Fallback only, for when the backend can't be reached: the defaults of the
 * backend's award settings. An admin can change the live values at any time,
 * so pages should state numbers from getAwardRules(), not from here.
 */
export const AWARD_RULES: AwardRules = {
  pillars: PILLARS.map((p) => ({ key: p.key, name: p.name, weight: p.weight })),
  scoreMin: 1,
  scoreMax: 10,
  decimals: 2,
  communityCounts: false,
  minVotes: 3,
  honorableMentionMin: 6.5,
  sotdMin: 7.0,
  bscMin: 8.2,
  announceTime: "00:00",
  timeZone: "Asia/Tbilisi",
  monthlyRoundDays: 5,
  yearlyRoundDays: 10,
  yearlyAnnounceDate: "01-20",
  resubmitMonths: 12,
};

/** Jury panels (mirrors the backend's JURY_CATEGORIES). */
export const JURY_CATEGORIES = [
  { slug: "design", name: "Design & UI" },
  { slug: "product", name: "Product & UX Research" },
  { slug: "brand", name: "Brand & Creative Direction" },
  { slug: "motion", name: "Motion, 3D & Creative Development" },
  { slug: "engineering", name: "Engineering & Performance" },
  { slug: "accessibility", name: "Accessibility & Inclusive Design" },
  { slug: "growth", name: "Marketing & Growth" },
  { slug: "venture", name: "Venture & Startups" },
  { slug: "academic", name: "Academic, SEO & Content" },
] as const;
export type JuryCategory = (typeof JURY_CATEGORIES)[number]["slug"];

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];
export type TechnologyName = (typeof TECHNOLOGIES)[number]["name"];
export type RegionSlug = (typeof REGIONS)[number]["slug"];
export type CreatorTier = (typeof CREATOR_TIERS)[number]["slug"];
export type AwardSlug = (typeof AWARDS)[number]["slug"];
export type PillarKey = (typeof PILLARS)[number]["key"];

export function isCategory(value: string): value is CategorySlug {
  return CATEGORIES.some((c) => c.slug === value);
}

/** A listing's category slugs, primary first (falls back to the single `category`). */
export function listingCategories(listing: { category: string; categories?: string[] }) {
  return listing.categories?.length ? listing.categories : [listing.category];
}

export function isTechnology(value: string): value is TechnologyName {
  return TECHNOLOGIES.some((t) => t.name === value);
}

export const VOTING_DAYS = 7;
export const DAY_MS = 24 * 60 * 60 * 1000;

export const LIMITS = {
  title: 80,
  tagline: 160,
  creditName: 80,
  url: 500,
  technologies: 6,
  /** Categories per listing (the first is the primary one). */
  categories: 3,
  /** Entries in a juror's Experience, Education and Work sections (mirrors the backend). */
  juryExperience: 15,
  juryEducation: 5,
  juryWork: 8,
  /** A position's short description on a juror's profile. */
  juryExperienceDescription: 600,
  /** Earliest year a position or school may start in. */
  juryEarliestYear: 1950,
  /** Jury evaluation comment, optional (mirrors the backend). */
  juryComment: 1000,
  juryTitle: 80,
  juryBio: 1500,
  reviewNote: 500,
  claimMessage: 1000,
  /** Extra screenshots after the cover (so 5 images in all). */
  gallery: 4,
  /** Max screenshot size in bytes. */
  imageBytes: 5 * 1024 * 1024,
  /** Max preview-video size in bytes, as stored (after compression in the browser). */
  videoBytes: 15 * 1024 * 1024,
  /** Largest video file people can pick (it is compressed before upload). */
  videoInputBytes: 500 * 1024 * 1024,
  /** Max preview-video length in seconds. */
  videoSeconds: 60,
  /** Max listings one user can have waiting for review at once. */
  pendingPerUser: 5,
  /** Max URLs per admin import batch. */
  importBatch: 10,
} as const;
