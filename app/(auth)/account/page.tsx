import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex-helpers-api";
import { Header } from "@/components/site/Header";
import { PageHero } from "@/components/listing/PageHero";
import { MyListings } from "@/components/listing/MyListings";
import { PillLink } from "@/components/site/ui";

export const metadata: Metadata = { title: "Your sites", robots: { index: false } };

/** Whether the signed-in user is an active juror. Any failure: treat as not a juror. */
async function isJuror() {
  try {
    const token = await (await auth()).getToken({ template: "convex" });
    if (!token) return false;
    return (await fetchQuery(api.jury.me, {}, { token })) !== null;
  } catch {
    return false;
  }
}

// Protected by proxy.ts (requires a Clerk session). Jurors are sent to their
// jury profile (which lists their sites too), except right after a submit or
// claim, whose message is shown here.
export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; claimed?: string }>;
}) {
  const { submitted, claimed } = await searchParams;
  if (!submitted && !claimed && (await isJuror())) redirect("/jury/profile");

  return (
    <>
      <Header />
      <main id="main-content">
        <PageHero
          prelude="your account"
          title="Your sites"
          lede={
            claimed
              ? "Done, the site is yours. Its public page updates within a minute, with a followed link to your site."
              : submitted
                ? "Thanks, your site is in the review queue. You'll see the decision here."
                : "Everything you've submitted, and where it stands."
          }
          action={
            <div className="flex items-center gap-4">
              <UserButton />
              <PillLink href="/submit">Submit a site</PillLink>
            </div>
          }
        />
        <div className="container-site pb-24">
          <MyListings />
        </div>
      </main>
    </>
  );
}
