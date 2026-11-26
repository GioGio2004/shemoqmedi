import type { Metadata } from "next";
import { Suspense } from "react";
import { SubmissionReceived } from "@/components/submit/SubmissionReceived";

export const metadata: Metadata = { title: "Submission received", robots: { index: false } };

// After /submit saved the submission: the confirmation and the optional
// sign-in to track it (components/submit/SubmissionReceived.tsx).
export default function SubmissionReceivedPage() {
  return (
    <main id="main-content" className="container-site pt-28 pb-24 md:pt-36">
      <div className="mx-auto max-w-xl">
        <Suspense fallback={<p className="text-sm text-black/55">Loading…</p>}>
          <SubmissionReceived />
        </Suspense>
      </div>
    </main>
  );
}
