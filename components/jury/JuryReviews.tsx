import Link from "next/link";
import type { JuryReview } from "@/convex-helpers-api";
import { PILLARS } from "@/lib/taxonomy";
import { formatDate, formatScore } from "@/lib/format";
import { JurorAvatar } from "./JurorAvatar";

/** Each juror's score and comment on a listing page. Renders nothing without reviews. */
export function JuryReviews({ reviews }: { reviews: JuryReview[] }) {
  if (reviews.length === 0) return null;
  return (
    <section aria-labelledby="jury-reviews-title" className="container-site mt-16">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="jury-reviews-title" className="text-3xl font-semibold tracking-[-0.045em]">
          Jury reviews
        </h2>
        <Link href="/jury" className="text-sm underline decoration-black/25 underline-offset-4 hover:decoration-black">
          About the jury
        </Link>
      </div>
      <ul className="mt-6 grid gap-px overflow-hidden rounded-3xl border border-black/10 bg-black/10 md:grid-cols-2">
        {reviews.map((r) => (
          <li key={r.juror.slug} className="grid content-start gap-4 bg-white p-6 md:p-8">
            <div className="flex items-center gap-3">
              <JurorAvatar url={r.juror.imageUrl} size={44} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold tracking-[-0.02em]">
                  <Link href={`/jury#${r.juror.slug}`} className="hover:underline">
                    {r.juror.name}
                  </Link>
                </p>
                <p className="truncate text-xs text-black/55">{r.juror.title}</p>
              </div>
              <p className="font-mono text-2xl font-semibold tabular-nums" aria-label={`Score ${formatScore(r.average)} out of 10`}>
                {formatScore(r.average)}
              </p>
            </div>
            <p className="text-[15px] leading-relaxed whitespace-pre-line text-black/80">{r.comment}</p>
            <dl className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] tracking-[0.06em] text-black/55 uppercase tabular-nums">
              {PILLARS.map((p) => (
                <div key={p.key} className="flex gap-1.5">
                  <dt>{p.name}</dt>
                  <dd className="text-black">{r.scores[p.key].toFixed(1)}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-black/45">{formatDate(r.updatedAt)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
