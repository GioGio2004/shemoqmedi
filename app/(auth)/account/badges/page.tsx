import type { Metadata } from "next";
import { PageHero } from "@/components/listing/PageHero";
import { PillLink } from "@/components/site/ui";
import { MyBadges } from "@/components/badges/MyBadges";

export const metadata: Metadata = { title: "Your badges", robots: { index: false } };

// Protected by proxy.ts (/account needs a session). Only the verified owner
// of a winning site gets its badges.
export default function MyBadgesPage() {
  return (
    <main id="main-content">
      <PageHero
        prelude="your"
        title="Badges"
        titleClassName="text-[clamp(3rem,9vw,9rem)] leading-[0.88]"
        lede="One badge for each award your sites won, with its date. Each links to the award's page on Shemoqmedi."
        action={
          <PillLink href="/account" variant="outline">
            Your sites
          </PillLink>
        }
      />
      <div className="container-site pb-24">
        <MyBadges />
      </div>
    </main>
  );
}
