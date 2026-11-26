import type { Metadata } from "next";
import { PillLink } from "@/components/site/ui";
import { AccountHeader } from "@/components/account/AccountHeader";
import { JuryProfile } from "@/components/jury/JurorProfileForm";
import { MyListings } from "@/components/listing/MyListings";
import { DeleteAccount } from "@/components/account/DeleteAccount";
import { CreatorProfileEditor } from "@/components/account/CreatorProfileEditor";
import { AvatarPicker } from "@/components/account/AvatarPicker";
import { MySubmissions } from "@/components/account/MySubmissions";

export const metadata: Metadata = { title: "Your jury profile", robots: { index: false } };

// Protected by proxy.ts (requires a Clerk session). ?claimed=1: just claimed
// from a claim link (convex/claimLinks.ts sends people here). Jurors land here
// from the header's Account button (/account redirects), so their sites are
// listed below the profile.
export default async function JuryProfilePage({ searchParams }: { searchParams: Promise<{ claimed?: string }> }) {
  const { claimed } = await searchParams;
  return (
    <main id="main-content">
      <AccountHeader
        eyebrow="Jury profile"
        actions={
          <>
            <PillLink href="/collections/nominees">Sites in voting</PillLink>
            <PillLink href="/jury/rounds" variant="outline">
              Month &amp; year rounds
            </PillLink>
          </>
        }
      />
      <div className="container-site pb-24">
        <div className="border-t border-black/10 pt-12 md:pt-16">
          <JuryProfile claimed={!!claimed} />
        </div>
        <section
          aria-labelledby="your-sites-title"
          className="mt-8 grid gap-6 border-t border-black/10 py-12 md:grid-cols-12 md:gap-10 md:py-16"
        >
          <div className="grid content-start gap-2 md:col-span-4">
            <h2 id="your-sites-title" className="text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.05] font-semibold tracking-[-0.045em]">
              Your sites
            </h2>
            <p className="text-sm text-black/55">Everything you&apos;ve submitted or claimed, and where it stands.</p>
            <PillLink href="/submit/full" variant="outline" className="mt-3 justify-self-start">
              Submit a site
            </PillLink>
          </div>
          <div className="min-w-0 md:col-span-8">
            <MyListings />
          </div>
        </section>
        <MySubmissions />
        <AvatarPicker onlyForCreators />
        <CreatorProfileEditor />
        <DeleteAccount />
      </div>
    </main>
  );
}
