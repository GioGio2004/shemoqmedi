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
          <li key={r.juror.slug} className="grid gap-3 border-b border-black/8 py-5 last:border-b-0">
            <div className="flex items-center gap-3">
              <JurorAvatar url={r.juror.imageUrl} size={44} />
              <p
                className="w-[3.75rem] shrink-0 font-mono text-xl font-semibold tabular-nums"
                aria-label={`Score ${formatScore(r.average)} out of 10`}
              >
                {formatScore(r.average)}
              </p>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold tracking-[-0.02em]">
                  <Link href={`/jury/${r.juror.slug}`} className="hover:underline">
                    {r.juror.name}
                  </Link>
                </p>
                <p className="truncate text-xs text-black/55">{r.juror.title}</p>
              </div>
              <p className="hidden shrink-0 text-xs text-black/45 sm:block">{formatDate(r.updatedAt)}</p>
            </div>
            {r.comment && (
              <p className="text-[15px] leading-relaxed whitespace-pre-line text-black/80">{r.comment}</p>
            )}
            <dl className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] tracking-[0.06em] text-black/55 uppercase tabular-nums">
              {PILLARS.map((p) => (
                <div key={p.key} className="flex gap-1.5">
                  <dt>{p.name}</dt>
                  <dd className="text-black">{toPillars(r.scores)[p.key].toFixed(1)}</dd>
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
