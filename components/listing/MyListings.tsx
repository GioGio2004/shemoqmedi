"use client";

import Link from "next/link";
import { Authenticated, AuthLoading, Unauthenticated, useMutation, useQuery } from "convex/react";
import { api, type OwnListing } from "@/convex-helpers-api";

const STATUS: Record<OwnListing["status"], string> = {
  pending: "In review",
  approved: "Live",
  rejected: "Not accepted",
};

export function MyListings() {
  return (
    <>
      <AuthLoading>
        <p className="text-sm text-black/55">Loading…</p>
      </AuthLoading>
      <Unauthenticated>
        <p className="text-sm">
          You&apos;re signed in, but the database did not accept the session. Check that this
          app uses the same Clerk instance as the Convex deployment.
        </p>
      </Unauthenticated>
      <Authenticated>
        <List />
      </Authenticated>
    </>
  );
}

function List() {
  const listings = useQuery(api.listings.myListings, {});
  const withdraw = useMutation(api.listings.withdraw);

  if (listings === undefined) return <p className="text-sm text-black/55">Loading…</p>;
  if (listings.length === 0) {
    return (
      <div className="rounded-3xl border border-black/10 p-8">
        <p className="text-2xl font-semibold tracking-[-0.04em]">No sites yet.</p>
        <Link href="/submit" className="mt-4 inline-block text-sm font-medium underline underline-offset-[5px]">
          Submit your first site ↗
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid gap-3">
      {listings.map((l) => (
        <li
          key={l.id}
          className="grid grid-cols-[96px_1fr] items-center gap-4 rounded-3xl border border-black/10 p-3 sm:grid-cols-[160px_1fr_auto] sm:gap-6 sm:p-4"
        >
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-black/8">
            {l.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- private, not worth optimizing
              <img src={l.coverUrl} alt="" className="absolute inset-0 size-full object-cover object-top" />
            )}
          </div>
          <div className="min-w-0">
            <p className="eyebrow">{STATUS[l.status]}</p>
            <p className="mt-1 truncate text-lg font-semibold tracking-[-0.03em]">{l.title}</p>
            <p className="truncate text-sm text-black/55">{l.url.replace(/^https?:\/\//, "")}</p>
            {l.status === "rejected" && l.reviewNote && (
              <p className="mt-2 text-sm">Reason: {l.reviewNote}</p>
            )}
          </div>
          <div className="col-span-2 flex gap-4 text-sm sm:col-span-1 sm:pr-3">
            {l.status === "approved" && (
              <Link href={`/sites/${l.slug}`} className="font-medium underline underline-offset-4">
                View ↗
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                if (confirm(`Remove "${l.title}"? This deletes it and its screenshots.`)) {
                  void withdraw({ id: l.id });
                }
              }}
              className="text-black/55 underline underline-offset-4 hover:text-black"
            >
              {l.status === "pending" ? "Withdraw" : "Remove"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
