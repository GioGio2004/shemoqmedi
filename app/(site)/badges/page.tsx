import type { Metadata } from "next";
import { PageHero } from "@/components/listing/PageHero";
import { BadgeGenerator } from "@/components/badges/BadgeGenerator";
import { SITE_NAME } from "@/lib/site";

const title = "Website Award Badges";
const description =
  "Embed a Shemoqmedi badge on your website: Site of the Day, Best Solo Creation, Official Nominee or Honorable Mention. Each one links to your scores.";

// openGraph replaces the root one, so it repeats the shared fields and image.
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/badges" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/badges",
    title,
    description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Shemoqmedi: the web's finest websites" }],
  },
};

// Static content only; no Convex read.
export const dynamic = "force-static";

export default function BadgesPage() {
  return (
    <>
      <PageHero
        prelude="show it off"
        title="Badges"
        lede="Put a badge on your site. Each one links back to your page on shemoqmedi, so visitors can see the scores and the award."
      />
      <div className="container-site pb-8">
        <BadgeGenerator />
      </div>
    </>
  );
}
