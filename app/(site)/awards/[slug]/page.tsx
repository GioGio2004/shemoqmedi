import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaImage as Image } from "@/components/site/MediaImage";
import { PageHero } from "@/components/listing/PageHero";
import { PillLink } from "@/components/site/ui";
import { getAward, getAwardSlugs, withRef } from "@/lib/listings";
import { badgeDate, badgeLabel } from "@/lib/badgeSvg";
import { collectionHref } from "@/lib/collections";
import { formatScore } from "@/lib/format";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

// One award's public page: what was won, when, with what score, and the
// badge. The embed code is only on the owner's /account/badges page.
export const dynamic = "force-static";
export const revalidate = 300;

export async function generateStaticParams() {
  return (await getAwardSlugs()).map(({ slug }) => ({ slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const award = await getAward(slug);
  if (!award) return { robots: { index: false } };
  const label = badgeLabel(award.tier, award.period, award.date);
  const title = `${award.listing.title}: ${label}`;
  const description = `${award.listing.title} by ${award.listing.creditName} won ${label} on ${SITE_NAME}${
    award.score !== null ? ` with a jury score of ${formatScore(award.score)}` : ""
  }.`;
  return {
    title,
    description,
    alternates: { canonical: `/awards/${slug}` },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url: `/awards/${slug}`,
      title,
      description,
      images: award.listing.coverUrl ? [{ url: award.listing.coverUrl, alt: `${award.listing.title} website` }] : undefined,
    },
  };
}

export default async function AwardPage({ params }: Params) {
  const { slug } = await params;
  const award = await getAward(slug);
  if (!award) notFound();
  const label = badgeLabel(award.tier, award.period, award.date);
  const url = absoluteUrl(`/awards/${slug}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": url,
    url,
    name: `${award.listing.title}: ${label}`,
    about: { "@type": "WebSite", name: award.listing.title, url: award.listing.url },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PageHero
        prelude={award.name.toLowerCase()}
        title={award.listing.title}
        titleClassName="text-[clamp(3rem,9vw,9rem)] leading-[0.88]"
        lede={`by ${award.listing.creditName}, ${badgeDate(award.tier, award.period, award.date)}.`}
        meta={award.score !== null ? `Jury score ${formatScore(award.score)} / 10` : undefined}
        action={<PillLink href={`/sites/${award.listing.slug}`}>See the site&apos;s scores</PillLink>}
      />

      <section aria-label="The award" className="container-site grid gap-10 pb-24 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
        <div className="relative aspect-video overflow-hidden rounded-3xl border border-black/10 bg-white">
          {award.listing.coverUrl && (
            <Image
              src={award.listing.coverUrl}
              alt={`${award.listing.title} website screenshot`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-top"
            />
          )}
        </div>
        <div className="grid gap-6 rounded-3xl border border-black/10 p-6 md:p-8">
          {/* eslint-disable-next-line @next/next/no-img-element -- the award's own SVG badge */}
          <img src={`/badge/${slug}?theme=light`} alt={label} width={220} height={64} />
          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-black/10 pb-3">
              <dt className="text-black/55">Award</dt>
              <dd>
                <Link href={collectionHref(award.tier.toLowerCase())} className="hover:underline">
                  {award.name}
                </Link>
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-black/10 pb-3">
              <dt className="text-black/55">Date</dt>
              <dd>{badgeDate(award.tier, award.period, award.date)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-black/10 pb-3">
              <dt className="text-black/55">Jury score</dt>
              <dd className="font-mono tabular-nums">{formatScore(award.score)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-black/55">Made by</dt>
              <dd>
                {award.listing.creatorSlug ? (
                  <Link href={`/creators/${award.listing.creatorSlug}`} className="hover:underline">
                    {award.listing.creditName}
                  </Link>
                ) : (
                  award.listing.creditName
                )}
              </dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-3">
            <PillLink href={withRef(award.listing.url)} external variant="outline">
              Visit the site
            </PillLink>
          </div>
          <p className="text-xs leading-relaxed text-black/55">
            Is this your site? Its badge is on your account once you have{" "}
            <Link href={`/claim/${award.listing.slug}`} className="underline underline-offset-4">
              claimed it
            </Link>
            . See <Link href="/how-we-score" className="underline underline-offset-4">how we score</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
