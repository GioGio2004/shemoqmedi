import Link from "next/link";
import { PageHero } from "@/components/listing/PageHero";
import { PillLink } from "@/components/site/ui";

/** One titled block of an information page (About, Jury, How we score). */
export type InfoSection = { id: string; heading: string; body: React.ReactNode };

/** Pages linked under "About" in the footer and at the end of each info page. */
export const INFO_PAGES = [
  { href: "/about", label: "About" },
  { href: "/how-we-score", label: "How we score" },
  { href: "/jury", label: "The jury" },
] as const;

/**
 * Plain reading page in the site's style: Kencho hero, then sections in a
 * two-column grid (heading left, text right on desktop).
 */
export function InfoPage({
  prelude,
  title,
  lede,
  sections,
  current,
}: {
  prelude: string;
  title: string;
  lede: string;
  sections: InfoSection[];
  /** This page's path, left out of the "More" links at the end. */
  current: string;
}) {
  return (
    <>
      <PageHero
        prelude={prelude}
        title={title}
        lede={lede}
        action={<PillLink href="/submit">Submit your site</PillLink>}
      />
      <div className="container-site pb-8">
        {sections.map((s) => (
          <section
            key={s.id}
            id={s.id}
            aria-labelledby={`${s.id}-title`}
            className="grid gap-4 border-t border-black/10 py-12 md:grid-cols-12 md:gap-10 md:py-16"
          >
            <h2
              id={`${s.id}-title`}
              className="text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.05] font-semibold tracking-[-0.045em] md:col-span-4"
            >
              {s.heading}
            </h2>
            <div className="grid max-w-2xl gap-4 text-[15px] leading-relaxed text-black/70 md:col-span-8 [&_a]:text-black [&_a]:underline [&_a]:decoration-black/25 [&_a]:underline-offset-4 [&_a:hover]:decoration-black [&_strong]:font-semibold [&_strong]:text-black">
              {s.body}
            </div>
          </section>
        ))}
        <nav aria-label="More about Shemoqmedi" className="border-t border-black/10 py-12">
          <p className="eyebrow mb-4">More</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {INFO_PAGES.filter((p) => p.href !== current).map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="underline decoration-black/25 underline-offset-4 hover:decoration-black">
                  {p.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/badges" className="underline decoration-black/25 underline-offset-4 hover:decoration-black">
                Badges
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}

/** openGraph for a static page (replaces the root one, so the shared fields repeat). */
export function infoOpenGraph(path: string, title: string, description: string) {
  return {
    type: "website" as const,
    siteName: "Shemoqmedi",
    locale: "en_US",
    url: path,
    title,
    description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Shemoqmedi: the web's finest websites" }],
  };
}
