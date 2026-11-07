import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/listing/PageHero";
import { TierBadge } from "@/components/listing/Badges";
import { PillLink } from "@/components/site/ui";
import { regionName } from "@/lib/collections";
import { getCreators } from "@/lib/listings";
import { SITE_NAME } from "@/lib/site";

// Convex reads are POST requests, which Next treats as uncacheable; force-static
// keeps the page static (ISR) and revalidate refreshes it in the background.
export const dynamic = "force-static";
export const revalidate = 60;

const title = "Creators: Web Developers & Design Agencies";
const description =
  "The solo developers and agencies behind the best websites on Shemoqmedi, with their nominations and awards.";

// openGraph replaces the root one, so it repeats the shared fields and image.
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/creators" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/creators",
    title,
    description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Shemoqmedi: the web's finest websites" }],
  },
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export default async function CreatorsPage() {
  const creators = await getCreators();

  return (
    <>
      <PageHero
        prelude="the people behind the work"
        title="Creators"
        meta={plural(creators.length, "creator")}
      />

      <section aria-label="All creators" className="container-site pb-24">
        {creators.length === 0 ? (
          <div className="flex flex-col items-start gap-6 rounded-3xl border border-black/10 p-8 md:p-12">
            <p className="max-w-lg text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.045em]">
              No creators listed yet.
            </p>
            <PillLink href="/submit">Submit a site</PillLink>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {creators.map((creator) => (
              <li
                key={creator.slug}
                className="relative flex flex-col gap-4 rounded-3xl border border-black/10 p-6 transition-colors hover:border-black md:flex-row md:items-center md:justify-between md:px-8"
              >
                <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-5">
                  {/* The ::after overlay makes the whole row the click target. */}
                  <Link
                    href={`/creators/${creator.slug}`}
                    className="text-[clamp(1.5rem,2.5vw,2rem)] leading-none font-semibold tracking-[-0.045em] after:absolute after:inset-0 after:rounded-3xl"
                  >
                    {creator.name}
                  </Link>
                  <TierBadge tier={creator.tier} />
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <span className="text-sm text-black/60">
                    {creator.location ?? regionName(creator.region)}
                  </span>
                  <span className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase tabular-nums">
                    {plural(creator.nominations, "nomination")} · {plural(creator.awards, "award")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
