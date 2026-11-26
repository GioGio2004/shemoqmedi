"use client";

import Link from "next/link";
import { Dialog } from "radix-ui";
import { ArrowIcon } from "@/components/site/ui";
import { cn } from "@/lib/utils";

// Shown when "Submit my project" is pressed with valid fields: what we list,
// and the Terms checkbox. Nothing is saved until "Submit my project" here.
// A bottom sheet on phones, a centred card from md up.

export const GUIDELINES = [
  "We list original websites with a creative idea of their own: design, typography, motion, interaction and craft.",
  "Sites submitted only for commercial promotion or a backlink, and template sites without a creative direction of their own, are declined by our team.",
  "Submitting, listing, jury scores and awards are free. None of them can be bought.",
] as const;

export function SubmitGuidelines({
  open,
  onOpenChange,
  agreed,
  onAgreedChange,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreed: boolean;
  onAgreedChange: (agreed: boolean) => void;
  pending: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-[90] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none"
          style={{ background: "rgb(0 0 0 / 0.55)" }}
        />
        <Dialog.Content
          aria-describedby="guidelines-intro"
          className={cn(
            "fixed inset-x-0 bottom-0 z-[91] grid max-h-[92dvh] gap-6 overflow-y-auto rounded-t-[28px] border border-black/12 bg-white px-6 pt-7 pb-[max(1.75rem,env(safe-area-inset-bottom))] text-black shadow-2xl outline-none",
            "md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:w-[min(34rem,calc(100vw-3rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[28px] md:p-9",
            "duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 motion-reduce:animate-none",
          )}
        >
          <div className="grid gap-3">
            <p className="eyebrow">Before you submit</p>
            <Dialog.Title className="text-[clamp(1.9rem,6vw,2.5rem)] leading-[1] font-semibold tracking-[-0.05em]">
              Earned, not bought.
            </Dialog.Title>
            <p id="guidelines-intro" className="text-[15px] leading-relaxed text-black/70">
              Shemoqmedi is a creative space. Every site is reviewed by hand, and awards and recognition here are earned
              through the work.
            </p>
          </div>

          <ul className="grid gap-3 border-y border-black/10 py-5 text-[14px] leading-relaxed text-black/75">
            {GUIDELINES.map((g) => (
              <li key={g} className="flex gap-3">
                <span aria-hidden="true" className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-black" />
                <span>{g}</span>
              </li>
            ))}
          </ul>

          <label htmlFor="qs-terms" className="flex cursor-pointer items-start gap-3 text-[14px] leading-snug">
            <input
              id="qs-terms"
              type="checkbox"
              checked={agreed}
              onChange={(e) => onAgreedChange(e.target.checked)}
              className="mt-0.5 size-5 shrink-0 cursor-pointer accent-black"
            />
            <span>
              I agree to the{" "}
              <Link href="/terms#submissions" target="_blank" className="underline underline-offset-4">
                Terms and Conditions
              </Link>{" "}
              and the submission guidelines above.
            </span>
          </label>

          <div className="grid gap-3">
            <button
              type="button"
              onClick={onConfirm}
              disabled={!agreed || pending}
              aria-busy={pending || undefined}
              className="group inline-flex min-h-[52px] w-full items-center justify-between gap-3.5 rounded-full bg-black py-1 pr-1.5 pl-6 text-[12px] font-semibold tracking-[0.05em] text-white uppercase transition-[transform,opacity] duration-200 active:scale-[0.99] disabled:opacity-40"
            >
              <span>{pending ? "One moment…" : "Submit my project"}</span>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-black transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowIcon />
              </span>
            </button>
            <Dialog.Close
              disabled={pending}
              className="justify-self-center text-[13px] text-black/60 underline-offset-4 hover:text-black hover:underline disabled:opacity-40"
            >
              Go back
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
