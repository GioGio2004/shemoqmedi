import type { JuryReview, PublicListing } from "@/convex-helpers-api";
import { JuryReviews } from "@/components/jury/JuryReviews";
import { AWARD_RULES, PILLARS } from "@/lib/taxonomy";
import { formatScore } from "@/lib/format";
import { SEALED_SCORES_COPY, scoresSealed } from "@/lib/scoreVisibility";

/**
 * Final score header (the jury's weighted score; the community score is shown
 * beside it for interest), then the four pillars as translucent blue squares
 * that float together, with each pillar's weight. Below them, each juror's review.
 * While the site is in voting everything is sealed: the pillars show their
 * weights only and a neutral line says when scores appear.
 */
export function ScoreBreakdown({
  listing,
  reviews = [],
  minVotes = AWARD_RULES.minVotes,
}: {
  listing: PublicListing;
  reviews?: JuryReview[];
  /** From the live award rules (getAwardRules); the default is only a fallback. */
  minVotes?: number;
}) {
  if (scoresSealed(listing)) return <SealedScores />;
  const tiles = PILLARS.map((p) => {
    const jury = listing.editorialScores?.[p.key] ?? null;
    const community = listing.communityScores?.[p.key] ?? null;
    return { ...p, jury, community, score: jury };
  });

  return (
    <div className="rounded-3xl border border-black/10 p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Final score</p>
          <p className="mt-2 font-mono text-5xl font-medium tracking-tight tabular-nums md:text-6xl">
            {formatScore(listing.finalScore)}
            {listing.finalScore !== null && <span className="text-2xl text-black/60"> / 10</span>}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-1 font-mono text-[11px] tracking-[0.06em] uppercase">
          <dt className="text-black/55">Jury votes</dt>
          <dd className="text-right tabular-nums">{listing.juryVotes ?? "—"}</dd>
          <dt className="text-black/55">Community score</dt>
          <dd className="text-right tabular-nums">{formatScore(listing.communityAverage)}</dd>
          <dt className="text-black/55">Community votes</dt>
          <dd className="text-right tabular-nums">{listing.communityVotesCount ?? "—"}</dd>
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
              <span className="font-mono text-[10px] text-white/60">{Math.round(tile.weight * 100)}%</span>
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
          Not scored yet. The jury scores each weekly batch during the following week; a site needs{" "}
          {minVotes} jury votes to be eligible for awards. Community votes are shown for interest and never count.
        </p>
      )}

      <JuryReviews reviews={reviews} />
    </div>
  );
}

/** The score card while judging is open: pillar names and weights, no numbers. */
function SealedScores() {
  return (
    <div className="rounded-3xl border border-black/10 p-6 md:p-8">
      <p className="eyebrow">Final score</p>
      <p className="mt-3 max-w-md text-lg font-semibold tracking-[-0.02em]">{SEALED_SCORES_COPY}</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-black/55">
        The jury scores each site during its judging week. Scores, pillar marks and jury reviews stay private until
        then, so every juror judges on their own.
      </p>

      <ul className="mt-8 grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        {PILLARS.map((p, i) => (
          <li
            key={p.key}
            className="score-tile flex aspect-square flex-col justify-between rounded-[22px] p-4 text-white md:p-5"
            style={{ animationDelay: `${i * -1.4}s` }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] font-semibold tracking-[0.08em] uppercase">{p.name}</span>
              <span className="font-mono text-[10px] text-white/60">{Math.round(p.weight * 100)}%</span>
            </div>
            <p className="font-mono text-[10px] tracking-[0.06em] text-white/70 uppercase">Revealed at close</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
