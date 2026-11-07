import type { Metadata } from "next";
import { UserButton } from "@clerk/nextjs";
import { Header } from "@/components/site/Header";
import { PageHero } from "@/components/listing/PageHero";
import { MyListings } from "@/components/listing/MyListings";
import { PillLink } from "@/components/site/ui";

export const metadata: Metadata = { title: "Your sites", robots: { index: false } };

// Protected by proxy.ts (requires a Clerk session).
export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { submitted } = await searchParams;

  return (
    <>
      <Header />
      <main id="main-content">
        <PageHero
          prelude="your account"
          title="Your sites"
          lede={
            submitted
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
