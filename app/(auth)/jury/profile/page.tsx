import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { PageHero } from "@/components/listing/PageHero";
import { PillLink } from "@/components/site/ui";
import { JuryProfile } from "@/components/jury/JurorProfileForm";

export const metadata: Metadata = { title: "Your jury profile", robots: { index: false } };

// Protected by proxy.ts (requires a Clerk session). ?claimed=1: just claimed
// from a claim link (convex/claimLinks.ts sends people here).
export default async function JuryProfilePage({ searchParams }: { searchParams: Promise<{ claimed?: string }> }) {
  const { claimed } = await searchParams;
  return (
    <>
      <Header />
      <main id="main-content">
        <PageHero
          prelude={claimed ? "welcome to the" : "your"}
          title={claimed ? "Jury" : "Jury profile"}
          titleClassName={claimed ? undefined : "text-[clamp(3rem,9vw,9rem)] leading-[0.88]"}
          lede={
            claimed
              ? "Your jury spot is claimed and your profile is public. Share your badge, then score your first website."
              : "How you appear next to your evaluations and on the jury page."
          }
          action={
            claimed ? undefined : (
              <PillLink href="/collections/nominees" variant="outline">
                Sites in voting
              </PillLink>
            )
          }
        />
        <div className="container-site pb-24">
          <JuryProfile claimed={!!claimed} />
        </div>
      </main>
    </>
  );
}
