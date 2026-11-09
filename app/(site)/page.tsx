import type { Metadata } from "next";
import { DirectoryBrowser } from "@/components/listing/DirectoryBrowser";
import { HeroShowcase } from "@/components/listing/HeroShowcase";
import { HeroSlider } from "@/components/listing/HeroSlider";
import type { PublicListing } from "@/convex-helpers-api";

/**
 * Header slider: the sites an admin featured (admin → Featured), in their
 * order. With none chosen it picks automatically: award winners (newest
 * first), then top-scored, then newest. Max 12.
 */
function sliderOrder(listings: PublicListing[]) {
  const featured = listings
    .filter((l) => l.coverUrl && typeof l.featuredRank === "number")
    .sort((a, b) => (a.featuredRank ?? 0) - (b.featuredRank ?? 0));
  if (featured.length > 0) return featured.slice(0, 12);
  return [...listings]
    .filter((l) => l.coverUrl)
    .sort(
      (a, b) =>
        Number(b.awards.length > 0) - Number(a.awards.length > 0) ||
        (b.awardedAt ?? 0) - (a.awardedAt ?? 0) ||
        (b.finalScore ?? 0) - (a.finalScore ?? 0) ||
        b.publishedAt - a.publishedAt,
    )
    .slice(0, 12);
}
import { LiveVotingRail } from "@/components/listing/LiveVotingRail";
import { PageHero } from "@/components/listing/PageHero";
import { PillLink } from "@/components/site/ui";
import { getPublicListings } from "@/lib/listings";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

// Title and description are the root defaults (app/layout.tsx), which Next
// also copies into og:title and og:description. This openGraph replaces the
// root one, so it repeats the shared fields and the default share image.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Shemoqmedi: the web's finest websites" }],
  },
};

// Static HTML from the CDN, refreshed in the background at most once a
// minute, so newly approved sites appear without a deploy. (Convex reads are
// POST requests, which Next treats as uncacheable; force-static overrides that.)
export const dynamic = "force-static";
export const revalidate = 60;

export default async function Home() {
  const listings = await getPublicListings();

  const listed = listings.slice(0, 20);
  // Organization gives Google the logo; WebSite gives it the site name (the
  // domain used to carry another product). No SearchAction: there is no
  // search page. Add sameAs to the Organization once social profiles exist.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: { "@type": "ImageObject", url: absoluteUrl("/brand/crow.png"), width: 431, height: 320 },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        alternateName: ["shemoqmedi.space"],
        url: `${SITE_URL}/`,
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      ...(listed.length > 0
        ? [
            {
              "@type": "ItemList",
              "@id": `${SITE_URL}/#latest`,
              name: "Websites",
              numberOfItems: listed.length,
              itemListElement: listed.map((listing, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: listing.title,
                url: absoluteUrl(`/sites/${listing.slug}`),
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <HeroSlider listings={sliderOrder(listings)} />
      <PageHero
        afterHero={listings.some((l) => l.coverUrl)}
        eyebrow="Website awards & web design inspiration"
        prelude="the web's finest"
        title="Websites"
        lede="Web design inspiration: sites worth seeing, scored by a jury and the community. The best get awarded."
        meta={`${listings.length} ${listings.length === 1 ? "website" : "websites"}`}
        action={<PillLink href="/submit">Submit your site</PillLink>}
      />
      <HeroShowcase listings={listings} />
      <LiveVotingRail listings={listings} />
      <DirectoryBrowser listings={listings} />
    </>
  );
}
