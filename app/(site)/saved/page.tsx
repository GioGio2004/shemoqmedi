import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/listing/PageHero";
import { SavedSites } from "@/components/listing/SavedSites";
import { getPublicListings } from "@/lib/listings";

// A visitor's own list (kept in their browser) or a list someone shared with
// /saved?s=slug,slug. Personal, so never indexed.
export const metadata: Metadata = {
  title: "Saved sites",
  description: "Websites you saved on Shemoqmedi, and a link to share them with your designer or developer.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/saved" },
};

export const dynamic = "force-static";
export const revalidate = 300;

export default async function SavedPage() {
  // The list is picked in the browser, so every public site ships to it: only what a card shows.
  const listings = (await getPublicListings()).map((l) => ({
    ...l,
    tagline: "",
    juryNote: null,
    writeup: null,
    galleryUrls: [],
  }));
  return (
    <>
      <PageHero
        prelude="your"
        title="Saved"
        lede="Sites you saved for later, kept in this browser. Share the list with your designer or developer to show them what you like."
      />
      <div className="container-site pb-24">
        {/* useSearchParams in a static page needs a Suspense boundary. */}
        <Suspense fallback={null}>
          <SavedSites listings={listings} />
        </Suspense>
      </div>
    </>
  );
}
