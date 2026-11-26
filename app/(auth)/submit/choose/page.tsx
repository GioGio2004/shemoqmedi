import type { Metadata } from "next";
import { Suspense } from "react";
import { SubmitChooser } from "@/components/submit/SubmitChooser";

export const metadata: Metadata = { title: "Submit your site", robots: { index: false } };

// Signed-in visitors opening /submit get this page in its place (proxy.ts):
// the 30-second form or the full form, side by side, filling the screen below
// the header. Guests go straight to the 30-second form.
export default function SubmitChoosePage() {
  return (
    <main id="main-content" className="flex min-h-dvh flex-col pt-20 md:pt-[88px]">
      <div className="container-site flex flex-1 flex-col gap-4 pt-3 pb-3 md:gap-5 md:pt-4 md:pb-6">
        {/* Visible from md up; on phones the two cards get the whole screen. */}
        <h1 className="eyebrow sr-only md:not-sr-only">Submit your site: choose how</h1>
        <Suspense fallback={null}>
          <SubmitChooser />
        </Suspense>
      </div>
    </main>
  );
}
