import { getPublicListings } from "@/lib/listings";
import { TECHNOLOGIES, listingCategories } from "@/lib/taxonomy";

// Data for the header's mega menu (components/site/MegaMenu.tsx), fetched
// only when someone opens, hovers or focuses the menu, so pages never carry
// it. Static and refreshed every 5 minutes like the pages themselves.
export const dynamic = "force-static";
export const revalidate = 300;

export type MenuSite = {
  slug: string;
  title: string;
  credit: string;
  cover: string | null;
  categories: string[];
  technologies: string[];
  creator: { slug: string; name: string } | null;
};

export type MenuData = {
  /** Up to 3 sites with a cover for the menu's image cards: featured first, then award winners, then newest. */
  spotlight: MenuSite[];
  /** Live sites per collection tag (category slugs and technology slugs). */
  counts: Record<string, number>;
  /** Every live site, newest first, for the search box. */
  sites: MenuSite[];
};

export async function GET() {
  const listings = await getPublicListings();
  const sites: MenuSite[] = listings.map((l) => ({
    slug: l.slug,
    title: l.title,
    credit: l.creditName,
    cover: l.coverUrl,
    categories: listingCategories(l),
    technologies: l.technologies,
    creator: l.creator,
  }));

  const counts: Record<string, number> = {};
  for (const l of listings) {
    for (const c of listingCategories(l)) counts[c] = (counts[c] ?? 0) + 1;
    for (const t of TECHNOLOGIES) if (l.technologies.includes(t.name)) counts[t.slug] = (counts[t.slug] ?? 0) + 1;
  }

  const rank = (l: (typeof listings)[number]) =>
    typeof l.featuredRank === "number" ? l.featuredRank : l.awards.length > 0 ? 100 : 1000;
  const spotlight = [...listings]
    .filter((l) => l.coverUrl)
    .sort((a, b) => rank(a) - rank(b) || (b.awardedAt ?? 0) - (a.awardedAt ?? 0) || b.publishedAt - a.publishedAt)
    .slice(0, 3)
    .map((l) => sites.find((s) => s.slug === l.slug)!);

  return Response.json({ spotlight, counts, sites } satisfies MenuData);
}
