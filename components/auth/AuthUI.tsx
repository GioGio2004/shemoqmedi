"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { ArrowIcon } from "@/components/site/ui";
import { cn } from "@/lib/utils";

// Building blocks for our own log-in and sign-up forms (Clerk hooks, our UI):
// white surface, black text, hairline borders, uppercase pill buttons.

export const inputClass =
  "w-full min-h-[50px] rounded-2xl border border-black/14 bg-white px-4 text-[15px] outline-none transition-colors placeholder:text-black/35 focus:border-black disabled:bg-black/[0.03]";

export function Field({
  id,
  label,
  aside,
  children,
}: {
  id: string;
  label: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="eyebrow text-black">
          {label}
        </label>
        {aside}
      </div>
      {children}
    </div>
  );
}

/** Full-width black pill with the round arrow badge (Kencho style). */
export function SubmitButton({
  pending,
  disabled,
  children,
}: {
  pending?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending || undefined}
      className="group inline-flex min-h-[52px] w-full items-center justify-between gap-3.5 rounded-full bg-black py-1 pr-1.5 pl-6 text-[12px] font-semibold tracking-[0.05em] text-white uppercase transition-[transform,opacity] duration-200 active:scale-[0.99] disabled:opacity-50"
    >
      <span>{pending ? "One moment…" : children}</span>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-black transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        <ArrowIcon />
      </span>
    </button>
  );
}

/** Outline pill for "Continue with Google". Monochrome mark to stay black and white. */
export function GoogleButton({
  onClick,
  pending,
  disabled,
}: {
  onClick: () => void;
  pending?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending || disabled}
      // The site's crow may land on top of this pill (crow/roam.ts).
      data-crow-perch=""
      className="inline-flex min-h-[52px] w-full items-center justify-center gap-3 rounded-full border border-black/14 bg-white px-6 text-[12px] font-semibold tracking-[0.05em] uppercase transition-colors hover:border-black disabled:opacity-50"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]" fill="currentColor">
        <path d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.96S8.78 6.26 12 6.26c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.68 3.7 14.55 2.75 12 2.75 6.9 2.75 2.75 6.9 2.75 12S6.9 21.25 12 21.25c5.34 0 8.88-3.75 8.88-9.04 0-.6-.07-1.07-.15-1.53Z" />
      </svg>
      {pending ? "Redirecting…" : "Continue with Google"}
    </button>
  );
}

export function Divider() {
  return (
    <div className="flex items-center gap-4" aria-hidden="true">
      <span className="h-px flex-1 bg-black/10" />
      <span className="eyebrow">or</span>
      <span className="h-px flex-1 bg-black/10" />
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-2xl border border-black px-4 py-3 text-sm leading-snug">
      {message}
    </p>
  );
}

export function TextButton({
  onClick,
  disabled,
  className,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "text-[13px] text-black/60 underline-offset-4 hover:text-black hover:underline disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Six-digit email code input. */
export function CodeInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <input
      id="code"
      name="code"
      inputMode="numeric"
      autoComplete="one-time-code"
      autoFocus
      required
      maxLength={6}
      pattern="[0-9]{6}"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
      className={cn(inputClass, "text-center font-mono text-2xl tracking-[0.5em]")}
      aria-label="Six-digit code"
    />
  );
}

/**
 * Where Clerk sends a session that still has a task to finish (reset a
 * password, set up 2FA, pick an organization). Such a "pending" session is
 * signed in for Clerk's API but signed out for the site, so without this page
 * people were stuck between /account and "You are already logged in".
 */
export const TASKS_PATH = "/session-tasks";

export function tasksHref(redirect: string) {
  return `${TASKS_PATH}?redirect_url=${encodeURIComponent(redirect)}`;
}

/** The "already logged in" error from Clerk. */
export function isSessionExists(err: unknown) {
  return isClerkAPIResponseError(err) && err.errors[0]?.code === "session_exists";
}

const BOUNCE_KEY = "auth-bounces";

/**
 * Counts automatic redirects off the log-in page. If the server keeps sending
 * a signed-in browser back here (its session cookie never arrives), the page
 * stops redirecting after a few tries instead of looping.
 */
function bounced(): boolean {
  try {
    const now = Date.now();
    const recent = (JSON.parse(sessionStorage.getItem(BOUNCE_KEY) ?? "[]") as number[]).filter((t) => now - t < 20_000);
    recent.push(now);
    sessionStorage.setItem(BOUNCE_KEY, JSON.stringify(recent));
    return recent.length > 2;
  } catch {
    return false;
  }
}

/**
 * For the log-in and sign-up pages: once a session exists, go to `redirect`,
 * or first to the task page while the session is pending. Returns `go` (call
 * it after setActive, or on Clerk's "already logged in" error) and `stuck`
 * (the redirect keeps bouncing back: offer to log out instead).
 */
export function useAfterAuth(redirect: string) {
  const { isSignedIn, sessionId } = useAuth({ treatPendingAsSignedOut: false });
  const clerk = useClerk();
  const router = useRouter();
  const [stuck, setStuck] = useState(false);

  const go = useCallback(() => {
    if (bounced()) {
      setStuck(true);
      return;
    }
    const pending = clerk.session?.status === "pending" || !!clerk.session?.currentTask;
    router.replace(pending ? tasksHref(redirect) : redirect);
  }, [clerk, redirect, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- only sets state when the redirect loops
    if (isSignedIn) go();
  }, [isSignedIn, sessionId, go]);

  return { go, stuck };
}

/** Shown when a signed-in browser keeps landing on the log-in page. */
export function StuckSession({ redirect }: { redirect: string }) {
  const { signOut } = useClerk();
  const [busy, setBusy] = useState(false);
  return (
    <div role="alert" className="grid gap-4 rounded-2xl border border-black px-4 py-4 text-sm leading-snug">
      <p>You are logged in, but this browser could not confirm it. Log out, then log in again.</p>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          try {
            sessionStorage.removeItem(BOUNCE_KEY);
          } catch {
            // storage blocked: nothing to clear
          }
          void signOut({ redirectUrl: `/sign-in?redirect_url=${encodeURIComponent(redirect)}` });
        }}
        className="min-h-[46px] rounded-full bg-black px-5 text-[11.5px] font-semibold tracking-[0.05em] text-white uppercase disabled:opacity-60"
      >
        {busy ? "Logging out…" : "Log out"}
      </button>
    </div>
  );
}

/** Readable message from a Clerk API error (or anything else thrown). */
export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again.") {
  if (isClerkAPIResponseError(err)) {
    const first = err.errors[0];
    switch (first?.code) {
      case "form_identifier_not_found":
        return "There is no account with this email. Create one instead.";
      case "form_identifier_exists":
        return "This email already has an account. Log in instead.";
      case "form_password_incorrect":
        return "Wrong password. Try again or log in with an email code.";
      case "form_code_incorrect":
        return "That code is not right. Check the email and try again.";
      case "verification_expired":
        return "That code has expired. Send a new one.";
      case "session_exists":
        return "You are already logged in.";
      default:
        return first?.longMessage ?? first?.message ?? fallback;
    }
  }
  return fallback;
}

/**
 * Where to go after auth. Only same-origin paths are allowed, so the
 * ?redirect_url= set by proxy.ts cannot send people to another site.
 */
export function safeRedirect(raw: string | null, fallback: string) {
  if (!raw) return fallback;
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  try {
    const url = new URL(raw);
    if (typeof window !== "undefined" && url.origin === window.location.origin) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    // not a URL
  }
  return fallback;
}
