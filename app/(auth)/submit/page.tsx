import type { Metadata } from "next";
import { PageHero } from "@/components/listing/PageHero";
import { ListingForm } from "@/components/listing/ListingForm";

export const metadata: Metadata = { title: "Submit a site", robots: { index: false } };

// Protected by proxy.ts (requires a Clerk session). New accounts land here.
export default function SubmitPage() {
  return (
    <>
      <main id="main-content">
        <PageHero
          prelude="list your work"
          title="Submit"
          lede="Show us a site you built. Once it's accepted it gets its own page, a link back to you and a 7-day voting window, extended to 14 days if the jury needs more time."
        />
        <div className="container-site pb-24">
          <ListingForm />
        </div>
      </main>
    </>
  );
}
