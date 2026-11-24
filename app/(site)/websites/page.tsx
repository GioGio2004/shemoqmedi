import type { Metadata } from "next";
import { PageHero } from "@/components/listing/PageHero";
import { DirectoryBrowser } from "@/components/listing/DirectoryBrowser";
import { PillLink } from "@/components/site/ui";
import { getPublicListings } from "@/lib/listings";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

// Every public site with the directory's filters (award, category, region,
// tech). The home page shows only the latest 20 and links here.
export const dynamic = "force-static";
export const revalidate = 60;

const title = "All Websites: Web Design Directory";
const description =
  "Every website on Shemoqmedi, scored by an independent jury: filter by award, category, region and technology.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/websites" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/websites",
    title,
    description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Shemoqmedi: the web's finest websites" }],
  },
};

export default async function WebsitesPage() {
  const listings = await getPublicListings();
  const url = absoluteUrl("/websites");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    url,
    name: title,
    description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: "en",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: listings.length,
      itemListElement: listings.map((l, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/sites/${l.slug}`),
        name: l.title,
      })),
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PageHero
        prelude="every site in the"
        title="Directory"
        lede="Every website on Shemoqmedi, newest first. Filter by award, category, region or technology."
        meta={`${listings.length} ${listings.length === 1 ? "website" : "websites"}`}
        action={<PillLink href="/submit">Submit your site</PillLink>}
      />
      <DirectoryBrowser listings={listings} />
    </>
  );
}
