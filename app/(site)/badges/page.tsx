import type { Metadata } from "next";
import { PageHero } from "@/components/listing/PageHero";
import { BadgeGenerator } from "@/components/badges/BadgeGenerator";

export const metadata: Metadata = {
  title: "Badges",
  description:
    "Embed a shemoqmedi badge on your website: Site of the Day, Best Solo Creation, Official Nominee or Honorable Mention.",
  alternates: { canonical: "/badges" },
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
