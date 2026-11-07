// SAMPLE CONTENT for the landing page while the product is being built.
// Every project, studio and score below is fictional. Replace with Convex
// queries once submissions and jury scoring exist.

export type Criterion = "design" | "craft" | "originality" | "content";

/** Jury weights (percent). Craft covers speed, accessibility and build quality. */
export const CRITERIA_WEIGHTS: Record<Criterion, number> = {
  design: 35,
  craft: 30,
  originality: 20,
  content: 15,
};

export type Scores = Record<Criterion, number>;

export type Project = {
  slug: string;
  title: string;
  studio: string;
  country: string;
  tags: string[];
  scores: Scores;
  /** Beige tone of the placeholder tile (index into TILE_TONES). */
  tone: number;
};

/** Placeholder tile backgrounds: beige-whites only. */
export const TILE_TONES = ["#f5f2eb", "#ede7da", "#f8f6f1", "#e9e2d3"] as const;

export function overallScore(scores: Scores): number {
  const total = (Object.keys(CRITERIA_WEIGHTS) as Criterion[]).reduce(
    (sum, c) => sum + scores[c] * CRITERIA_WEIGHTS[c],
    0,
  );
  return Math.round(total) / 100;
}

export const FEATURED: Project = {
  slug: "kvevri-archive",
  title: "Kvevri Archive",
  studio: "Studio Narikala",
  country: "Georgia",
  tags: ["Editorial", "Culture", "Typography"],
  scores: { design: 8.7, craft: 8.9, originality: 8.4, content: 8.2 },
  tone: 1,
};

export const SHORTLIST: Project[] = [
  {
    slug: "halden-type",
    title: "Halden Type",
    studio: "Nord Office",
    country: "Norway",
    tags: ["Typography", "Portfolio"],
    scores: { design: 8.3, craft: 8.1, originality: 7.9, content: 7.6 },
    tone: 0,
  },
  {
    slug: "maison-ocre",
    title: "Maison Ocre",
    studio: "Atelier Lune",
    country: "France",
    tags: ["E-commerce", "Fashion"],
    scores: { design: 8.0, craft: 7.7, originality: 7.8, content: 7.9 },
    tone: 2,
  },
  {
    slug: "svaneti-trails",
    title: "Svaneti Trails",
    studio: "Ushba Digital",
    country: "Georgia",
    tags: ["Travel", "Maps"],
    scores: { design: 7.9, craft: 8.4, originality: 7.5, content: 8.1 },
    tone: 3,
  },
  {
    slug: "paper-weather",
    title: "Paper Weather",
    studio: "Fold & Co.",
    country: "Japan",
    tags: ["Minimal", "Product"],
    scores: { design: 8.2, craft: 8.6, originality: 8.0, content: 7.2 },
    tone: 1,
  },
  {
    slug: "basalt-records",
    title: "Basalt Records",
    studio: "Studio Hraun",
    country: "Iceland",
    tags: ["Music", "Motion"],
    scores: { design: 7.8, craft: 7.6, originality: 8.5, content: 7.7 },
    tone: 0,
  },
  {
    slug: "linen-house",
    title: "Linen House",
    studio: "Okra Studio",
    country: "Portugal",
    tags: ["Architecture", "Editorial"],
    scores: { design: 8.1, craft: 7.9, originality: 7.4, content: 8.0 },
    tone: 2,
  },
];

export const CATEGORIES = [
  "Portfolio",
  "E-commerce",
  "Editorial",
  "Typography",
  "Architecture",
  "Fashion",
  "Music",
  "Motion",
  "Minimal",
  "Culture",
  "Product",
  "Travel",
] as const;

export type Creator = {
  name: string;
  city: string;
  awards: number;
  followers: string;
};

export const CREATORS: Creator[] = [
  { name: "Studio Narikala", city: "Tbilisi", awards: 14, followers: "3.2k" },
  { name: "Nord Office", city: "Oslo", awards: 11, followers: "2.8k" },
  { name: "Fold & Co.", city: "Kyoto", awards: 9, followers: "2.1k" },
  { name: "Atelier Lune", city: "Lyon", awards: 7, followers: "1.6k" },
];
