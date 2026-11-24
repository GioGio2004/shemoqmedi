import type { Metadata } from "next";
import { PageHero } from "@/components/listing/PageHero";
import { PillLink } from "@/components/site/ui";
import { MyBadges } from "@/components/badges/MyBadges";
import { MyCertificates } from "@/components/badges/MyCertificates";

export const metadata: Metadata = { title: "Your achievements", robots: { index: false } };

const h2 = "text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.05] font-semibold tracking-[-0.045em]";

// Protected by proxy.ts (/account needs a session). Only the verified owner
// of a winning site gets its certificates and badges; this page is the only
// place a certificate can be opened or downloaded.
export default function MyAchievementsPage() {
  return (
    <main id="main-content">
      <PageHero
        prelude="your"
        title="Achievements"
        titleClassName="text-[clamp(2.75rem,8vw,8rem)] leading-[0.9]"
        lede="Every award your sites won: its certificate to download and print, and its badge for your site. Each certificate's number can be checked by anyone on shemoqmedi.space/verify."
        action={
          <PillLink href="/account" variant="outline">
            Your sites
          </PillLink>
        }
      />
      <div className="container-site grid gap-16 pb-24">
        <section aria-labelledby="certificates-title" className="grid gap-8">
          <h2 id="certificates-title" className={h2}>
            Certificates
          </h2>
          <MyCertificates />
        </section>
        <section aria-labelledby="badges-title" className="grid gap-8 border-t border-black/10 pt-12">
          <h2 id="badges-title" className={h2}>
            Badges
          </h2>
          <MyBadges />
        </section>
      </div>
    </main>
  );
}
