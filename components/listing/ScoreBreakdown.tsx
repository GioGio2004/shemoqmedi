import type { PublicListing } from "@/convex-helpers-api";
import { LIMITS, PILLARS, VOTING_DAYS } from "@/lib/taxonomy";
import { formatScore } from "@/lib/format";

// Same weighting the backend uses for the final score (convex/lib/scoring.ts
// in the admin repo): jury 60% + community 40%, or whichever one exists.
const JURY_WEIGHT = 0.6;
const COMMUNITY_WEIGHT = 0.4;

function combine(jury: number | null, community: number | null) {
  if (jury !== null && community !== null) return jury * JURY_WEIGHT + community * COMMUNITY_WEIGHT;
  return jury ?? community;
}

/**
 * Final score header, then the four pillars as translucent blue squares that
 * float together. Each square shows the pillar's combined score with the
 * jury and community numbers under it.
 */
export function ScoreBreakdown({ listing }: { listing: PublicListing }) {
  const tiles = PILLARS.map((p) => {
    const jury = listing.editorialScores?.[p.key] ?? null;
    const community = listing.communityScores?.[p.key] ?? null;
    return { ...p, jury, community, score: combine(jury, community) };
  });

  return (
    <div className="rounded-3xl border border-black/10 p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
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

      <ul className="mt-8 grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        {tiles.map((tile, i) => (
          <li
            key={tile.key}
            className="score-tile flex aspect-square flex-col justify-between rounded-[22px] p-4 text-white md:p-5"
            style={{ animationDelay: `${i * -1.4}s` }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] font-semibold tracking-[0.08em] uppercase">{tile.name}</span>
              <span className="font-mono text-[10px] text-white/60">0{i + 1}</span>
            </div>

            <div>
              <p
                className="font-mono text-[clamp(2rem,5vw,3rem)] leading-none font-medium tracking-tight tabular-nums"
                aria-label={`${tile.name}: ${tile.score === null ? "not scored yet" : `${formatScore(tile.score)} out of 10`}`}
              >
                {formatScore(tile.score)}
              </p>
              <div
                role="meter"
                aria-label={`${tile.name} score`}
                aria-valuemin={0}
                aria-valuemax={10}
                aria-valuenow={tile.score ?? 0}
                className="mt-3 h-1 overflow-hidden rounded-full bg-white/25"
              >
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${tile.score === null ? 0 : Math.min(100, tile.score * 10)}%` }}
                />
              </div>
              <p className="mt-2.5 flex flex-wrap gap-x-2 font-mono text-[10px] tracking-[0.06em] text-white/70 uppercase tabular-nums">
                <span>Jury {formatScore(tile.jury)}</span>
                <span>Comm. {formatScore(tile.community)}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>

      {listing.finalScore === null && (
        <p className="mt-6 text-sm text-black/55">
          Not scored yet. The jury and the community score every nominee during its {VOTING_DAYS}-day window,
          extended to {VOTING_DAYS + LIMITS.votingExtensionDays} days if the jury needs more time.
        </p>
      )}
    </div>
  );
}
