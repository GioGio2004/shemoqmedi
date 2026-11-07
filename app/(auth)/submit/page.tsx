import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { PageHero } from "@/components/listing/PageHero";
import { ListingForm } from "@/components/listing/ListingForm";

export const metadata: Metadata = { title: "Submit a site", robots: { index: false } };

// Protected by proxy.ts (requires a Clerk session). New accounts land here.
export default function SubmitPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <PageHero
          prelude="list your work"
          title="Submit"
          lede="Show us a site you built. If it's approved, it goes live in the showcase with a link back to you."
        />
        <div className="container-site pb-24">
          <ListingForm />
        </div>
      </main>
    </>
  );
}
