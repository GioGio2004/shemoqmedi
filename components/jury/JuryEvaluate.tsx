"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ClerkProvider } from "@/components/clerk-provider";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { api, type Pillars } from "@/convex-helpers-api";
import { friendlyError } from "@/lib/errors";
import { LIMITS, PILLARS, toPillars, weightedScore } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";
import { JurorAvatar } from "./JurorAvatar";

const START: Pillars = { design: 8, usability: 8, creativity: 8, content: 8 };

/** The floating Evaluate button and panel, for jury members only. */
function Evaluate({ slug, title }: { slug: string; title: string }) {
  const me = useQuery(api.jury.me, {});
  const state = useQuery(api.jury.myEvaluation, me ? { slug } : "skip");
  const save = useMutation(api.jury.evaluate);
  const declare = useMutation(api.conflicts.declare);

  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<Pillars>(START);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const loaded = useRef(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fill the form once with the juror's saved evaluation.
  useEffect(() => {
    if (loaded.current || !state) return;
    loaded.current = true;
    if (state.evaluation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time load of the saved evaluation
      setScores(toPillars(state.evaluation.scores));
      setComment(state.evaluation.comment);
    }
  }, [state]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!me) return null;

  const average = weightedScore(scores);
  const length = comment.trim().length;
  const blocked = state?.blocked ?? null;
  const hasSaved = Boolean(state?.evaluation);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || blocked) return;
    setBusy(true);
    setError(null);
    try {
      await save({ slug, scores, comment });
      setSavedAt(Date.now());
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed z-40"
      style={{
        right: "calc(16px + env(safe-area-inset-right, 0px))",
        bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={`Jury evaluation of ${title}`}
          className="absolute right-0 bottom-[84px] max-h-[min(80vh,720px)] w-[min(420px,calc(100vw-32px))] overflow-y-auto rounded-3xl border border-black/10 bg-white p-6"
        >
          <div className="flex items-start gap-3">
            <JurorAvatar url={me.imageUrl} size={40} />
            <div className="min-w-0 flex-1">
              <p className="eyebrow">Jury evaluation</p>
              <p className="truncate text-lg font-semibold tracking-[-0.03em]">{title}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="grid size-9 shrink-0 place-items-center rounded-full border border-black/10 hover:border-black"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {state === undefined ? (
            <p className="mt-6 text-sm text-black/55">Loading…</p>
          ) : blocked ? (
            <p className="mt-6 text-sm">{blocked}</p>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 grid gap-5">
              {PILLARS.map((p) => (
                <label key={p.key} className="grid gap-1.5">
                  <span className="flex items-baseline justify-between">
                    <span className="eyebrow text-black">{p.name}</span>
                    <span className="font-mono text-sm tabular-nums">{scores[p.key].toFixed(1)}</span>
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={0.1}
                    value={scores[p.key]}
                    onChange={(e) => {
                      setSavedAt(null);
                      setError(null);
                      setScores((s) => ({ ...s, [p.key]: Math.round(Number(e.target.value) * 10) / 10 }));
                    }}
                    className="w-full cursor-pointer accent-black"
                  />
                </label>
              ))}
              <p className="flex items-baseline justify-between border-y border-black/10 py-3">
                <span className="eyebrow text-black">Your score</span>
                <span className="font-mono text-2xl font-semibold tabular-nums">{average.toFixed(2)}</span>
              </p>
              <label className="grid gap-2">
                <span className="flex items-baseline justify-between">
                  <span className="eyebrow text-black">
                    Comment <span className="text-black/45">(optional)</span>
                  </span>
                  <span className="font-mono text-[11px] text-black/55 tabular-nums">
                    {length}/{LIMITS.juryComment}
                  </span>
                </span>
                <textarea
                  rows={5}
                  maxLength={LIMITS.juryComment}
                  value={comment}
                  onChange={(e) => {
                    setSavedAt(null);
                    setError(null);
                    setComment(e.target.value);
                  }}
                  placeholder="What stands out, and what could be better? Shown on this page with your name."
                  className="w-full resize-y rounded-xl border border-black/14 bg-white px-3.5 py-3 text-sm outline-none placeholder:text-black/35 focus:border-black"
                />
              </label>
              {error && (
                <p role="alert" className="text-sm font-medium">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="min-h-[46px] rounded-full bg-black px-5 text-[11.5px] font-semibold tracking-[0.05em] text-white uppercase disabled:opacity-60"
              >
                {busy ? "Saving…" : hasSaved ? "Update evaluation" : "Save evaluation"}
              </button>
              {savedAt && (
                <p role="status" className="text-xs text-black/60">
                  Saved. Your score and comment appear on this page within a minute. You can change them until
                  voting closes.
                </p>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  const reason = prompt(
                    "Did you build this site, or does it belong to your company? Say how (it stays private). Your score for it will be removed.",
                  );
                  if (reason === null) return;
                  setBusy(true);
                  setError(null);
                  try {
                    await declare({ slug, reason: reason.trim() || "I built this site or it belongs to my company." });
                  } catch (err) {
                    setError(friendlyError(err));
                  } finally {
                    setBusy(false);
                  }
                }}
                className="justify-self-start text-xs text-black/55 underline underline-offset-4 hover:text-black"
              >
                I have a conflict of interest with this site
              </button>
            </form>
          )}
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "grid size-[68px] place-items-center rounded-full text-[10.5px] font-semibold tracking-[0.06em] uppercase transition-transform hover:-translate-y-0.5 active:scale-95",
          // White hairline so the black circle stays visible over dark screenshots.
          open ? "border border-black bg-white text-black" : "border border-white/40 bg-black text-white",
        )}
      >
        {open ? "Close" : hasSaved ? "Edit" : "Evaluate"}
      </button>
    </div>
  );
}

export default function JuryEvaluate(props: { slug: string; title: string }) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <Evaluate {...props} />
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
