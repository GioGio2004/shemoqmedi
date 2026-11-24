import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { PublicCreator, PublicListing } from "@/convex-helpers-api";
import Link from "next/link";
import { JurorPhoto } from "@/components/jury/JurorPhoto";
import { badgeDate, badgePath } from "@/lib/badgeInfo";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { TierBadge } from "@/components/listing/Badges";
import { PillLink } from "@/components/site/ui";
import { regionName } from "@/lib/collections";
import { hostOf } from "@/lib/format";
import { isImageKit } from "@/lib/imageLoader";
import { getCreator, getCreators } from "@/lib/listings";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

// Pre-rendered at build for every known creator, then refreshed at most once
// a minute; a new creator renders on first visit. Convex reads are POST
// requests, which Next treats as uncacheable; force-static keeps the page
// static (ISR) and revalidate refreshes it in the background.
export const dynamic = "force-static";
export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCreators()).map(({ slug }) => ({ slug }));
}

/** "A", "A and B", "A, B and 3 more" (a repeated title is named once). */
function nameWorks(titles: string[]) {
  const unique = [...new Set(titles)];
  if (unique.length <= 2) return unique.join(" and ");
  return `${unique.slice(0, 2).join(", ")} and ${unique.length - 2} more`;
}

/** Snippet for a creator without a bio: who they are and what they made. */
function fallbackDescription(creator: PublicCreator, listings: PublicListing[]) {
  const who = `${creator.name}, ${creator.tier === "solo" ? "solo developer" : "design agency"}${
    creator.location ? ` in ${creator.location}` : ""
  }`;
  if (listings.length === 0) return `${who}. Websites, jury scores and awards on ${SITE_NAME}.`;
  return `Websites by ${who}: ${nameWorks(listings.map((l) => l.title))}. Scored by an independent jury on ${SITE_NAME}.`;
}

/**
 * Share image from a listing screenshot. ImageKit crops it to a 1200x630 JPG
 * from the top (JPG for the crawlers that skip WebP); an older Convex file
 * is used as it is, with no size declared since it is unknown.
 */
function coverOgImage(src: string, alt: string) {
  if (!isImageKit(src)) return { url: src, alt };
  const u = new URL(src);
  u.searchParams.set("tr", "w-1200,h-630,fo-top,f-jpg,q-80");
  return { url: u.toString(), width: 1200, height: 630, alt };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCreator(slug);
  if (!data) return { title: "Creator not found", robots: { index: false } };
  const { creator, listings } = data;
  const title = `${creator.name}: websites and awards`;
  const description = creator.bio ?? fallbackDescription(creator, listings);
  const cover = listings.find((l) => l.coverUrl);
  return {
    title,
    description,
    alternates: { canonical: `/creators/${creator.slug}` },
    // Replaces the root openGraph, so the shared fields are repeated here.
    openGraph: {
      type: "profile",
      siteName: SITE_NAME,
      locale: "en_US",
      url: `/creators/${creator.slug}`,
      title,
      description,
      images: [
        cover
          ? coverOgImage(cover.coverUrl!, `${cover.title} website by ${creator.name}`)
          : { url: "/opengraph-image", width: 1200, height: 630, alt: "Shemoqmedi: the web's finest websites" },
      ],
    },
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

/** Readable name for a profile link: the network, or the bare host. */
const NETWORKS: [RegExp, string][] = [
  [/(^|\.)dribbble\.com$/, "Dribbble"],
  [/(^|\.)behance\.net$/, "Behance"],
  [/(^|\.)linkedin\.com$/, "LinkedIn"],
  [/(^|\.)(x|twitter)\.com$/, "X"],
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)github\.com$/, "GitHub"],
  [/(^|\.)awwwards\.com$/, "Awwwards"],
  [/(^|\.)youtube\.com$/, "YouTube"],
  [/(^|\.)vimeo\.com$/, "Vimeo"],
  [/(^|\.)facebook\.com$/, "Facebook"],
  [/(^|\.)threads\.(net|com)$/, "Threads"],
];
function linkLabel(href: string) {
  const host = new URL(href).hostname.replace(/^www\./, "");
  return NETWORKS.find(([re]) => re.test(host))?.[1] ?? host;
}

const mono = "font-mono text-[11px] font-medium tracking-[0.08em] uppercase tabular-nums";

export default async function CreatorPage({ params }: Params) {
  const { slug } = await params;
  const data = await getCreator(slug);
  if (!data) notFound();
  const { creator, listings } = data;
  const awards = data.awards ?? [];
  const website = safeWebsite(creator.website);
  // Same rule as listing pages: followed once the creator or one of their listings is claimed.
  const rel = creator.isClaimed || listings.some((l) => l.isDoFollow ?? l.isClaimed) ? "noopener" : "nofollow noopener";
  const links = (creator.links ?? []).map(safeWebsite).filter((l): l is string => l !== null && l !== website);
  // Website + profiles: tells Google these accounts are the same person or studio.
  const sameAs = [...(website ? [website] : []), ...links];

  // ProfilePage about one Person (solo) or Organization (agency). The
  // creator's @id is the one listing pages use for their creator, so both
  // describe one entity; each work's @id is the listing page's CreativeWork.
  const url = absoluteUrl(`/creators/${creator.slug}`);
  const creatorId = `${url}#creator`;
  const solo = creator.tier === "solo";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": url,
        url,
        name: `${creator.name}: websites and awards`,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: { "@id": creatorId },
      },
      {
        "@type": solo ? "Person" : "Organization",
        "@id": creatorId,
        name: creator.name,
        url: website ?? url,
        description: creator.bio ?? undefined,
        image: creator.photoUrl ?? undefined,
        email: creator.email ?? undefined,
        sameAs: sameAs.length > 0 ? sameAs : undefined,
        ...(creator.location
          ? { [solo ? "homeLocation" : "location"]: { "@type": "Place", name: creator.location } }
          : {}),
      },
      ...listings.map((listing) => {
        const page = absoluteUrl(`/sites/${listing.slug}`);
        return {
          "@type": "CreativeWork",
          "@id": `${page}#work`,
          name: listing.title,
          url: listing.url,
          mainEntityOfPage: { "@id": page },
          image: listing.coverUrl ?? undefined,
          creator: { "@id": creatorId },
        };
      }),
    ],
  };

  const counters = [
    ["SOTY", creator.awards.SOTY ?? 0],
    ["SOTM", creator.awards.SOTM ?? 0],
    ["SOTD", creator.awards.SOTD],
    ["BSC", creator.awards.BSC],
    ["HM", creator.awards.HM],
    ["First 100", creator.awards.F100 ?? 0],
    ["Sites", creator.nominations],
  ] as const;
  const bio = (creator.bio ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const email = creator.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(creator.email) ? creator.email : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="container-site grid gap-10 pt-32 pb-12 md:grid-cols-12 md:gap-10 md:pt-40 md:pb-16">
        <div className="grid content-start gap-8 md:col-span-8">
          <div>
            <p className="text-[clamp(1.25rem,2vw,1.75rem)] leading-tight tracking-[-0.03em]">
              {solo ? "solo developer" : "agency"}
            </p>
            {/* mt in em: room above the tight line for accents (Ü, Á, Ş) so they
                never touch the label, at every size the name scales to. Names of
                9+ letters take the smaller size: at the large one a 10-letter word
                ran under the portrait beside it. overflow-wrap is a last resort
                for a very long single word. */}
            <h1
              className={
                creator.name.length > 8
                  ? "mt-[0.12em] text-[clamp(3rem,8vw,8rem)] leading-[0.9] font-semibold tracking-[-0.055em] uppercase [overflow-wrap:anywhere]"
                  : "mt-[0.14em] text-[clamp(3.5rem,10vw,10rem)] leading-[0.88] font-semibold tracking-[-0.055em] uppercase [overflow-wrap:anywhere]"
              }
            >
              {creator.name}
            </h1>
          </div>
          {bio.length > 0 && (
            <div className="grid max-w-2xl gap-4 text-[15px] leading-relaxed text-black/70">
              {bio.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {email && <PillLink href={`mailto:${email}`}>Get in touch</PillLink>}
            {website && (
              <PillLink href={website} external rel={rel} variant={email ? "outline" : "solid"}>
                Visit website
              </PillLink>
            )}
            {creator.isClaimed === false && (
              <PillLink href={`/claim/${creator.slug}?type=creator`} variant="outline">
                Claim this profile
              </PillLink>
            )}
          </div>
        </div>
        {/* Phones: a small portrait above the name. Wider: a large one beside it. */}
        <div className="order-first md:order-none md:col-span-4">
          <JurorPhoto
            url={creator.photoUrl ?? null}
            name={creator.name}
            alt={creator.photoUrl ? creator.name : ""}
            fallbackKey={creator.slug}
            fallbackAvatar={creator.avatar}
            fallbackInitials={false}
            width={420}
            height={525}
            mono={false}
            priority
            className="aspect-[4/5] w-28 rounded-2xl border border-black/8 md:ml-auto md:w-full md:max-w-[420px] md:rounded-3xl"
          />
        </div>
      </header>

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
                  rel={rel}
                  className="text-sm underline decoration-black/20 underline-offset-4 hover:decoration-black"
                >
                  {hostOf(website)}
                </a>
              </dd>
            </div>
          )}
          {email && (
            <div>
              <dt className="sr-only">Email</dt>
              <dd>
                <a
                  href={`mailto:${email}`}
                  className="text-sm underline decoration-black/20 underline-offset-4 hover:decoration-black"
                >
                  {email}
                </a>
              </dd>
            </div>
          )}
          {links.length > 0 && (
            <div>
              <dt className="sr-only">Profiles</dt>
              <dd className="flex flex-wrap gap-x-5 gap-y-2">
                {links.map((href) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel={rel}
                    className="text-sm underline decoration-black/20 underline-offset-4 hover:decoration-black"
                  >
                    {linkLabel(href)}
                  </a>
                ))}
              </dd>
            </div>
          )}
          <div className="md:ml-auto">
            <dt className="sr-only">Record</dt>
            <dd className={mono}>
              {counters
                .filter(([label, n]) => n > 0 || label === "Sites")
                .map(([label, n], i) => (
                  <span key={label}>
                    {i > 0 && <span aria-hidden="true"> · </span>}
                    {label} {n}
                  </span>
                ))}
            </dd>
          </div>
        </dl>
      </section>

      {awards.length > 0 && (
        <section aria-labelledby="achievements-title" className="container-site pb-16">
          <h2
            id="achievements-title"
            className="mb-8 text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.05] font-semibold tracking-[-0.045em]"
          >
            Achievements
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {awards.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/awards/${a.slug}`}
                  className="group flex items-center gap-5 rounded-3xl border border-black/10 p-5 transition-colors hover:border-black"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- the award's own badge SVG */}
                  <img
                    src={badgePath(a.slug, { shape: "seal" })}
                    alt=""
                    width={88}
                    height={88}
                    loading="lazy"
                    className="size-[88px] shrink-0"
                  />
                  <span className="grid min-w-0 gap-1">
                    <span className="font-semibold tracking-[-0.02em]">{a.name}</span>
                    <span className="truncate text-sm text-black/60">{a.listing.title}</span>
                    <span className={`${mono} text-black/50`}>{badgeDate(a.tier, a.period, a.date)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="websites-title" className="container-site pb-24">
        <h2
          id="websites-title"
          className="mb-8 text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.05] font-semibold tracking-[-0.045em]"
        >
          Websites
        </h2>
        <ListingGrid listings={listings} emptyTitle="No public websites yet." />
      </section>
    </>
  );
}
