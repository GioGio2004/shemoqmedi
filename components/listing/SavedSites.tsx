"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PublicListing } from "@/convex-helpers-api";
import { cleanSlugs, removeSaved, saveAll, useSaved } from "@/lib/saved";
import { PillLink } from "@/components/site/ui";
import { ListingCard } from "./ListingCard";

const button =
  "inline-flex min-h-[46px] items-center rounded-full border border-black/15 bg-white px-5 text-[11.5px] font-semibold tracking-[0.05em] uppercase transition-colors hover:border-black";

/**
 * /saved: this browser's saved sites, or a shared list (?s=slug,slug) with a
 * button to add it to your own. Slugs that are no longer public are skipped.
 */
export function SavedSites({ listings }: { listings: PublicListing[] }) {
  const saved = useSaved();
  const params = useSearchParams();
  const shared = useMemo(() => cleanSlugs((params.get("s") ?? "").split(",")), [params]);
  const viewingShared = shared.length > 0;
  const [copied, setCopied] = useState(false);

  const bySlug = useMemo(() => new Map(listings.map((l) => [l.slug, l])), [listings]);
  const slugs = viewingShared ? shared : saved;
  const shown = slugs.map((s) => bySlug.get(s)).filter((l): l is PublicListing => Boolean(l));
  const missingFromMine = shared.filter((s) => bySlug.has(s) && !saved.includes(s)).length;

  const share = async () => {
    const url = `${window.location.origin}/saved?s=${shown.map((l) => l.slug).join(",")}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Sites I like on Shemoqmedi", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Share sheet closed, or clipboard blocked: nothing to do.
    }
  };

  if (shown.length === 0) {
    return (
      <div className="flex flex-col items-start gap-6 rounded-3xl border border-black/10 p-8 md:p-12">
        <p className="max-w-lg text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.045em]">
          {viewingShared ? "These sites are no longer listed." : "Nothing saved yet."}
        </p>
        <p className="max-w-lg text-sm text-black/60">
          Tap the heart on any site to keep it here. Saved sites stay in this browser; no account needed.
        </p>
        <PillLink href="/">Browse sites</PillLink>
      </div>
    );
  }

  return (
    <div className="grid gap-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-6">
        <p className="font-mono text-[11px] font-medium tracking-[0.08em] text-black/55 uppercase tabular-nums">
          {viewingShared ? `Shared list · ${shown.length} ${shown.length === 1 ? "site" : "sites"}` : `${shown.length} saved`}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {viewingShared ? (
            <>
              {missingFromMine > 0 ? (
                <button type="button" className={button} onClick={() => saveAll(shared)}>
                  Add {missingFromMine} to my list
                </button>
              ) : (
                <span className="text-sm text-black/55">All in your list</span>
              )}
              <Link href="/saved" className={button}>
                My saved sites
              </Link>
            </>
          ) : (
            <button type="button" className={button} onClick={() => void share()} aria-live="polite">
              {copied ? "Link copied" : "Share this list"}
            </button>
          )}
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((listing) => (
          <li key={listing.slug} className="grid gap-3">
            <ListingCard listing={listing} />
            {!viewingShared && (
              <button
                type="button"
                onClick={() => removeSaved(listing.slug)}
                className="w-fit text-xs text-black/55 underline decoration-black/20 underline-offset-4 hover:text-black"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
