"use client";

import { useState } from "react";
import Link from "next/link";
import type { JuryReview } from "@/convex-helpers-api";
import { PILLARS, toPillars } from "@/lib/taxonomy";
import { formatDate, formatScore } from "@/lib/format";
import { JurorAvatar } from "./JurorAvatar";

/** Reviews shown before "Show more". */
const VISIBLE = 3;

/**
 * The jury's reviews inside the score card (ScoreBreakdown): each juror's
 * photo with their score beside it, then their comment and pillar scores.
 * The first few show; "Show more" opens the full list. Nothing without reviews.
 */
export function JuryReviews({ reviews }: { reviews: JuryReview[] }) {
  const [open, setOpen] = useState(false);
  if (reviews.length === 0) return null;
  const shown = open ? reviews : reviews.slice(0, VISIBLE);
  const hidden = reviews.length - VISIBLE;

  return (
    <section aria-labelledby="jury-reviews-title" className="mt-8 border-t border-black/10 pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="jury-reviews-title" className="eyebrow">
          Jury reviews · {reviews.length}
        </h2>
        <Link href="/jury" className="text-xs underline decoration-black/25 underline-offset-4 hover:decoration-black">
          About the jury
        </Link>
      </div>

      <ul id="jury-review-list" className="mt-2 grid">
        {shown.map((r) => (
          <li key={r.juror.slug} className="grid gap-4 border-b border-black/10 py-6 last:border-b-0">
            <div className="flex items-center gap-3.5">
              <JurorAvatar url={r.juror.imageUrl} size={48} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold tracking-[-0.02em]">
                  {r.profilePublic ? (
                    <Link
                      href={`/jury/${r.juror.slug}`}
                      className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-black/40"
                    >
                      {r.juror.name}
                    </Link>
                  ) : (
                    r.juror.name
                  )}
                  {r.juror.isFounding && (
                    <span className="ml-2 align-middle font-mono text-[9.5px] font-medium tracking-[0.08em] text-black/45 uppercase">
                      Founding
                    </span>
                  )}
                </p>
                <p className="truncate text-[13px] text-black/55">{r.juror.title}</p>
              </div>
              <div className="shrink-0 text-right">
                <p
                  className="text-2xl leading-none font-semibold tracking-[-0.04em] tabular-nums"
                  aria-label={`Score ${formatScore(r.average)} out of 10`}
                >
                  {formatScore(r.average)}
                </p>
                <p className="mt-1.5 hidden font-mono text-[10px] tracking-[0.06em] text-black/50 uppercase sm:block">
                  {formatDate(r.updatedAt)}
                </p>
              </div>
            </div>
            {r.comment && (
              <p className="text-[15px] leading-relaxed whitespace-pre-line text-black/80">{r.comment}</p>
            )}
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-black/10 bg-black/10 sm:grid-cols-4">
              {PILLARS.map((p) => (
                <div key={p.key} className="grid gap-1 bg-white px-3 py-2.5">
                  <dt className="truncate font-mono text-[10px] tracking-[0.06em] text-black/50 uppercase">{p.name}</dt>
                  <dd className="text-sm font-semibold tabular-nums">{toPillars(r.scores)[p.key].toFixed(1)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      {hidden > 0 && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls="jury-review-list"
          onClick={() => setOpen((o) => !o)}
          className="mt-2 inline-flex min-h-10 items-center rounded-full border border-black/14 px-5 text-[11px] font-semibold tracking-[0.06em] uppercase transition-colors hover:border-black"
        >
          {open ? "Show less" : `Show more · ${hidden}`}
        </button>
      )}
    </section>
  );
}
