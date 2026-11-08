"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api, type ClaimListingPreview, type ClaimResolution } from "@/convex-helpers-api";
import { PageHero } from "@/components/listing/PageHero";
import { MediaImage as Image } from "@/components/site/MediaImage";
import { ArrowIcon, PillLink, Tag } from "@/components/site/ui";
import { JuryCard } from "@/components/jury/JuryCard";
import { friendlyError } from "@/lib/errors";
import { hostOf } from "@/lib/format";

/** Hero copy per link kind. */
function heroFor(r: ClaimResolution | undefined, justClaimed: boolean) {
  if (r === undefined) return { prelude: "private", title: "Claim", lede: undefined };
  if (r.state === "invalid") {
    return {
      prelude: "this link is",
      title: "Not valid",
      lede: "It may have been replaced by a newer link. Check that you opened the full link, or ask us for a new one.",
    };
  }
  if (r.state === "claimed") {
    return { prelude: justClaimed ? "all done" : "already", title: "Claimed", lede: "Taking you there…" };
  }
  if (r.kind === "listing") {
    return {
      prelude: "claim your website",
      title: r.listings[0]?.title ?? "Website",
      lede: "Your website is listed on Shemoqmedi. Claim it with a free account to manage it.",
    };
  }
  return {
    prelude: "claim your",
    title: r.kind === "bundle" ? "Profile" : "Jury spot",
    lede:
      r.kind === "bundle"
        ? "Your jury profile and your work are ready. Claim them together with one account."
        : "Your jury profile is ready. Claim it with a free account and it goes live on the jury page.",
  };
}

function ListingPreview({ listing }: { listing: ClaimListingPreview }) {
  return (
    <figure className="grid content-start gap-3">
      <div className="relative aspect-video overflow-hidden rounded-3xl border border-black/8 bg-black/5">
        {listing.coverUrl && (
          <Image
            src={listing.coverUrl}
            alt={`${listing.title} screenshot`}
            fill
            sizes="(max-width: 1024px) 100vw, 680px"
            className="object-cover object-top"
          />
        )}
      </div>
      <figcaption className="grid gap-1">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-lg font-semibold tracking-[-0.02em]">{listing.title}</p>
          {listing.isStartup && <Tag>Startup</Tag>}
        </div>
        {listing.tagline && <p className="text-sm text-black/70">{listing.tagline}</p>}
        <p className="text-xs font-medium">
          by {listing.creditName} · {hostOf(listing.url)}
        </p>
      </figcaption>
    </figure>
  );
}

const perks = {
  juror: [
    ["Score websites", "Rate sites in their voting window on design, usability, creativity and code."],
    ["Your name on every review", "Your comments appear on each site's page with your profile."],
    ["A public jury page", "A profile and badge you can share."],
  ],
  listing: [
    ["A followed link", "Your listing page links to your site with a permanent followed (dofollow) backlink."],
    ["It's yours", "The listing shows as claimed and appears in your account."],
    ["Jury feedback and badges", "Follow the jury's scores and comments, and put your award badge on your site."],
  ],
} as const;

/**
 * /claim/<token>: preview what a secret claim link points to (a jury profile,
 * a profile plus its websites, or one website), then claim it. Signed-out
 * visitors go through sign-up and come back with ?auto=1, which claims
 * straight away so nothing is lost across the auth handoff.
 */
export function ClaimToken({ token, auto }: { token: string; auto: boolean }) {
  const router = useRouter();
  const resolution = useQuery(api.claimLinks.resolve, { token });
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isAuthenticated } = useConvexAuth();
  // A brand-new account reaches the database through Clerk's webhook a moment
  // after sign-up; claiming before that fails with "user record not found".
  // This query is live, so it flips to the user as soon as the row exists.
  const account = useQuery(api.users.getCurrentUser, isAuthenticated ? {} : "skip");
  const accountReady = isAuthenticated && !!account;
  const claimMutation = useMutation(api.claimLinks.claim);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set while our own claim runs: the link then resolves to "claimed", which
  // must not redirect to the public page before the claim's own redirect.
  const claiming = useRef(false);
  const autoRan = useRef(false);

  const claim = useCallback(async () => {
    if (claiming.current) return;
    claiming.current = true;
    setBusy(true);
    setError(null);
    try {
      const result = await claimMutation({ token });
      router.push(result.redirect);
    } catch (err) {
      claiming.current = false;
      setBusy(false);
      setError(friendlyError(err));
    }
  }, [claimMutation, router, token]);

  // A used link: go to what it claimed.
  const redirect = resolution?.state === "claimed" ? resolution.redirect : null;
  useEffect(() => {
    if (redirect && !claiming.current) router.replace(redirect);
  }, [redirect, router]);

  // Back from sign-up/sign-in: claim once, as soon as Convex has the session.
  const open = resolution?.state === "open";
  useEffect(() => {
    if (!auto || !open || !isSignedIn || !accountReady || autoRan.current) return;
    autoRan.current = true;
    void claim();
  }, [auto, open, isSignedIn, accountReady, claim]);

  // busy stays set after a successful claim, until the redirect lands.
  const hero = heroFor(resolution, busy);
  const listingTitle = resolution?.kind === "listing" && hero.title.length > 10;

  return (
    <>
      <PageHero
        prelude={hero.prelude}
        title={hero.title}
        titleClassName={listingTitle ? "text-[clamp(2.75rem,8vw,7.5rem)]" : undefined}
        lede={hero.lede}
      />
      <div className="container-site pb-24">
        {resolution === undefined && <p className="text-sm text-black/55">Loading…</p>}

        {resolution?.state === "invalid" && <PillLink href="/">Back to the directory</PillLink>}

        {resolution?.state === "claimed" && redirect && (
          <Link href={redirect} className="text-sm font-medium underline underline-offset-[5px]">
            Continue
          </Link>
        )}

        {resolution?.state === "open" && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="grid content-start gap-8">
              {resolution.juror && <JuryCard juror={resolution.juror} branded />}
              {resolution.listings.map((l) => (
                <ListingPreview key={l.slug} listing={l} />
              ))}
            </div>

            <div className="grid content-start gap-6 rounded-3xl border border-black/10 p-6 md:p-8 lg:sticky lg:top-28 lg:self-start">
              <p className="eyebrow">What you get</p>
              <ul className="grid gap-4">
                {(resolution.kind === "listing"
                  ? perks.listing
                  : resolution.kind === "bundle"
                    ? [...perks.juror, perks.listing[0]]
                    : perks.juror
                ).map(([heading, body]) => (
                  <li key={heading} className="grid gap-1 border-t border-black/10 pt-4">
                    <p className="font-semibold tracking-[-0.02em]">{heading}</p>
                    <p className="text-sm text-black/60">{body}</p>
                  </li>
                ))}
              </ul>

              <ClaimActions
                token={token}
                label={
                  resolution.kind === "juror"
                    ? "Claim jury spot"
                    : resolution.kind === "bundle"
                      ? resolution.listings.length === 1
                        ? "Claim profile and website"
                        : "Claim profile and websites"
                      : "Claim this website"
                }
                // Signed in: wait until Convex has the session and the account row, or claim fails.
                ready={isLoaded && (!isSignedIn || accountReady)}
                signedIn={!!isSignedIn}
                email={user?.primaryEmailAddress?.emailAddress ?? null}
                busy={busy || (auto && !!isSignedIn && !error)}
                onClaim={() => void claim()}
                onSignOut={() => void signOut({ redirectUrl: `/claim/${token}` })}
              />
              {error && (
                <p role="alert" className="text-sm font-medium">
                  {error}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ClaimActions({
  token,
  label,
  ready,
  signedIn,
  email,
  busy,
  onClaim,
  onSignOut,
}: {
  token: string;
  label: string;
  ready: boolean;
  signedIn: boolean;
  email: string | null;
  busy: boolean;
  onClaim: () => void;
  onSignOut: () => void;
}) {
  if (!ready) return <p className="text-sm text-black/55">Loading…</p>;

  if (!signedIn) {
    const back = encodeURIComponent(`/claim/${token}?auto=1`);
    return (
      <div className="grid gap-4">
        <PillLink href={`/sign-up?redirect_url=${back}`} className="justify-self-start">
          {label}
        </PillLink>
        <p className="text-sm text-black/60">
          Create a free account first; you come straight back here.{" "}
          <Link href={`/sign-in?redirect_url=${back}`} className="text-black underline underline-offset-4">
            I already have an account
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <button
        type="button"
        disabled={busy}
        onClick={onClaim}
        className="inline-flex min-h-[46px] items-center gap-3.5 justify-self-start rounded-full bg-black py-1 pr-1.5 pl-5 text-[11.5px] font-semibold tracking-[0.05em] text-white uppercase disabled:opacity-60"
      >
        {busy ? "Claiming…" : label}
        <span className="grid size-9 place-items-center rounded-full bg-white text-black">
          <ArrowIcon />
        </span>
      </button>
      {email && (
        <p className="text-sm text-black/60">
          Claiming as {email}.{" "}
          <button type="button" onClick={onSignOut} className="text-black underline underline-offset-4">
            Use another account
          </button>
        </p>
      )}
    </div>
  );
}
