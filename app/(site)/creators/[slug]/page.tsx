import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/listing/PageHero";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { TierBadge } from "@/components/listing/Badges";
import { PillLink } from "@/components/site/ui";
import { regionName } from "@/lib/collections";
import { hostOf } from "@/lib/format";
import { getCreator } from "@/lib/listings";

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://www.shemoqmedi.space";

// Rendered on first visit, then cached and refreshed at most once a minute.
// Convex reads are POST requests, which Next treats as uncacheable; force-static
// keeps the page static (ISR) and revalidate refreshes it in the background.
export const dynamic = "force-static";
export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCreator(slug);
  if (!data) return { title: "Creator not found", robots: { index: false } };
  const { creator } = data;
  const title = `${creator.name}: websites and awards`;
  const description =
    creator.bio ??
    `Websites by ${creator.name}, ${creator.tier === "solo" ? "solo developer" : "agency"}, reviewed and scored on shemoqmedi.`;
  return {
    title,
    description,
    alternates: { canonical: `/creators/${creator.slug}` },
    openGraph: { type: "profile", title, description, url: `/creators/${creator.slug}` },
  };
}

/** Only http(s) links are rendered; anything else (javascript:, data:) is dropped. */
function safeWebsite(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

const mono = "font-mono text-[11px] font-medium tracking-[0.08em] uppercase tabular-nums";

export default async function CreatorPage({ params }: Params) {
  const { slug } = await params;
  const data = await getCreator(slug);
  if (!data) notFound();
  const { creator, listings } = data;
  const website = safeWebsite(creator.website);

  const url = `${BASE_URL}/creators/${creator.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": creator.tier === "solo" ? "Person" : "Organization",
    "@id": url,
    name: creator.name,
    url: website ?? url,
    mainEntityOfPage: url,
    description: creator.bio ?? undefined,
    sameAs: website ? [website] : undefined,
  };

  const counters = [
    ["SOTD", creator.awards.SOTD],
    ["BSC", creator.awards.BSC],
    ["HM", creator.awards.HM],
    ["Nominations", creator.nominations],
  ] as const;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PageHero
        prelude={creator.tier === "solo" ? "solo developer" : "agency"}
        title={creator.name}
        titleClassName={creator.name.length > 10 ? "text-[clamp(3rem,9vw,9rem)]" : undefined}
        lede={creator.bio ?? undefined}
        action={
          creator.isClaimed === false ? (
            <PillLink href={`/claim/${creator.slug}?type=creator`} variant="outline">
              Claim this profile
            </PillLink>
          ) : undefined
        }
      />

      <section aria-label="Creator facts" className="container-site pb-12">
        <dl className="flex flex-col items-start gap-4 border-y border-black/10 py-6 md:flex-row md:flex-wrap md:items-center md:gap-x-10">
          <div>
            <dt className="sr-only">Type</dt>
            <dd>
              <TierBadge tier={creator.tier} />
            </dd>
          </div>
          <div>
            <dt className="sr-only">Location</dt>
            <dd className="text-sm">{creator.location ?? regionName(creator.region)}</dd>
          </div>
          {website && (
            <div>
              <dt className="sr-only">Website</dt>
              <dd>
                <a
                  href={website}
                  target="_blank"
                  rel="noopener"
                  className="text-sm underline decoration-black/20 underline-offset-4 hover:decoration-black"
                >
                  {hostOf(website)}
                </a>
              </dd>
            </div>
          )}
          <div className="md:ml-auto">
            <dt className="sr-only">Record</dt>
            <dd className={mono}>
              {counters.map(([label, n], i) => (
                <span key={label}>
                  {i > 0 && <span aria-hidden="true"> · </span>}
                  {label} {n}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-label={`Websites by ${creator.name}`} className="container-site pb-24">
        <ListingGrid listings={listings} emptyTitle="No public websites yet." />
      </section>
    </>
  );
}
