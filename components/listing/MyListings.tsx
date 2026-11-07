"use client";

import { useState } from "react";
import Link from "next/link";
import { ConvexError } from "convex/values";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { api, type ListingStatus, type OwnListing } from "@/convex-helpers-api";
import { AwardBadge, ScoreBadge } from "@/components/listing/Badges";
import { Countdown } from "@/components/listing/Countdown";

const STATUS: Record<ListingStatus, string> = {
  pending: "In review",
  in_voting: "Live voting",
  awarded: "Awarded",
  archived: "Closed",
  rejected: "Not accepted",
};

/** Statuses that have a public /sites/<slug> page. */
const PUBLIC: ReadonlySet<ListingStatus> = new Set([
  "in_voting",
  "awarded",
  "archived",
]);

export function MyListings() {
  return (
    <>
      <AuthLoading>
        <p className="text-sm text-black/55">Loading…</p>
      </AuthLoading>
      <Unauthenticated>
        <p className="text-sm">
          You&apos;re signed in, but the database did not accept the session.
          Check that this app uses the same Clerk instance as the Convex
          deployment.
        </p>
      </Unauthenticated>
      <Authenticated>
        <List />
      </Authenticated>
    </>
  );
}

function StatusDetail({ listing }: { listing: OwnListing }) {
  switch (listing.status) {
    case "in_voting":
      return listing.votingEndsAt ? (
        <div className="mt-2">
          <Countdown endsAt={listing.votingEndsAt} />
        </div>
      ) : null;
    case "awarded":
      return (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {listing.awards.map((award) => (
            <AwardBadge key={award} award={award} full />
          ))}
          <ScoreBadge score={listing.finalScore} outOf className="ml-1" />
        </div>
      );
    case "archived":
      return listing.finalScore !== null ? (
        <div className="mt-2">
          <ScoreBadge score={listing.finalScore} outOf />
        </div>
      ) : null;
    case "rejected":
      return listing.reviewNote ? (
        <p className="mt-2 text-sm">Reason: {listing.reviewNote}</p>
      ) : null;
    default:
      return null;
  }
}

function List() {
  const listings = useQuery(api.listings.myListings, {});
  const withdraw = useMutation(api.listings.withdraw);
  const [error, setError] = useState<string | null>(null);

  async function remove(listing: OwnListing) {
    if (
      !confirm(
        `Remove "${listing.title}"? This deletes it and its screenshots.`,
      )
    )
      return;
    setError(null);
    try {
      await withdraw({ id: listing.id });
    } catch (err) {
      setError(
        err instanceof ConvexError
          ? String(err.data)
          : "Could not remove the site. Please try again.",
      );
    }
  }

  if (listings === undefined)
    return <p className="text-sm text-black/55">Loading…</p>;
  if (listings.length === 0) {
    return (
      <div className="rounded-3xl border border-black/10 p-8">
        <p className="text-2xl font-semibold tracking-[-0.04em]">
          No sites yet.
        </p>
        <Link
          href="/submit"
          className="mt-4 inline-block text-sm font-medium underline underline-offset-[5px]"
        >
          Submit your first site ↗
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <p role="alert" className="mb-4 text-sm font-medium">
          {error}
        </p>
      )}
      <ul className="grid gap-3">
        {listings.map((l) => (
          <li
            key={l.id}
            className="grid grid-cols-[96px_1fr] items-center gap-4 rounded-3xl border border-black/10 p-3 sm:grid-cols-[160px_1fr_auto] sm:gap-6 sm:p-4"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-black/8">
              {l.coverUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- private, not worth optimizing
                <img
                  src={l.coverUrl}
                  alt=""
                  className="absolute inset-0 size-full object-cover object-top"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="eyebrow">{STATUS[l.status]}</p>
              <p className="mt-1 truncate text-lg font-semibold tracking-[-0.03em]">
                {l.title}
              </p>
              <p className="truncate text-sm text-black/55">
                {l.url.replace(/^https?:\/\//, "")}
              </p>
              <StatusDetail listing={l} />
            </div>
            <div className="col-span-2 flex gap-4 text-sm sm:col-span-1 sm:pr-3">
              {PUBLIC.has(l.status) && (
                <Link
                  href={`/sites/${l.slug}`}
                  className="font-medium underline underline-offset-4"
                >
                  View ↗
                </Link>
              )}
              <button
                type="button"
                onClick={() => void remove(l)}
                className="text-black/55 underline underline-offset-4 hover:text-black"
              >
                {l.status === "pending" ? "Withdraw" : "Remove"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
