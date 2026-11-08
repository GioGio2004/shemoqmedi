import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/listing/PageHero";
import { MediaImage as Image } from "@/components/site/MediaImage";
import { PillLink } from "@/components/site/ui";
import { JuryCard } from "@/components/jury/JuryCard";
import { panelName, safeUrl } from "@/components/jury/jurorInfo";
import { getJurorPage, getJurorSlugs } from "@/lib/listings";
import { formatDate, formatScore } from "@/lib/format";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

// A juror's public page and shareable badge. Pre-rendered at build for every
// public juror, then refreshed in the background; a newly claimed juror
// renders on first visit. Convex reads are POST requests, which Next treats as
// uncacheable; force-static keeps the page static (ISR).
export const dynamic = "force-static";
export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getJurorSlugs()).map(({ slug }) => ({ slug }));
}

function describe(name: string, title: string, panel: string, reviews: number) {
  const scored = reviews > 0 ? ` ${reviews} ${reviews === 1 ? "website" : "websites"} scored so far.` : "";
  return `${name}, ${title}, on the ${SITE_NAME} jury (${panel}): scores websites on design, usability, creativity and code.${scored}`;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getJurorPage(slug);
  if (!data) return { title: "Juror not found", robots: { index: false } };
  const { juror, reviews } = data;
  const title = `${juror.name}, ${juror.title}: ${SITE_NAME} Jury`;
  const description = juror.bio ?? describe(juror.name, juror.title, panelName(juror.category), reviews.length);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/jury/${juror.slug}` },
    // Replaces the root openGraph, so the shared fields are repeated here.
    openGraph: {
      type: "profile",
      siteName: SITE_NAME,
      locale: "en_US",
      url: `/jury/${juror.slug}`,
      title,
      description,
      images: [
        juror.imageUrl
          ? { url: juror.imageUrl, alt: juror.name }
          : { url: "/opengraph-image", width: 1200, height: 630, alt: "Shemoqmedi: the web's finest websites" },
      ],
    },
  };
}

const mono = "font-mono text-[11px] font-medium tracking-[0.08em] uppercase tabular-nums";

export default async function JurorPage({ params }: Params) {
  const { slug } = await params;
  const data = await getJurorPage(slug);
  if (!data) notFound();
  const { juror, reviews } = data;
  const panel = panelName(juror.category);
  const website = safeUrl(juror.website);
  const linkedin = safeUrl(juror.linkedinUrl);
  const sameAs = [website, linkedin].filter((l): l is string => l !== null);
  const experience = juror.experience ?? [];
  const work = juror.work ?? [];

  // The Person's @id is the one /jury uses for this member.
  const url = absoluteUrl(`/jury/${juror.slug}`);
  const personId = `${url}#person`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": url,
        url,
        name: `${juror.name}, ${juror.title}: ${SITE_NAME} Jury`,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        inLanguage: "en",
        mainEntity: { "@id": personId },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: juror.name,
        jobTitle: juror.title,
        url,
        description: juror.bio ?? undefined,
        image: juror.imageUrl ?? undefined,
        sameAs: sameAs.length > 0 ? sameAs : undefined,
        ...(juror.location ? { homeLocation: { "@type": "Place", name: juror.location } } : {}),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PageHero
        prelude={juror.isFounding ? "founding jury" : "jury"}
        title={juror.name}
        titleClassName={juror.name.length > 10 ? "text-[clamp(3rem,9vw,9rem)]" : undefined}
        lede={juror.category ? `${juror.title}. ${panel} panel.` : juror.title}
        action={
          <PillLink href="/jury" variant="outline">
            The jury
          </PillLink>
        }
      />

      <section aria-label={`${juror.name}, jury badge`} className="container-site pb-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <JuryCard juror={juror} size="lg" branded />
          <dl className="grid content-start gap-px overflow-hidden rounded-3xl border border-black/10 bg-black/10">
            {[
              ["Panel", panel],
              ["On the jury since", formatDate(juror.joinedAt)],
              ["Websites scored", String(reviews.length)],
            ].map(([term, value]) => (
              <div key={term} className="flex items-baseline justify-between gap-4 bg-white p-6">
                <dt className="eyebrow">{term}</dt>
                <dd className="text-right text-sm font-medium">{value}</dd>
              </div>
            ))}
            <div className="bg-white p-6 text-sm text-black/60">
              Jurors score each site in its voting window. The jury&apos;s average counts for 60% of the final result.{" "}
              <Link href="/how-we-score" className="text-black underline decoration-black/25 underline-offset-4 hover:decoration-black">
                How we score
              </Link>
            </div>
          </dl>
        </div>
      </section>

      {(experience.length > 0 || work.length > 0) && (
        <section aria-label={`${juror.name}, experience and work`} className="container-site pb-16">
          <div className="grid gap-6 lg:grid-cols-2">
            {experience.length > 0 && (
              <div className="rounded-3xl border border-black/10 p-6 md:p-8">
                <h2 className="text-3xl font-semibold tracking-[-0.045em]">Experience</h2>
                <ul className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10">
                  {experience.map((e, i) => (
                    <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 bg-white p-5">
                      <p className="text-sm">
                        <span className="font-semibold">{e.title}</span>
                        <span className="text-black/60">, {e.organization}</span>
                      </p>
                      {e.period && <p className={`${mono} text-black/45`}>{e.period}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {work.length > 0 && (
              <div className="rounded-3xl border border-black/10 p-6 md:p-8">
                <h2 className="text-3xl font-semibold tracking-[-0.045em]">Work</h2>
                <ul className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10">
                  {work.map((w, i) => {
                    const link = safeUrl(w.url);
                    return (
                      <li key={i} className="grid gap-1.5 bg-white p-5">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          {link ? (
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener"
                              className="text-sm font-semibold underline decoration-black/25 underline-offset-4 hover:decoration-black"
                            >
                              {w.title}
                            </a>
                          ) : (
                            <p className="text-sm font-semibold">{w.title}</p>
                          )}
                          {w.year && <p className={`${mono} text-black/45`}>{w.year}</p>}
                        </div>
                        {w.description && <p className="text-sm leading-relaxed text-black/60">{w.description}</p>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <section aria-labelledby="juror-reviews-title" className="container-site pb-24">
        <h2 id="juror-reviews-title" className="text-3xl font-semibold tracking-[-0.045em]">
          Reviews
        </h2>
        {reviews.length === 0 ? (
          <p className="mt-4 text-sm text-black/55">No reviews yet.</p>
        ) : (
          <ul className="mt-6 grid gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((r) => (
              <li key={r.listing.slug} className="grid content-start gap-4">
                <Link
                  href={`/sites/${r.listing.slug}`}
                  className="relative block aspect-video overflow-hidden rounded-3xl border border-black/8 bg-black/5"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {r.listing.coverUrl && (
                    <Image
                      src={r.listing.coverUrl}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 440px"
                      className="object-cover object-top"
                    />
                  )}
                </Link>
                <div className="flex items-baseline justify-between gap-4">
                  <Link href={`/sites/${r.listing.slug}`} className="truncate text-lg font-semibold tracking-[-0.02em] hover:underline">
                    {r.listing.title}
                  </Link>
                  <p className="font-mono text-2xl font-semibold tabular-nums" aria-label={`Score ${formatScore(r.average)} out of 10`}>
                    {formatScore(r.average)}
                  </p>
                </div>
                <p className="text-[15px] leading-relaxed whitespace-pre-line text-black/80">{r.comment}</p>
                <p className={`${mono} text-black/45`}>{formatDate(r.updatedAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
