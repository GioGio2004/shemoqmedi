import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { QuickSubmit } from "@/components/submit/QuickSubmit";

export const metadata: Metadata = {
  title: "Submit your site",
  description: "Submit your website to Shemoqmedi in 30 seconds: its name, its link and your email.",
  robots: { index: false },
};

const STEPS = [
  ["Submit", "Name, link and your email. That's all."],
  ["We review it", "By hand. Original, creative work gets a listing; sites sent only for promotion are declined."],
  ["The jury scores it", "A week of voting, then the results by email."],
] as const;

// Open to everyone, no account: the form saves the submission, then
// /submit/received offers an optional sign-in to track it. The full form,
// where the creator writes the listing, is /submit/full (signed-in).
export default function SubmitPage() {
  return (
    <main id="main-content" className="container-site pt-24 pb-24 md:pt-36">
      <div className="mx-auto grid max-w-xl gap-8 md:gap-10">
        <header className="grid gap-3">
          <p className="eyebrow">Submit your site</p>
          <h1 className="text-[clamp(2.25rem,9vw,4.5rem)] leading-[0.95] font-semibold tracking-[-0.055em]">
            Takes 30 seconds.
          </h1>
          <p className="text-[15px] leading-relaxed text-black/65">
            A creative space: awards here are earned, not bought. Our editors review every site by hand, and accepted
            ones get a week of jury voting.
          </p>
        </header>
        <Suspense fallback={<p className="text-sm text-black/55">Loading…</p>}>
          <QuickSubmit />
        </Suspense>
        <ol aria-label="What happens next" className="grid gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10">
          {STEPS.map(([head, text], i) => (
            <li key={head} className="flex gap-3 bg-white px-4 py-3 text-sm">
              <span className="font-mono text-black/40 tabular-nums">{i + 1}</span>
              <span>
                <span className="font-semibold">{head}.</span> <span className="text-black/60">{text}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="text-sm leading-relaxed text-black/60">
          Rather write the listing yourself?{" "}
          <Link href="/submit/full" className="font-semibold text-black underline underline-offset-4">
            Use the full form
          </Link>
          : your own description, credits, screenshots and video. It needs a free account.
        </p>
      </div>
    </main>
  );
}
