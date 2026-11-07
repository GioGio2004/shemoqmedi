import type { Metadata } from "next";
import { DirectoryBrowser } from "@/components/listing/DirectoryBrowser";
import { HeroShowcase } from "@/components/listing/HeroShowcase";
import { LiveVotingRail } from "@/components/listing/LiveVotingRail";
import { PageHero } from "@/components/listing/PageHero";
import { PillLink } from "@/components/site/ui";
import { getPublicListings } from "@/lib/listings";

const BASE_URL = (process.env.NEXT_PUBLIC_URL || "https://www.shemoqmedi.space").replace(/\/+$/, "");

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Static HTML from the CDN, refreshed in the background at most once a
// minute, so newly approved sites appear without a deploy. (Convex reads are
// POST requests, which Next treats as uncacheable; force-static overrides that.)
export const dynamic = "force-static";
export const revalidate = 60;

export default async function Home() {
  const listings = await getPublicListings();

  const listed = listings.slice(0, 20);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: "Shemoqmedi", url: `${BASE_URL}/` },
      ...(listed.length > 0
        ? [
            {
              "@type": "ItemList",
              name: "Websites",
              numberOfItems: listed.length,
              itemListElement: listed.map((listing, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: listing.title,
                url: `${BASE_URL}/sites/${listing.slug}`,
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
      <PageHero
        prelude="the web's finest"
        title="Websites"
        lede="Sites worth seeing, scored by a jury and the community. The best get awarded."
        meta={`${listings.length} ${listings.length === 1 ? "website" : "websites"}`}
        action={<PillLink href="/submit">Submit your site</PillLink>}
      />
      <HeroShowcase listings={listings} />
      <LiveVotingRail listings={listings} />
      <DirectoryBrowser listings={listings} />
    </>
  );
}
