"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth, useClerk, useSignIn, useSignUp, useUser } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex-helpers-api";
import { friendlyError } from "@/lib/errors";
import {
  CodeInput,
  Divider,
  Field,
  FormError,
  GoogleButton,
  SubmitButton,
  TextButton,
  errorMessage,
  inputClass,
} from "@/components/auth/AuthUI";

// The one-screen submission: site name, link and email. The pre-submission is
// saved first (unverified), then a 6-digit email code signs the person in or
// up, then the submission is tied to the account (convex/quickSubmit.ts).
// Already signed-in people skip the code. Google is offered only outside
// in-app browsers (Instagram, Facebook… block Google sign-in).

const DRAFT_KEY = "quick-submit";
const DRAFT_TTL = 2 * 24 * 3600_000;

type Draft = { id: string; token: string; name: string; url: string; email: string; at: number };
type Phase = "form" | "code" | "finishing" | "done";

function newToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** A long random password, for Clerk setups that still require one (the person never needs it: they log in with a code). */
function randomPassword() {
  return `${newToken().slice(0, 24)}Aa1!`;
}

function readDraft(): Draft | null {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null") as Draft | null;
    return d && Date.now() - d.at < DRAFT_TTL ? d : null;
  } catch {
    return null;
  }
}
function saveDraft(d: Draft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    // storage blocked (private mode): the flow still works in this tab
  }
}
function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // nothing to clear
  }
}

/** The in-app browser we're in, if any. */
function inAppBrowser(): "instagram" | "facebook" | "tiktok" | "linkedin" | "threads" | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  if (/Instagram/i.test(ua)) return "instagram";
  if (/Barcelona/i.test(ua)) return "threads";
  if (/FBAN|FBAV|FB_IAB|FBIOS|FB4A/i.test(ua)) return "facebook";
  if (/musical_ly|TikTok|BytedanceWebview/i.test(ua)) return "tiktok";
  if (/LinkedInApp/i.test(ua)) return "linkedin";
  return null;
}

/** This page in the phone's real browser, carrying the draft so it can pick up there. */
function externalHref(d: Draft | null) {
  const url = new URL(window.location.href);
  url.search = "";
  if (d) {
    url.searchParams.set("d", d.id);
    url.searchParams.set("t", d.token);
  }
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) {
    return `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url.toString())};end`;
  }
  // iOS 17+ opens x-safari-https links in Safari.
  return url.toString().replace(/^https:/, "x-safari-https:");
}

function sourceOf(params: URLSearchParams, app: string | null) {
  return params.get("utm_source") || app || "direct";
}

export function QuickSubmit() {
  const params = useSearchParams();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { setActive } = useClerk();
  const { isLoaded: signInLoaded, signIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp } = useSignUp();
  const { isAuthenticated } = useConvexAuth();
  // A new account reaches the database through Clerk's webhook a moment after sign-up.
  const account = useQuery(api.users.getCurrentUser, isAuthenticated ? {} : "skip");
  const accountReady = isAuthenticated && !!account;

  const start = useMutation(api.quickSubmit.start);
  const finalize = useMutation(api.quickSubmit.finalize);
  const track = useMutation(api.quickSubmit.track);

  const [phase, setPhase] = useState<Phase>("form");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pending, setPending] = useState<null | "form" | "google" | "code" | "resend">(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [app, setApp] = useState<ReturnType<typeof inAppBrowser>>(null);
  const [submittedName, setSubmittedName] = useState("");
  const started = useRef(false);
  const finalizing = useRef(false);

  // Restore: this browser's draft, or one handed over from an in-app browser (?d=&t=).
  const handoff = params.get("d") && params.get("t") ? { id: params.get("d")!, token: params.get("t")! } : null;
  const peeked = useQuery(api.quickSubmit.peek, handoff ?? "skip");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser-only state once
    setApp(inAppBrowser());
    const d = readDraft();
    if (d) {
      setDraft(d);
      setName(d.name);
      setUrl(d.url);
      setEmail(d.email);
      // Back from Google: finish it.
      if (params.get("resume")) setPhase("finishing");
    }
  }, [params]);
  useEffect(() => {
    if (!handoff || !peeked || peeked.status !== "unverified") return;
    const d: Draft = { ...handoff, name: peeked.name, url: peeked.url, email: peeked.email, at: Date.now() };
    saveDraft(d);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the handed-over draft arrives from the query
    setDraft(d);
    setName(d.name);
    setUrl(d.url);
    setEmail(d.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per handed-over draft
  }, [peeked]);

  // Signed in: their account email, not editable.
  const accountEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors the signed-in account
    if (isSignedIn && accountEmail) setEmail(accountEmail);
  }, [isSignedIn, accountEmail]);

  const onFirstInput = useCallback(() => {
    if (started.current) return;
    started.current = true;
    void track({ event: "form_start" }).catch(() => {});
  }, [track]);

  // Signed in and a draft to finish: tie it to the account.
  useEffect(() => {
    if (phase !== "finishing" || !accountReady || !draft || finalizing.current) return;
    finalizing.current = true;
    finalize({ id: draft.id, token: draft.token })
      .then((r) => {
        clearDraft();
        setSubmittedName(r.name);
        setPhase("done");
      })
      .catch((err) => {
        setError(friendlyError(err));
        setPhase("form");
      })
      .finally(() => {
        finalizing.current = false;
      });
  }, [phase, accountReady, draft, finalize]);

  /** Save the pre-submission (unverified). Reuses this browser's secret for the same site. */
  async function saveRemote(): Promise<Draft> {
    const token = draft && draft.url === url.trim() ? draft.token : newToken();
    const { id } = await start({
      name: name.trim(),
      url: url.trim(),
      email: email.trim(),
      token,
      source: sourceOf(params, app),
      website: honeypot || undefined,
    });
    const d: Draft = { id, token, name: name.trim(), url: url.trim(), email: email.trim(), at: Date.now() };
    saveDraft(d);
    setDraft(d);
    return d;
  }

  /** Email code: log in if the account exists, else sign up. */
  async function sendCode(address: string) {
    if (!signIn || !signUp) throw new Error("Not ready");
    try {
      const si = await signIn.create({ identifier: address });
      const factor = si.supportedFirstFactors?.find((f) => f.strategy === "email_code");
      if (!factor || !("emailAddressId" in factor)) throw new Error("Email codes are not available for this account.");
      await signIn.prepareFirstFactor({ strategy: "email_code", emailAddressId: factor.emailAddressId });
      setMode("signin");
    } catch (err) {
      if (!(isClerkAPIResponseError(err) && err.errors[0]?.code === "form_identifier_not_found")) throw err;
      const su = await signUp.create({ emailAddress: address });
      if (su.missingFields?.includes("password")) await signUp.update({ password: randomPassword() });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setMode("signup");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending("form");
    setError(null);
    try {
      await saveRemote();
      if (isSignedIn) {
        setPhase("finishing");
        return;
      }
      await sendCode(email.trim());
      void track({ event: "verify_start" }).catch(() => {});
      setCode("");
      setPhase("code");
    } catch (err) {
      setError(isClerkAPIResponseError(err) ? errorMessage(err) : friendlyError(err));
    } finally {
      setPending(null);
    }
  }

  async function onCode(e: React.FormEvent) {
    e.preventDefault();
    if (pending || !signIn || !signUp) return;
    setPending("code");
    setError(null);
    try {
      const res =
        mode === "signin"
          ? await signIn.attemptFirstFactor({ strategy: "email_code", code })
          : await signUp.attemptEmailAddressVerification({ code });
      if (res.status !== "complete" || !res.createdSessionId) {
        setError("We couldn't finish signing you in. Send a new code and try again.");
        return;
      }
      await setActive({ session: res.createdSessionId });
      void track({ event: "verify_success" }).catch(() => {});
      setPhase("finishing");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(null);
    }
  }

  async function onResend() {
    setPending("resend");
    setError(null);
    setNotice(null);
    try {
      await sendCode(email.trim());
      setNotice("A new code is on its way.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(null);
    }
  }

  async function onGoogle() {
    if (!signIn) return;
    const form = document.getElementById("quick-submit-form") as HTMLFormElement | null;
    if (form && !form.reportValidity()) return;
    setPending("google");
    setError(null);
    try {
      await saveRemote();
      void track({ event: "verify_start" }).catch(() => {});
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/submit?resume=1",
      });
    } catch (err) {
      setError(isClerkAPIResponseError(err) ? errorMessage(err) : friendlyError(err));
      setPending(null);
    }
  }

  const ready = authLoaded && signInLoaded && signUpLoaded;
  const showGoogle = !isSignedIn && app === null;

  if (phase === "done") {
    return (
      <div className="grid gap-6">
        <p className="eyebrow">Submitted</p>
        <h2 className="text-[clamp(2rem,6vw,3rem)] leading-[1] font-semibold tracking-[-0.05em]">Thank you. {submittedName} is in.</h2>
        <p className="text-[15px] leading-relaxed text-black/70">
          Our editors review every site by hand and prepare its listing. When it goes live for a week of jury voting, we
          email you at <strong className="text-black">{accountEmail || email}</strong>.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/account"
            className="inline-flex min-h-[50px] items-center rounded-full bg-black px-6 text-[12px] font-semibold tracking-[0.05em] text-white uppercase"
          >
            Your account
          </Link>
          <button
            type="button"
            onClick={() => {
              setName("");
              setUrl("");
              setDraft(null);
              setPhase("form");
            }}
            className="inline-flex min-h-[50px] items-center rounded-full border border-black/14 px-6 text-[12px] font-semibold tracking-[0.05em] uppercase hover:border-black"
          >
            Submit another
          </button>
        </div>
      </div>
    );
  }

  if (phase === "finishing") {
    return (
      <div className="grid gap-3" role="status">
        <p className="eyebrow">One moment</p>
        <p className="text-2xl font-semibold tracking-[-0.04em]">Sending your site…</p>
        <FormError message={error} />
      </div>
    );
  }

  if (phase === "code") {
    return (
      <form onSubmit={onCode} className="grid gap-5">
        <div className="grid gap-2">
          <p className="eyebrow">Last step</p>
          <h2 className="text-[clamp(1.75rem,6vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.045em]">Check your email</h2>
          <p className="text-[15px] leading-relaxed text-black/70">
            We sent a 6-digit code to <strong className="text-black">{email}</strong>. Enter it to send your site.
          </p>
        </div>
        <CodeInput value={code} onChange={setCode} disabled={pending === "code"} />
        <FormError message={error} />
        {notice && (
          <p role="status" className="text-sm text-black/60">
            {notice}
          </p>
        )}
        <SubmitButton pending={pending === "code"} disabled={code.length !== 6}>
          Verify and submit
        </SubmitButton>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TextButton onClick={() => void onResend()} disabled={pending !== null}>
            Send a new code
          </TextButton>
          <TextButton
            onClick={() => {
              setPhase("form");
              setError(null);
            }}
          >
            Use a different email
          </TextButton>
        </div>
        {app && (
          <p className="text-xs leading-relaxed text-black/55">
            No code? Check spam, or{" "}
            <a href={externalHref(draft)} className="underline underline-offset-4">
              open this page in your browser
            </a>{" "}
            to continue there (or tap ••• and choose Open in browser).
          </p>
        )}
      </form>
    );
  }

  return (
    <form id="quick-submit-form" onSubmit={onSubmit} onFocus={onFirstInput} className="grid gap-5" noValidate={false}>
      <Field id="qs-name" label="Site name">
        <input
          id="qs-name"
          required
          maxLength={80}
          autoComplete="organization"
          placeholder="Studio Nord"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field id="qs-url" label="Website link">
        <input
          id="qs-url"
          required
          inputMode="url"
          autoComplete="url"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="studionord.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field id="qs-email" label="Your email" aside={isSignedIn ? <span className="text-xs text-black/50">Signed in</span> : undefined}>
        <input
          id="qs-email"
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="you@studionord.com"
          value={email}
          readOnly={!!isSignedIn}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </Field>
      {/* Hidden from people; bots fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="qs-website">Leave this empty</label>
        <input id="qs-website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      <FormError message={error} />
      <SubmitButton pending={pending === "form"} disabled={!ready}>
        {isSignedIn ? "Submit site" : "Send me a code"}
      </SubmitButton>
      {showGoogle && (
        <>
          <Divider />
          <GoogleButton onClick={() => void onGoogle()} pending={pending === "google"} disabled={!ready || pending !== null} />
        </>
      )}
      <p className="text-xs leading-relaxed text-black/50">
        {isSignedIn
          ? "We'll email you when it goes live."
          : "No password: we email you a 6-digit code to confirm it's you, and that creates your free account."}{" "}
        By submitting you agree to our <Link href="/terms" className="underline underline-offset-4">terms</Link>.
      </p>
      {/* Clerk's bot protection for new accounts. */}
      <div id="clerk-captcha" />
    </form>
  );
}
