"use client";

import { friendlyError } from "@/lib/errors";
import { useState } from "react";
import Link from "next/link";
import { Authenticated, AuthLoading, Unauthenticated, useMutation, useQuery } from "convex/react";
import { api, type Pillars } from "@/convex-helpers-api";
import { PILLARS } from "@/lib/taxonomy";
import { formatScore } from "@/lib/format";
import { ArrowIcon } from "@/components/site/ui";

const DEFAULT_SCORES: Pillars = { design: 7, usability: 7, creativity: 7, code: 7 };

const panel = "rounded-3xl border border-black/10 p-6 md:p-8";
const mono = "font-mono text-[11px] tracking-[0.06em] uppercase tabular-nums";

function average(scores: Pillars) {
  return (scores.design + scores.usability + scores.creativity + scores.code) / 4;
}


/**
 * Community vote: four 1–10 sliders (Design, Usability, Creativity, Code).
 * One vote per account while the listing is in its 7-day voting window.
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
  const cast = useMutation(api.votes.cast);
  const [scores, setScores] = useState<Pillars>(DEFAULT_SCORES);
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

  if (existing === undefined) return <p className="text-sm text-black/55">Loading…</p>;

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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status !== "idle") return;
    setStatus("saving");
    setError(null);
    try {
      await cast({ slug, scores });
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
                <output htmlFor={id} className={`${mono} text-sm text-black`}>
                  {value.toFixed(1)}
                </output>
              </div>
              <input
                id={id}
                type="range"
                min={1}
                max={10}
                step={0.1}
                value={value}
                onChange={(e) =>
                  setScores((s) => ({ ...s, [p.key]: Math.round(Number(e.target.value) * 10) / 10 }))
                }
                className="w-full cursor-pointer accent-black"
              />
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
        One vote per account. Votes can&apos;t be changed, and you can&apos;t vote on your own site.
      </p>
    </form>
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
