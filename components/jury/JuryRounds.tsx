"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api, type Pillars, type RoundCard } from "@/convex-helpers-api";
import { MediaImage as Image } from "@/components/site/MediaImage";
import { friendlyError } from "@/lib/errors";
import { PILLARS, toPillars, weightedScore } from "@/lib/taxonomy";

const START: Pillars = { design: 8, usability: 8, creativity: 8, content: 8 };
const ROUND_NAME = { SOTM: "Site of the Month", SOTY: "Site of the Year" } as const;

function Candidate({ roundId, c }: { roundId: string; c: RoundCard["candidates"][number] }) {
  const vote = useMutation(api.rounds.vote);
  const [scores, setScores] = useState<Pillars>(c.myScores ? toPillars(c.myScores) : START);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <li className="grid gap-4 rounded-3xl border border-black/10 p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:p-6">
      <div className="grid content-start gap-3">
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-black/8 bg-white">
          {c.coverUrl && (
            <Image src={c.coverUrl} alt={`${c.title} website screenshot`} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover object-top" />
          )}
        </div>
        <div>
          <Link href={`/sites/${c.slug}`} className="font-semibold tracking-[-0.02em] hover:underline">
            {c.title}
          </Link>
          <p className="text-xs text-black/55">by {c.creditName}</p>
        </div>
      </div>
      {c.blocked ? (
        <p className="self-center text-sm text-black/60">{c.blocked}</p>
      ) : (
        <form
          className="grid content-start gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            setBusy(true);
            setMessage(null);
            try {
              await vote({ roundId, slug: c.slug, scores });
              setMessage("Saved. You can change it until the round closes.");
            } catch (err) {
              setMessage(friendlyError(err));
            } finally {
              setBusy(false);
            }
          }}
        >
          {PILLARS.map((p) => (
            <label key={p.key} className="grid gap-1.5">
              <span className="flex items-baseline justify-between">
                <span className="eyebrow text-black">
                  {p.name} <span className="text-black/45">{Math.round(p.weight * 100)}%</span>
                </span>
                <span className="font-mono text-sm tabular-nums">{scores[p.key].toFixed(1)}</span>
              </span>
              <input
                type="range"
                min={1}
                max={10}
                step={0.1}
                value={scores[p.key]}
                onChange={(e) => setScores((s) => ({ ...s, [p.key]: Math.round(Number(e.target.value) * 10) / 10 }))}
                className="w-full cursor-pointer accent-black"
              />
            </label>
          ))}
          <p className="flex items-baseline justify-between border-y border-black/10 py-3">
            <span className="eyebrow text-black">Your score</span>
            <span className="font-mono text-2xl font-semibold tabular-nums">{weightedScore(scores).toFixed(2)}</span>
          </p>
          <button
            type="submit"
            disabled={busy}
            className="min-h-[46px] rounded-full bg-black px-5 text-[11.5px] font-semibold tracking-[0.05em] text-white uppercase disabled:opacity-60"
          >
            {busy ? "Saving…" : c.myScores ? "Update score" : "Save score"}
          </button>
          {message && (
            <p role="status" className="text-xs text-black/60">
              {message}
            </p>
          )}
        </form>
      )}
    </li>
  );
}

/** Open Site of the Month / Year rounds for the signed-in juror, and the general queue. */
export function JuryRounds() {
  const rounds = useQuery(api.rounds.open, {});
  const general = useQuery(api.digest.generalQueue, {});

  if (rounds === undefined) return <p className="text-sm text-black/55">Loading…</p>;
  if (rounds === null) return <p className="text-sm">This account is not on the jury. Jury membership is by invitation.</p>;

  return (
    <div className="grid gap-16">
      {rounds.length === 0 ? (
        <p className="max-w-xl text-sm leading-relaxed text-black/60">
          No round is open. The Site of the Month round opens on the 1st of each month for last month&apos;s Sites of
          the Day; the Site of the Year round opens on 1 January.
        </p>
      ) : (
        rounds.map((r) => (
          <section key={r.id} aria-labelledby={`round-${r.id}`} className="grid gap-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id={`round-${r.id}`} className="text-3xl font-semibold tracking-[-0.045em]">
                {ROUND_NAME[r.kind]} · {r.period}
              </h2>
              <p className="font-mono text-xs text-black/55">
                Open until {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tbilisi" }).format(r.closesAt)} (Tbilisi)
              </p>
            </div>
            <ul className="grid gap-6">
              {r.candidates.map((c) => (
                <Candidate key={c.slug} roundId={r.id} c={c} />
              ))}
            </ul>
          </section>
        ))
      )}

      {general && general.length > 0 && (
        <section aria-labelledby="general-queue" className="grid gap-4 border-t border-black/10 pt-12">
          <h2 id="general-queue" className="text-3xl font-semibold tracking-[-0.045em]">
            General queue
          </h2>
          <p className="max-w-xl text-sm text-black/60">Sites in voting that no juror follows by category yet. Anyone on the jury can score them.</p>
          <ul className="grid gap-2">
            {general.map((g) => (
              <li key={g.slug}>
                <Link href={`/sites/${g.slug}`} className="text-sm underline underline-offset-4">
                  {g.title}
                </Link>{" "}
                <span className="text-xs text-black/55">by {g.creditName}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
