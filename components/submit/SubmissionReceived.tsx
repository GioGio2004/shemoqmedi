"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useClerk, useSignIn, useSignUp, useUser } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api, type SubmissionEvent } from "@/convex-helpers-api";
import { friendlyError } from "@/lib/errors";
import { funnelSource, inAppBrowser, randomPassword, readRef, saveRef, type SubmissionRef } from "@/lib/submission";
import {
  CodeInput,
  Divider,
  FormError,
  GoogleButton,
  SubmitButton,
  TextButton,
  errorMessage,
  inputClass,
} from "@/components/auth/AuthUI";

// After the submission is saved: the confirmation, then an optional sign-in
// (Clerk email code, or Google outside in-app browsers) to track it. The
// submission never depends on this. Once signed in, the server links it only
// if the account's verified email is the submitted one (quickSubmit.link).
//
// The reference comes from this browser (saved by the form) or from the
// confirmation email's link (?r=&k=), which is moved into storage and removed
// from the address bar. The email itself is never in the URL.

const RESEND_SECONDS = 30;
const BACK_FROM_GOOGLE = "/submit/received?from=google";

type Step = "offer" | "code" | "skipped";
type LinkResult = { status: "linked" | "mismatch" | "taken" | "not_found"; submittedEmail: string | null };

const primaryButton =
  "inline-flex min-h-[50px] items-center rounded-full bg-black px-6 text-[12px] font-semibold tracking-[0.05em] text-white uppercase";
const secondaryButton =
  "inline-flex min-h-[50px] items-center rounded-full border border-black/14 px-6 text-[12px] font-semibold tracking-[0.05em] uppercase hover:border-black";

export function SubmissionReceived() {
  const router = useRouter();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { setActive, signOut } = useClerk();
  const { isLoaded: signInLoaded, signIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp } = useSignUp();
  const { isAuthenticated } = useConvexAuth();
  // A new account reaches the database through Clerk's webhook a moment after sign-up.
  const account = useQuery(api.users.getCurrentUser, isAuthenticated ? {} : "skip");
  const accountReady = isAuthenticated && !!account;

  const linkMutation = useMutation(api.quickSubmit.link);
  const correctEmail = useMutation(api.quickSubmit.correctEmail);
  const track = useMutation(api.quickSubmit.track);
  const send = (event: SubmissionEvent) => void track({ event, source: funnelSource() }).catch(() => {});

  const [ref, setRef] = useState<SubmissionRef | null | undefined>(undefined);
  const [step, setStep] = useState<Step>("offer");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [pending, setPending] = useState<null | "code" | "verify" | "resend" | "google">(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [app, setApp] = useState<ReturnType<typeof inAppBrowser>>(null);
  const [linked, setLinked] = useState<LinkResult | null>(null);
  // Signed in on this page (code or Google): go to the dashboard once linked.
  const [authedHere, setAuthedHere] = useState(false);
  const linking = useRef(false);
  const viewed = useRef(false);

  // The reference: from the email link (stored once the server accepts it), else this browser's.
  const fromLink = useRef(false);
  useEffect(() => {
    const url = new URL(window.location.href);
    const r = url.searchParams.get("r");
    const k = url.searchParams.get("k");
    let found = readRef();
    if (r && k && /^[a-f0-9]{64}$/.test(k)) {
      found = { id: r, token: k, at: Date.now() };
      fromLink.current = true;
      url.searchParams.delete("r");
      url.searchParams.delete("k");
      window.history.replaceState(null, "", url.pathname + url.search);
    }
    if (url.searchParams.get("from") === "google") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- back from Google sign-in
      setAuthedHere(true);
      window.history.replaceState(null, "", url.pathname);
    }
    setRef(found);
    setApp(inAppBrowser());
  }, []);

  const prefill = useQuery(api.quickSubmit.prefill, ref ? { id: ref.id, token: ref.token } : "skip");
  useEffect(() => {
    if (prefill && ref && fromLink.current) {
      fromLink.current = false;
      saveRef({ id: ref.id, token: ref.token });
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the submitted email, once
    if (prefill && !email) setEmail(prefill.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the submission loads
  }, [prefill]);

  // Signed in (already, or just now): link the submission to the account.
  useEffect(() => {
    if (!ref || !accountReady || linked || linking.current) return;
    linking.current = true;
    linkMutation({ id: ref.id, token: ref.token })
      .then((result) => {
        setLinked(result);
        if (result.status === "linked" && authedHere) {
          send("post_submission_auth_completed");
          router.replace("/account?linked=1");
        }
      })
      .catch((err) => setError(friendlyError(err)))
      .finally(() => {
        linking.current = false;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs when the account is ready
  }, [ref, accountReady, linked, authedHere]);

  // The offer was seen (signed-out visitors only).
  const offering = authLoaded && !isSignedIn && !!prefill;
  useEffect(() => {
    if (!offering || viewed.current) return;
    viewed.current = true;
    send("post_submission_auth_viewed");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once
  }, [offering]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  /** Clerk email code: log in if the account exists, else sign up. */
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
    setCooldown(RESEND_SECONDS);
  }

  const fail = (err: unknown) => {
    setError(isClerkAPIResponseError(err) ? errorMessage(err) : friendlyError(err));
    send("post_submission_auth_failed");
  };

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    if (pending || !ref || !prefill) return;
    const address = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(address)) {
      setError("Check your email address. It looks incomplete.");
      return;
    }
    setPending("code");
    setError(null);
    setNotice(null);
    try {
      // A typo in the submitted email: fix it first, so the code goes to the right address.
      if (address !== prefill.email && prefill.canCorrect) await correctEmail({ id: ref.id, token: ref.token, email: address });
      send("post_submission_auth_started");
      await sendCode(address);
      setCode("");
      setStep("code");
    } catch (err) {
      fail(err);
    } finally {
      setPending(null);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    if (pending || !signIn || !signUp) return;
    setPending("verify");
    setError(null);
    try {
      const res =
        mode === "signin"
          ? await signIn.attemptFirstFactor({ strategy: "email_code", code })
          : await signUp.attemptEmailAddressVerification({ code });
      if (res.status !== "complete" || !res.createdSessionId) {
        setError("We couldn't finish signing you in. Send a new code and try again.");
        send("post_submission_auth_failed");
        return;
      }
      setAuthedHere(true);
      await setActive({ session: res.createdSessionId });
    } catch (err) {
      fail(err);
    } finally {
      setPending(null);
    }
  }

  async function onResend() {
    if (cooldown > 0) return;
    setPending("resend");
    setError(null);
    setNotice(null);
    try {
      await sendCode(email.trim().toLowerCase());
      setNotice("A new code is on its way.");
    } catch (err) {
      fail(err);
    } finally {
      setPending(null);
    }
  }

  async function onGoogle() {
    if (!signIn) return;
    setPending("google");
    setError(null);
    send("post_submission_auth_started");
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        // redirect_url also covers a new Google account, which Clerk turns into a sign-up on the callback page.
        redirectUrl: `/sso-callback?redirect_url=${encodeURIComponent(BACK_FROM_GOOGLE)}`,
        redirectUrlComplete: BACK_FROM_GOOGLE,
      });
    } catch (err) {
      fail(err);
      setPending(null);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (ref === undefined || (ref && prefill === undefined)) {
    return <p className="text-sm text-black/55">Loading…</p>;
  }

  if (!ref || !prefill) {
    return (
      <div className="grid gap-5">
        <p className="eyebrow">Submissions</p>
        <h1 className="text-[clamp(2.25rem,8vw,4rem)] leading-[0.95] font-semibold tracking-[-0.055em]">Nothing to show here.</h1>
        <p className="text-[15px] leading-relaxed text-black/70">
          We couldn&apos;t find a submission from this browser. If you sent one, it&apos;s safe with us: sign in with the
          email you used to follow it.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/submit" className={primaryButton}>
            Submit a project
          </Link>
          <Link href="/account" className={secondaryButton}>
            Your account
          </Link>
        </div>
      </div>
    );
  }

  const ready = signInLoaded && signUpLoaded;
  const signedInEmail = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <div className="grid gap-10">
      <header className="grid gap-4">
        <p className="eyebrow">Submission received</p>
        <h1 className="text-[clamp(2.5rem,9vw,4.5rem)] leading-[0.95] font-semibold tracking-[-0.055em]">Your work is in.</h1>
        <p className="text-[15px] leading-relaxed text-black/70">
          Your project has been successfully submitted. Our editorial team will review your work and prepare your listing
          if accepted.
        </p>
        <p className="text-sm text-black/50">
          <span className="font-semibold text-black">{prefill.name}</span>
        </p>
      </header>

      <section aria-labelledby="track-title" className="grid gap-5 border-t border-black/10 pt-8">
        {isSignedIn ? (
          <SignedInState
            result={linked}
            error={error}
            signedInEmail={signedInEmail}
            onSwitch={() => void signOut({ redirectUrl: "/submit/received" })}
          />
        ) : step === "skipped" ? (
          <div className="grid gap-4">
            <h2 id="track-title" className="text-2xl font-semibold tracking-[-0.04em]">
              No problem.
            </h2>
            <p className="text-[15px] leading-relaxed text-black/70">
              Your submission is safe with us. We&apos;ll email <strong className="text-black">{prefill.email}</strong> when
              there&apos;s news. You can sign in any time to follow it.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/" className={primaryButton}>
                Back to the gallery
              </Link>
              <TextButton onClick={() => setStep("offer")}>Track it now instead</TextButton>
            </div>
          </div>
        ) : step === "code" ? (
          <form onSubmit={onVerify} className="grid gap-5">
            <div className="grid gap-2">
              <h2 id="track-title" className="text-2xl font-semibold tracking-[-0.04em]">
                Check your email.
              </h2>
              <p className="text-[15px] leading-relaxed text-black/70">
                We sent a 6-digit code to <strong className="text-black">{email}</strong>.
              </p>
            </div>
            <CodeInput value={code} onChange={setCode} disabled={pending === "verify"} />
            <FormError message={error} />
            {notice && (
              <p role="status" className="text-sm text-black/60">
                {notice}
              </p>
            )}
            <SubmitButton pending={pending === "verify"} disabled={code.length !== 6}>
              Continue
            </SubmitButton>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <TextButton onClick={() => void onResend()} disabled={pending !== null || cooldown > 0}>
                {cooldown > 0 ? `Send a new code in ${cooldown}s` : "Send a new code"}
              </TextButton>
              <TextButton
                onClick={() => {
                  setStep("offer");
                  setError(null);
                  setNotice(null);
                }}
              >
                Use a different email
              </TextButton>
            </div>
            <p className="text-xs leading-relaxed text-black/50">No code after a minute? Check your spam folder.</p>
          </form>
        ) : (
          <form onSubmit={onEmail} className="grid gap-5">
            <div className="grid gap-2">
              <h2 id="track-title" className="text-2xl font-semibold tracking-[-0.04em]">
                Track your submission.
              </h2>
              <p className="text-[15px] leading-relaxed text-black/70">
                Create an account or sign in to follow your project&apos;s progress, receive updates and access your jury
                scores.
              </p>
              <p className="eyebrow">Takes about 30 seconds.</p>
            </div>
            {/* Google is the main way in; in-app browsers (Instagram, Facebook…) block it, so there the code is. */}
            {app === null && (
              <>
                <GoogleButton
                  primary
                  onClick={() => void onGoogle()}
                  pending={pending === "google"}
                  disabled={!ready || pending !== null}
                />
                <Divider />
              </>
            )}
            <div className="grid gap-2">
              <label htmlFor="track-email" className="eyebrow text-black">
                Email address
              </label>
              <input
                id="track-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={email}
                readOnly={!prefill.canCorrect}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                className={inputClass}
              />
              {prefill.canCorrect && (
                <p className="text-xs text-black/50">The email you submitted with. Fix it here if there&apos;s a typo.</p>
              )}
            </div>
            <FormError message={error} />
            <SubmitButton
              pending={pending === "code"}
              disabled={!ready || pending !== null}
              variant={app === null ? "secondary" : "primary"}
            >
              Email me a code
            </SubmitButton>
            <div className="flex justify-center">
              <TextButton
                onClick={() => {
                  send("post_submission_auth_skipped");
                  setStep("skipped");
                }}
              >
                Maybe later
              </TextButton>
            </div>
          </form>
        )}
        {/* Clerk's bot protection for new accounts. */}
        <div id="clerk-captcha" />
      </section>
    </div>
  );
}

function SignedInState({
  result,
  error,
  signedInEmail,
  onSwitch,
}: {
  result: LinkResult | null;
  error: string | null;
  signedInEmail: string;
  onSwitch: () => void;
}) {
  if (error) return <FormError message={error} />;
  if (!result) {
    return (
      <p role="status" className="text-sm text-black/55">
        Adding it to your account…
      </p>
    );
  }
  if (result.status === "linked") {
    return (
      <div className="grid gap-4">
        <h2 id="track-title" className="text-2xl font-semibold tracking-[-0.04em]">
          It&apos;s in your account.
        </h2>
        <p className="text-[15px] leading-relaxed text-black/70">
          Follow its progress, and see your jury scores once voting closes.
        </p>
        <div>
          <Link href="/account" className={primaryButton}>
            Go to your dashboard
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="grid gap-4">
      <h2 id="track-title" className="text-2xl font-semibold tracking-[-0.04em]">
        {result.status === "mismatch" ? "A different email." : "We couldn't add it to this account."}
      </h2>
      <p className="text-[15px] leading-relaxed text-black/70">
        {result.status === "mismatch" ? (
          <>
            You&apos;re signed in as <strong className="text-black">{signedInEmail}</strong>, but this project was submitted
            with <strong className="text-black">{result.submittedEmail}</strong>. To track it, sign in with that address.
            Your submission is safe either way.
          </>
        ) : result.status === "taken" ? (
          "This submission is already linked to another account. Sign in with that account to follow it."
        ) : (
          "We couldn't find this submission any more. If you sent it, it's safe with us."
        )}
      </p>
      <div className="flex flex-wrap gap-3">
        {result.status !== "not_found" && (
          <button type="button" onClick={onSwitch} className={primaryButton}>
            Switch account
          </button>
        )}
        <Link href="/account" className={secondaryButton}>
          Your dashboard
        </Link>
      </div>
    </div>
  );
}
