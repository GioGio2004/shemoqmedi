import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/listing/PageHero";
import { ListingForm } from "@/components/listing/ListingForm";
import { PillLink } from "@/components/site/ui";

export const metadata: Metadata = { title: "Submit a site: the full form", robots: { index: false } };

// The full submission, for signed-in people (proxy.ts): the creator writes the
// listing themselves. /submit is the 30-second form, open to everyone. A site
// sent there first is completed here instead of being added a second time
// (components/listing/ListingForm.tsx).
export default function FullSubmitPage() {
  return (
    <main id="main-content">
      <PageHero
        prelude="the full form"
        title="Submit"
        lede="Write your own listing: description, credits, screenshots and a preview video. Our editors review every site by hand, and accepted ones get a week of jury voting."
        action={
          <PillLink href="/submit?form=quick" variant="outline">
            30-second form
          </PillLink>
        }
      />
      <div className="container-site pb-24">
        <Suspense fallback={<p className="text-sm text-black/55">Loading…</p>}>
          <ListingForm />
        </Suspense>
      </div>
    </main>
  );
}
