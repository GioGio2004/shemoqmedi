"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Authenticated, AuthLoading, Unauthenticated, useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@/convex-helpers-api";
import { LIMITS } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";
import { ArrowIcon } from "@/components/site/ui";

const panel = "rounded-3xl border border-black/10 p-6 md:p-8";
const input =
  "w-full min-h-[46px] rounded-xl border border-black/14 bg-white px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-black/35 focus:border-black";

/** Removal requests go through the same review queue, marked with this prefix. */
const REMOVAL_PREFIX = "Removal request: ";

type Intent = "claim" | "removal";

function errorMessage(err: unknown) {
  if (err instanceof ConvexError) return String(err.data);
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

/**
 * "This is mine": claim an unclaimed listing or creator profile, or (for a
 * listing) ask for it to be removed. An admin reviews every request.
 */
export function ClaimForm(props: {
  targetType: "listing" | "creator";
  slug: string;
  name: string;
  initialIntent?: Intent;
  backHref: string;
}) {
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
        <Form {...props} />
      </Authenticated>
    </>
  );
}

function Form({
  targetType,
  slug,
  name,
  initialIntent = "claim",
  backHref,
}: {
  targetType: "listing" | "creator";
  slug: string;
  name: string;
  initialIntent?: Intent;
  backHref: string;
}) {
  const submit = useMutation(api.claims.submit);
  const ids = useId();
  const [intent, setIntent] = useState<Intent>(targetType === "listing" ? initialIntent : "claim");
  const [message, setMessage] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const removal = intent === "removal";
  const maxLength = LIMITS.claimMessage - (removal ? REMOVAL_PREFIX.length : 0);

  if (status === "done") {
    return (
      <div className={panel} role="status">
        <p className="eyebrow">{removal ? "Removal requested" : "Claim received"}</p>
        <p className="mt-3 text-3xl font-semibold tracking-[-0.045em]">Thank you.</p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-black/60">
          We&apos;ll review your {removal ? "request" : "claim"} and email you.
        </p>
        <Link
          href={backHref}
          className="mt-6 inline-block text-sm font-medium underline underline-offset-[5px]"
        >
          ← Back to {name}
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status !== "idle") return;
    const text = message.trim();
    if (!text) {
      setError("Please write a short message.");
      return;
    }
    if (text.length > maxLength) {
      setError(`Your message must be ${maxLength} characters or less.`);
      return;
    }
    setStatus("saving");
    setError(null);
    try {
      await submit({
        targetType,
        slug,
        message: removal ? `${REMOVAL_PREFIX}${text}` : text,
        proofUrl: proofUrl.trim() || undefined,
      });
      setStatus("done");
    } catch (err) {
      setError(errorMessage(err));
      setStatus("idle");
    }
  }

  const messageId = `${ids}-message`;
  const counterId = `${ids}-counter`;
  const proofId = `${ids}-proof`;

  return (
    <form onSubmit={onSubmit} className={cn(panel, "grid gap-7")} noValidate>
      {targetType === "listing" && (
        <fieldset className="grid gap-3">
          <legend className="eyebrow mb-3 text-black">What would you like to do?</legend>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["claim", "Claim this project"],
                ["removal", "Request removal"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={cn(
                  "inline-flex h-9 cursor-pointer items-center rounded-full border px-4 text-[11px] font-medium tracking-[0.04em] uppercase transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-black",
                  intent === value
                    ? "border-black bg-black text-white"
                    : "border-black/12 text-black hover:border-black",
                )}
              >
                <input
                  type="radio"
                  name={`${ids}-intent`}
                  value={value}
                  checked={intent === value}
                  onChange={() => setIntent(value)}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="grid gap-2">
        <label htmlFor={messageId} className="eyebrow text-black">
          Message
        </label>
        <textarea
          id={messageId}
          required
          rows={6}
          maxLength={maxLength}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-describedby={counterId}
          placeholder={
            removal
              ? "Tell us why this listing should be removed and how you're connected to it."
              : targetType === "creator"
                ? "Tell us who you are and how we can verify this profile is yours."
                : "Tell us your role on the project and how we can verify it."
          }
          className={cn(input, "resize-y leading-relaxed")}
        />
        <p id={counterId} className="text-right text-xs text-black/55 tabular-nums">
          {message.length} / {maxLength} characters
        </p>
      </div>

      <div className="grid gap-2">
        <label htmlFor={proofId} className="eyebrow text-black">
          Proof link <span className="text-black/45 normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id={proofId}
          type="url"
          inputMode="url"
          autoComplete="url"
          value={proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          placeholder="https://github.com/you/project or a page that credits you"
          className={input}
        />
        <p className="text-xs text-black/55">
          A repository, a credits page, or a profile that links to the site.
        </p>
      </div>

      <div className="flex flex-col gap-4 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-xs text-black/55">
          Every request is reviewed by hand. We reply by email.
        </p>
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
            {status === "saving" ? "Sending…" : removal ? "Request removal" : "Submit claim"}
            <span className="grid size-9 place-items-center rounded-full bg-white text-black">
              <ArrowIcon />
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
