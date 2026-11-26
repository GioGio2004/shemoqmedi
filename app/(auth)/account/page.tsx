import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex-helpers-api";
import { MyListings } from "@/components/listing/MyListings";
import { PillLink } from "@/components/site/ui";
import { AccountHeader } from "@/components/account/AccountHeader";
import { DeleteAccount } from "@/components/account/DeleteAccount";
import { CreatorProfileEditor } from "@/components/account/CreatorProfileEditor";
import { AvatarPicker } from "@/components/account/AvatarPicker";
import { MySubmissions } from "@/components/account/MySubmissions";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

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
// jury profile (which lists their sites too), except right after a submit,
// claim or linking a submission, whose message is shown here.
export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; claimed?: string; jury?: string; linked?: string }>;
}) {
  const { submitted, claimed, jury, linked } = await searchParams;
  if (!submitted && !claimed && !linked && (await isJuror())) redirect("/jury/profile");

  const notice =
    jury === "pending"
      ? "Claimed. Your jury profile goes live on the jury page once we've checked it's you; we'll be in touch."
      : claimed
        ? "Done, the site is yours. Its public page updates within a minute, with a followed link to your site."
        : submitted
          ? "Thanks, your site is in the review queue. We also check that it's yours before your listing links back to you with a followed link. You'll see the decision here."
          : linked
            ? "You're in. Your submission is in your account now: follow it below, and add its details yourself if you like. We'll email you as it moves along."
            : null;

  return (
    <main id="main-content">
      <AccountHeader
        eyebrow="Your account"
        defaultAvatar
        actions={<PillLink href="/submit/full">Submit a site</PillLink>}
      />
      <div className="container-site pb-24">
        {notice && (
          <p role="status" className="mb-10 rounded-2xl bg-black px-6 py-5 text-[15px] leading-relaxed text-white">
            {notice}
          </p>
        )}
        <MySubmissions />
        <section
          aria-labelledby="your-sites-title"
          className="grid gap-6 border-t border-black/10 py-12 md:grid-cols-12 md:gap-10 md:py-16"
        >
          <div className="grid content-start gap-2 md:col-span-4 lg:col-span-3">
            <h2 id="your-sites-title" className="text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.05] font-semibold tracking-[-0.045em]">
              Your sites
            </h2>
            <p className="text-sm text-black/55">Everything you&apos;ve submitted or claimed, and where it stands.</p>
          </div>
          <div className="min-w-0 md:col-span-8 lg:col-span-9">
            <MyListings />
          </div>
        </section>
        <AvatarPicker />
        <CreatorProfileEditor />
        <DeleteAccount />
      </div>
    </main>
  );
}
