"use client";

import { friendlyError } from "@/lib/errors";
import { useState } from "react";
import Link from "next/link";
import { Authenticated, AuthLoading, Unauthenticated, useMutation, useQuery } from "convex/react";
import { api, type Pillars } from "@/convex-helpers-api";
import { PILLARS, type PillarKey } from "@/lib/taxonomy";
import { formatScore } from "@/lib/format";
import { ArrowIcon } from "@/components/site/ui";

const DEFAULT_SCORES: Pillars = { design: 7, usability: 7, creativity: 7, code: 7 };

const panel = "rounded-3xl border border-black/10 p-6 md:p-8";
const mono = "font-mono text-[11px] tracking-[0.06em] uppercase tabular-nums";

const TICKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/** Typed score → 1–10, one decimal; null if it is not a number. */
function cleanScore(raw: string | undefined): number | null {
  if (raw === undefined || raw.trim() === "") return null;
  const n = Number(raw.replace(",", "."));
  if (!Number.isFinite(n)) return null;
  return Math.round(Math.min(10, Math.max(1, n)) * 10) / 10;
}

/** Scores with any half-typed numbers applied (so a typed value is never lost on submit). */
function withDrafts(scores: Pillars, drafts: Partial<Record<PillarKey, string>>): Pillars {
  const out = { ...scores };
  for (const [key, raw] of Object.entries(drafts) as [PillarKey, string | undefined][]) {
    const n = cleanScore(raw);
    if (n !== null) out[key] = n;
  }
  return out;
}

function average(scores: Pillars) {
  return (scores.design + scores.usability + scores.creativity + scores.code) / 4;
}


/**
 * Community vote: four 1–10 sliders (Design, Usability, Creativity, Code).
 * One vote per voter while the listing is in its voting window, open only to
 * creators with a Shemoqmedi badge and never on their own site (the backend
 * enforces the same rules).
 */
export function VoteForm({
  slug,
  title,
  open,
}: {
  slug: string;
  title: string;
  /** Whether the listing is currently in its voting window. */
  open: boolean;
}) {
  if (!open) {
    return (
      <div className={panel}>
        <p className="eyebrow">Voting closed</p>
        <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
          Voting has closed for {title}.
        </p>
        <BackLink slug={slug} />
      </div>
    );
  }

  return (
    <>
      <AuthLoading>
        <p className="text-sm text-black/55">Loading…</p>
      </AuthLoading>
      <Unauthenticated>
        <div className={panel}>
          <p className="text-sm">
            You&apos;re signed in, but the database did not accept the session. Try reloading the
            page.
          </p>
        </div>
      </Unauthenticated>
      <Authenticated>
        <Ballot slug={slug} title={title} />
      </Authenticated>
    </>
  );
}

function Ballot({ slug, title }: { slug: string; title: string }) {
  const existing = useQuery(api.votes.mine, { slug });
  const eligibility = useQuery(api.votes.eligibility, { slug });
  const cast = useMutation(api.votes.cast);
  const [scores, setScores] = useState<Pillars>(DEFAULT_SCORES);
  // Text being typed in a score box, per pillar, until it is committed.
  const [drafts, setDrafts] = useState<Partial<Record<PillarKey, string>>>({});

  /** Apply a typed score (clamped to 1–10, one decimal); a non-number reverts. */
  function commit(key: PillarKey) {
    const raw = drafts[key];
    if (raw === undefined) return;
    const n = cleanScore(raw);
    if (n !== null) setScores((s) => ({ ...s, [key]: n }));
    dropDraft(key);
  }

  /** Forget a pillar's typed text (remove the key; never leave it undefined). */
  function dropDraft(key: PillarKey) {
    setDrafts((d) => {
      if (!(key in d)) return d;
      const next = { ...d };
      delete next[key];
      return next;
    });
  }
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  if (status === "done") {
    return (
      <div className={panel} role="status">
        <p className="eyebrow">Vote recorded</p>
        <p className="mt-3 text-3xl font-semibold tracking-[-0.045em]">Thank you.</p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-black/60">
          Your scores for {title} count toward the community 40%. The public page updates within a
          minute.
        </p>
        <ScoreList scores={scores} />
        <BackLink slug={slug} />
      </div>
    );
  }

  if (existing === undefined || eligibility === undefined) {
    return <p className="text-sm text-black/55">Loading…</p>;
  }

  if (existing) {
    return (
      <div className={panel}>
        <p className="eyebrow">You voted</p>
        <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
          You&apos;ve already scored {title}.
        </p>
        <ScoreList scores={existing.scores} />
        <BackLink slug={slug} />
      </div>
    );
  }

  // null: the account is still syncing with the database.
  if (eligibility === null) {
    return (
      <div className={panel}>
        <p className="text-sm text-black/55">Setting up your account. Reload the page in a moment.</p>
      </div>
    );
  }

  if (!eligibility.canVote) {
    return <NotEligible kind={eligibility.kind} reason={eligibility.reason} slug={slug} title={title} />;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status !== "idle") return;
    const final = withDrafts(scores, drafts);
    setScores(final);
    setDrafts({});
    setStatus("saving");
    setError(null);
    try {
      await cast({ slug, scores: final });
      setStatus("done");
    } catch (err) {
      setError(friendlyError(err));
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={onSubmit} className={panel} noValidate>
      <fieldset className="grid gap-7">
        <legend className="eyebrow mb-6">Score each pillar from 1 to 10</legend>
        {PILLARS.map((p) => {
          const id = `vote-${p.key}`;
          const value = scores[p.key];
          return (
            <div key={p.key} className="grid gap-3">
              <div className="flex items-baseline justify-between">
                <label htmlFor={id} className="text-sm font-semibold tracking-[-0.01em]">
                  {p.name}
                </label>
                {/* Type an exact score, or drag the slider below. */}
                <input
                  type="number"
                  inputMode="decimal"
                  min={1}
                  max={10}
                  step={0.1}
                  aria-label={`${p.name} score, 1 to 10`}
                  value={drafts[p.key] ?? value.toFixed(1)}
                  onChange={(e) => setDrafts((d) => ({ ...d, [p.key]: e.target.value }))}
                  onBlur={() => commit(p.key)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    commit(p.key);
                  }}
                  className={`${mono} w-[4.5rem] rounded-lg border border-black/10 px-2 py-1 text-right text-sm text-black outline-none focus:border-black [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                />
              </div>
              <input
                id={id}
                type="range"
                min={1}
                max={10}
                step={0.1}
                value={value}
                onChange={(e) => {
                  dropDraft(p.key);
                  setScores((s) => ({ ...s, [p.key]: Math.round(Number(e.target.value) * 10) / 10 }));
                }}
                className="w-full cursor-pointer accent-black"
              />
              {/* 1–10 scale marks, placed along the thumb's travel (thumb ≈ 16px wide). */}
              <div aria-hidden="true" className="relative -mt-1 h-6">
                {TICKS.map((n) => (
                  <span
                    key={n}
                    className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1"
                    style={{ left: `calc(8px + (100% - 16px) * ${(n - 1) / 9})` }}
                  >
                    <span className="h-1.5 w-px bg-black/25" />
                    <span className="font-mono text-[9px] leading-none text-black/55 tabular-nums">{n}</span>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </fieldset>

      <div className="mt-8 flex flex-col gap-5 border-t border-black/10 pt-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Your average</p>
          <p className="mt-2 font-mono text-4xl font-medium tracking-tight tabular-nums" aria-live="polite">
            {formatScore(average(scores))}
            <span className="text-xl text-black/40"> / 10</span>
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          {error && (
            <p role="alert" className="text-sm font-medium">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={status !== "idle"}
            className="inline-flex min-h-[46px] items-center gap-3.5 rounded-full bg-black py-1 pr-1.5 pl-5 text-[11.5px] font-semibold tracking-[0.05em] text-white uppercase disabled:opacity-60"
          >
            {status === "saving" ? "Submitting…" : "Submit vote"}
            <span className="grid size-9 place-items-center rounded-full bg-white text-black">
              <ArrowIcon />
            </span>
          </button>
        </div>
      </div>
      <p className="mt-6 text-xs text-black/55">
        One vote per site. Votes can&apos;t be changed.
      </p>
    </form>
  );
}

/** Why this account can't vote (already-voted is handled by the ballot itself). */
function NotEligible({
  kind,
  reason,
  slug,
  title,
}: {
  kind: "ok" | "closed" | "own" | "badge" | "voted";
  reason: string | null;
  slug: string;
  title: string;
}) {
  if (kind === "badge") {
    return (
      <div className={panel}>
        <p className="eyebrow">Badge holders vote</p>
        <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
          Voting is open to creators with a Shemoqmedi badge.
        </p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-black/60">
          Get one by having a site of your own listed here: an Official Nominee badge or any award
          counts.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/submit"
            className="inline-flex min-h-[46px] items-center gap-3.5 rounded-full bg-black py-1 pr-1.5 pl-5 text-[11.5px] font-semibold tracking-[0.05em] text-white uppercase"
          >
            Submit your site
            <span className="grid size-9 place-items-center rounded-full bg-white text-black">
              <ArrowIcon />
            </span>
          </Link>
        </div>
        <BackLink slug={slug} />
      </div>
    );
  }
  if (kind === "own") {
    return (
      <div className={panel}>
        <p className="eyebrow">Your site</p>
        <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
          You can&apos;t vote on your own site.
        </p>
        <BackLink slug={slug} />
      </div>
    );
  }
  if (kind === "closed") {
    return (
      <div className={panel}>
        <p className="eyebrow">Voting closed</p>
        <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
          Voting has closed for {title}.
        </p>
        <BackLink slug={slug} />
      </div>
    );
  }
  return (
    <div className={panel}>
      <p className="text-sm">{reason ?? "You can't vote on this site."}</p>
      <BackLink slug={slug} />
    </div>
  );
}

function ScoreList({ scores }: { scores: Pillars }) {
  return (
    <dl className={`${mono} mt-6 grid max-w-xs grid-cols-2 gap-x-8 gap-y-1.5`}>
      {PILLARS.map((p) => (
        <div key={p.key} className="contents">
          <dt className="text-black/55">{p.name}</dt>
          <dd className="text-right">{scores[p.key].toFixed(1)}</dd>
        </div>
      ))}
      <div className="contents">
        <dt className="border-t border-black/10 pt-1.5 text-black/55">Average</dt>
        <dd className="border-t border-black/10 pt-1.5 text-right">{formatScore(average(scores))}</dd>
      </div>
    </dl>
  );
}

function BackLink({ slug }: { slug: string }) {
  return (
    <Link
      href={`/sites/${slug}`}
      className="mt-6 inline-block text-sm font-medium underline underline-offset-[5px]"
    >
      ← Back to the site page
    </Link>
  );
}
