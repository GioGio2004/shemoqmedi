import type { Metadata } from "next";
import { UserButton } from "@clerk/nextjs";
import { PageHero } from "@/components/listing/PageHero";
import { PillLink } from "@/components/site/ui";
import { JuryProfile } from "@/components/jury/JurorProfileForm";
import { MyListings } from "@/components/listing/MyListings";

export const metadata: Metadata = { title: "Your jury profile", robots: { index: false } };

// Protected by proxy.ts (requires a Clerk session). ?claimed=1: just claimed
// from a claim link (convex/claimLinks.ts sends people here). Jurors land here
// from the header's Account button (/account redirects), so their sites are
// listed below the profile.
export default async function JuryProfilePage({ searchParams }: { searchParams: Promise<{ claimed?: string }> }) {
  const { claimed } = await searchParams;
  return (
    <>
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
            // UserButton: account settings and sign out (jurors don't see /account).
            <div className="flex items-center gap-4">
              <UserButton />
              {!claimed && (
                <PillLink href="/collections/nominees" variant="outline">
                  Sites in voting
                </PillLink>
              )}
            </div>
          }
        />
        <div className="container-site pb-24">
          <JuryProfile claimed={!!claimed} />
          <section aria-labelledby="your-sites-title" className="mt-16 grid gap-8 border-t border-black/10 pt-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="grid gap-2">
                <h2 id="your-sites-title" className="text-3xl font-semibold tracking-[-0.045em]">
                  Your sites
                </h2>
                <p className="text-sm text-black/60">Everything you&apos;ve submitted or claimed, and where it stands.</p>
              </div>
              <PillLink href="/submit" variant="outline">
                Submit a site
              </PillLink>
            </div>
            <MyListings />
          </section>
        </div>
      </main>
    </>
  );
}
