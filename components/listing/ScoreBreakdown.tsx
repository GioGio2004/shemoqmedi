import type { PublicListing } from "@/convex-helpers-api";
import { PILLARS } from "@/lib/taxonomy";
import { formatScore } from "@/lib/format";

/**
 * 4-pillar breakdown: jury (60%) vs community (40%) per pillar, as hairline
 * bars with monospace readouts, plus the combined final score.
 */
export function ScoreBreakdown({ listing }: { listing: PublicListing }) {
  const rows = PILLARS.map((p) => ({
    ...p,
    jury: listing.editorialScores?.[p.key] ?? null,
    community: listing.communityScores?.[p.key] ?? null,
  }));

  return (
    <div className="rounded-3xl border border-black/10 p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-black/10 pb-6">
        <div>
          <p className="eyebrow">Final score</p>
          <p className="mt-2 font-mono text-5xl font-medium tracking-tight tabular-nums md:text-6xl">
            {formatScore(listing.finalScore)}
            {listing.finalScore !== null && <span className="text-2xl text-black/40"> / 10</span>}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-1 font-mono text-[11px] tracking-[0.06em] uppercase">
          <dt className="text-black/55">Jury · 60%</dt>
          <dd className="text-right tabular-nums">{formatScore(listing.editorialAverage)}</dd>
          <dt className="text-black/55">Community · 40%</dt>
          <dd className="text-right tabular-nums">{formatScore(listing.communityAverage)}</dd>
          <dt className="text-black/55">Votes</dt>
          <dd className="text-right tabular-nums">{listing.communityVotesCount}</dd>
        </dl>
      </div>

      <ul className="mt-6 grid gap-5">
        {rows.map((row) => (
          <li key={row.key} className="grid gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold tracking-[-0.01em]">{row.name}</span>
              <span className="font-mono text-[11px] tracking-[0.06em] text-black/55 uppercase tabular-nums">
                Jury {formatScore(row.jury)} · Community {formatScore(row.community)}
              </span>
            </div>
            <Bar value={row.jury} label={`${row.name}, jury`} solid />
            <Bar value={row.community} label={`${row.name}, community`} />
          </li>
        ))}
      </ul>
      {listing.finalScore === null && (
        <p className="mt-6 text-sm text-black/55">
          Not scored yet. The jury and the community score every nominee during its 7-day window.
        </p>
      )}
    </div>
  );
}

function Bar({ value, label, solid }: { value: number | null; label: string; solid?: boolean }) {
  const pct = value === null ? 0 : Math.max(0, Math.min(100, (value / 10) * 100));
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={10}
      aria-valuenow={value ?? 0}
      className="h-1.5 overflow-hidden rounded-full bg-black/8"
    >
      <div
        className={solid ? "h-full rounded-full bg-black" : "h-full rounded-full bg-black/45"}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
