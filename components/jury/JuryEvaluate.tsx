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
import { JuryAuditContent } from "./JuryAudit";

const START: Pillars = { design: 8, usability: 8, creativity: 8, content: 8 };

/**
 * Where the round button sits, and so where the card grows from: its centre is
 * 50 px in from the card's bottom-right corner at every size. The card is
 * inset 0 on phones (full screen), 16 px from md and 24 px from lg.
 */
const BUTTON_POS = "right-4 bottom-4 md:right-8 md:bottom-8 lg:right-10 lg:bottom-10";
const ORIGIN = "calc(100% - 50px) calc(100% - 50px)";

/**
 * The Evaluate tool, for jury members only: a round button that expands into
 * one card holding the site's technical report and the score form. Desktop:
 * a card filling the screen below the navbar, report left, form right.
 * Phones: full screen, with Score / Report tabs. The button stays in the
 * card's corner and closes it.
 */
function Evaluate({ slug, title }: { slug: string; title: string }) {
  const me = useQuery(api.jury.me, {});
  const state = useQuery(api.jury.myEvaluation, me ? { slug } : "skip");
  const audit = useQuery(api.audits.forJuror, me ? { slug } : "skip");
  const save = useMutation(api.jury.evaluate);
  const declare = useMutation(api.conflicts.declare);

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"score" | "report">("score");
  const [scores, setScores] = useState<Pillars>(START);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const loaded = useRef(false);
  const cardId = useId();
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

  // While open: Escape closes, and the page behind doesn't scroll.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = before;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!me) return null;

  const average = weightedScore(scores);
  const length = comment.trim().length;
  const blocked = state?.blocked ?? null;
  const hasSaved = Boolean(state?.evaluation);
  const perf = audit?.mobile?.scores.performance;

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

  async function onConflict() {
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
  }

  const form =
    state === undefined ? (
      <p className="text-sm text-black/55">Loading…</p>
    ) : blocked ? (
      <p className="text-sm">{blocked}</p>
    ) : (
      <form onSubmit={onSubmit} className="grid gap-6">
        <div className="grid gap-5">
          {PILLARS.map((p) => (
            <label key={p.key} className="grid gap-2">
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
                onChange={(e) => {
                  setSavedAt(null);
                  setError(null);
                  setScores((s) => ({ ...s, [p.key]: Math.round(Number(e.target.value) * 10) / 10 }));
                }}
                className="w-full cursor-pointer accent-black"
              />
            </label>
          ))}
        </div>
        <p className="flex items-baseline justify-between border-y border-black/10 py-4">
          <span className="eyebrow text-black">Your score</span>
          <span className="font-mono text-3xl font-semibold tabular-nums">{average.toFixed(2)}</span>
        </p>
        <label className="grid gap-2">
          <span className="flex items-baseline justify-between">
            <span className="eyebrow text-black">
              Comment <span className="text-black/60">(optional)</span>
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
          className="min-h-[50px] rounded-full bg-black px-5 text-[11.5px] font-semibold tracking-[0.05em] text-white uppercase disabled:opacity-60"
        >
          {busy ? "Saving…" : hasSaved ? "Update evaluation" : "Save evaluation"}
        </button>
        {savedAt && (
          <p role="status" className="text-xs text-black/60">
            Saved. Your score and comment appear on this page when judging closes. You can change them until voting
            closes.
          </p>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => void onConflict()}
          className="justify-self-start text-xs text-black/55 underline underline-offset-4 hover:text-black"
        >
          I have a conflict of interest with this site
        </button>
      </form>
    );

  return (
    <>
      {/* Dims the page behind the card (desktop, where the page still shows round it). */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-30 hidden bg-white/55 backdrop-blur-sm transition-opacity duration-500 md:block",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* The card grows out of the round button: a circle clip that widens from its centre. */}
      <section
        id={cardId}
        role="dialog"
        aria-modal="true"
        aria-label={`Jury evaluation of ${title}`}
        aria-hidden={!open}
        inert={!open}
        style={{ clipPath: `circle(${open ? "150%" : "34px"} at ${ORIGIN})` }}
        className={cn(
          "fixed inset-0 z-[60] flex flex-col overflow-hidden bg-white transition-[clip-path,visibility] duration-[600ms] ease-[cubic-bezier(0.7,0,0.2,1)] motion-reduce:transition-none",
          "md:top-[104px] md:right-4 md:bottom-4 md:left-4 md:z-40 md:rounded-[28px] md:border md:border-black/10",
          "lg:right-6 lg:bottom-6 lg:left-6",
          open ? "visible" : "invisible",
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-black/10 px-5 py-4 md:px-8 md:py-5">
          <JurorAvatar url={me.imageUrl} size={40} />
          <div className="min-w-0 flex-1">
            <p className="eyebrow">Jury evaluation</p>
            <p className="truncate text-xl font-semibold tracking-[-0.03em] md:text-2xl">{title}</p>
          </div>
          {perf !== undefined && perf !== null && (
            <p className="hidden font-mono text-[11px] tracking-[0.06em] text-black/55 uppercase sm:block">
              Mobile performance <span className="text-black">{perf}</span>
            </p>
          )}
        </div>

        {/* Phones: one panel at a time. */}
        <div role="tablist" aria-label="Evaluation" className="flex gap-2 border-b border-black/10 px-5 py-3 md:hidden">
          {(
            [
              ["score", "Score"],
              ["report", "Technical report"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "min-h-[38px] rounded-full px-4 text-[11px] font-semibold tracking-[0.05em] uppercase",
                tab === key ? "bg-black text-white" : "border border-black/12 text-black/70",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Body: report left, form right (stacked as tabs on phones). */}
        <div className="grid min-h-0 flex-1 md:grid-cols-12">
          <div
            className={cn(
              "min-h-0 overflow-y-auto overscroll-contain px-5 py-6 pb-28 md:col-span-7 md:block md:border-r md:border-black/10 md:px-8 md:py-8 md:pb-10 lg:col-span-8",
              tab === "report" ? "block" : "hidden",
            )}
          >
            <JuryAuditContent audit={audit ?? null} />
          </div>
          <div
            className={cn(
              "min-h-0 overflow-y-auto overscroll-contain px-5 py-6 pb-28 md:col-span-5 md:block md:px-8 md:py-8 md:pb-32 lg:col-span-4",
              tab === "score" ? "block" : "hidden",
            )}
          >
            {form}
          </div>
        </div>
      </section>

      {/* The round button: Evaluate on the page, Close in the card's corner. */}
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={cardId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed z-[61] grid size-[68px] place-items-center rounded-full text-[10.5px] font-semibold tracking-[0.06em] uppercase transition-[transform,background-color,color] duration-300 hover:-translate-y-0.5 active:scale-95 md:z-[41]",
          BUTTON_POS,
          // White hairline so the black circle stays visible over dark screenshots.
          open ? "border border-black bg-white text-black" : "border border-white/40 bg-black text-white",
        )}
      >
        {open ? "Close" : hasSaved ? "Edit" : "Evaluate"}
      </button>
    </>
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
