"use client";

// components/auth/AuthPanel.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Headless Clerk auth flow in the RULED skin — shared by the AuthSheet modal
// and the standalone /sign-in /sign-up routes. Two paths:
//   1. Google OAuth  — signIn.authenticateWithRedirect(oauth_google) via the
//      /[locale]/sso-callback route (AuthenticateWithRedirectCallback). New
//      accounts transfer automatically at the callback.
//   2. Email code    — signIn.create(identifier) → prepareFirstFactor
//      (email_code) → 6-digit OTP → attemptFirstFactor. Unknown email flips
//      to the sign-UP flow: signUp.create → prepareEmailAddressVerification →
//      attemptEmailAddressVerification. No passwords anywhere.
// After a session is created we setActive() and call onComplete — the caller
// decides whether that means "close the sheet" or "go home". Consumers are
// NEVER redirected to an admin URL.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSignIn, useSignUp, useUser } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { X } from "lucide-react";

export type AuthIntent = "sign-in" | "sign-up";

export type AuthPanelProps = {
  /** Header label only — the flow itself auto-detects new vs returning. */
  intent?: AuthIntent;
  /** Where the Google OAuth round-trip should finally land. Defaults to the
   *  page the user is currently on ("stay where you were"). */
  afterOAuthUrl?: string;
  /** Fired once a session becomes active via the email-code path. */
  onComplete?: () => void;
  /** When provided, renders the round hairline close button in the header. */
  onClose?: () => void;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clerkErrCode(err: unknown): string | null {
  return isClerkAPIResponseError(err) ? (err.errors[0]?.code ?? null) : null;
}

function GoogleG() {
  return (
    <svg width="15" height="15" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export default function AuthPanel({
  intent = "sign-in",
  afterOAuthUrl,
  onComplete,
  onClose,
}: AuthPanelProps) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const { isLoaded: signInLoaded, signIn, setActive: setActiveSignIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setActiveSignUp } = useSignUp();
  const { isSignedIn } = useUser();

  const [step, setStep] = useState<"email" | "code">("email");
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  // Once a session is activated, isSignedIn flips — this ref stops the panel
  // from re-rendering into the "already signed in" state mid-close.
  const completedRef = useRef(false);

  const loaded = signInLoaded && signUpLoaded;

  useEffect(() => {
    const id = window.setTimeout(() => {
      (step === "email" ? emailRef : codeRef).current?.focus();
    }, 80);
    return () => window.clearTimeout(id);
  }, [step]);

  const fail = useCallback(
    (err: unknown) => {
      const c = clerkErrCode(err);
      if (c === "form_code_incorrect") setError(t("errorCode"));
      else if (c === "verification_expired" || c === "verification_failed")
        setError(t("errorExpired"));
      else if (c === "form_param_format_invalid" || c === "form_identifier_invalid")
        setError(t("errorEmail"));
      else setError(t("errorGeneric"));
    },
    [t]
  );

  /** Kick off the email_code first factor for an existing account. Returns
   *  false when the identifier is unknown (caller flips to sign-up). */
  const prepareSignInCode = useCallback(
    async (identifier: string) => {
      if (!signIn) throw new Error("clerk_not_loaded");
      const attempt = await signIn.create({ identifier });
      const factor = attempt.supportedFirstFactors?.find(
        (f) => f.strategy === "email_code"
      );
      if (!factor || factor.strategy !== "email_code") {
        // Account exists but has no email_code factor (instance config edge).
        throw new Error("email_code_unavailable");
      }
      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: factor.emailAddressId,
      });
    },
    [signIn]
  );

  const startEmail = useCallback(async () => {
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError(t("errorEmail"));
      return;
    }
    if (!loaded || !signIn || !signUp || pending) return;
    setPending(true);
    setError(null);
    setInfo(null);
    try {
      try {
        await prepareSignInCode(value);
        setMode("signIn");
        setStep("code");
      } catch (err) {
        if (clerkErrCode(err) === "form_identifier_not_found") {
          // Unknown email → sign-UP: create the account, verify by code.
          await signUp.create({ emailAddress: value });
          await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
          setMode("signUp");
          setStep("code");
        } else {
          throw err;
        }
      }
      setCode("");
    } catch (err) {
      fail(err);
    } finally {
      setPending(false);
    }
  }, [email, loaded, signIn, signUp, pending, prepareSignInCode, fail, t]);

  const submitCode = useCallback(async () => {
    const value = code.trim();
    if (!/^\d{6}$/.test(value)) {
      setError(t("errorCode"));
      return;
    }
    if (!loaded || !signIn || !signUp || pending || completedRef.current) return;
    setPending(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "signIn") {
        const res = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code: value,
        });
        if (res.status === "complete" && res.createdSessionId) {
          completedRef.current = true;
          await setActiveSignIn({ session: res.createdSessionId });
          onComplete?.();
        } else {
          setError(t("errorGeneric"));
        }
      } else {
        const res = await signUp.attemptEmailAddressVerification({ code: value });
        if (res.status === "complete" && res.createdSessionId) {
          completedRef.current = true;
          await setActiveSignUp({ session: res.createdSessionId });
          onComplete?.();
        } else {
          setError(t("errorGeneric"));
        }
      }
    } catch (err) {
      fail(err);
    } finally {
      setPending(false);
    }
  }, [
    code,
    loaded,
    signIn,
    signUp,
    pending,
    mode,
    setActiveSignIn,
    setActiveSignUp,
    onComplete,
    fail,
    t,
  ]);

  const resend = useCallback(async () => {
    if (!loaded || !signIn || !signUp || pending) return;
    setPending(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "signIn") {
        await prepareSignInCode(email.trim());
      } else {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      }
      setCode("");
      setInfo(t("codeResent"));
    } catch (err) {
      fail(err);
    } finally {
      setPending(false);
    }
  }, [loaded, signIn, signUp, pending, mode, email, prepareSignInCode, fail, t]);

  const oauthGoogle = useCallback(async () => {
    if (!loaded || !signIn || pending) return;
    setPending(true);
    setError(null);
    try {
      const stayHere =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : `/${locale}`;
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `/${locale}/sso-callback`,
        redirectUrlComplete: afterOAuthUrl ?? stayHere,
      });
      // Success navigates away — leave `pending` on so the UI stays locked.
    } catch (err) {
      fail(err);
      setPending(false);
    }
  }, [loaded, signIn, pending, locale, afterOAuthUrl, fail]);

  const title = intent === "sign-up" ? t("titleSignUp") : t("titleSignIn");

  return (
    <>
      <div className="va-head">
        <span className="va-idx">
          <b>01</b> — {title}
        </span>
        {onClose && (
          <button
            type="button"
            className="va-x v-press"
            onClick={onClose}
            aria-label={t("close")}
          >
            <X size={15} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div className="va-body">
        {isSignedIn && !completedRef.current ? (
          <p className="va-ok" style={{ margin: 0 }}>
            {t("alreadySignedIn")}
          </p>
        ) : step === "email" ? (
          <>
            <p className="va-sub">{t("subtitle")}</p>

            <button
              type="button"
              className="va-google v-press"
              onClick={() => void oauthGoogle()}
              disabled={!loaded || pending}
            >
              <GoogleG />
              {t("continueGoogle")}
            </button>

            <div className="va-div" aria-hidden="true">
              {t("or")}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void startEmail();
              }}
            >
              <label className="va-lab" htmlFor="va-email">
                {t("emailLabel")}
              </label>
              <input
                id="va-email"
                ref={emailRef}
                className="va-in"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={t("emailPh")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={pending}
              />
              {/* Clerk Smart CAPTCHA slot — required for custom sign-up flows
                  when bot protection is enabled on the instance. */}
              <div id="clerk-captcha" />
              {error && (
                <p className="va-err" role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className="va-cta" disabled={!loaded || pending}>
                {pending ? (
                  <>
                    <span className="va-spin" /> {t("working")}
                  </>
                ) : (
                  t("sendCode")
                )}
              </button>
            </form>

            <p className="va-note">{t("legal")}</p>
          </>
        ) : (
          <>
            <p className="va-sent">{t("codeSentTo", { email: email.trim() })}</p>
            {mode === "signUp" && <p className="va-sub">{t("newAccountNote")}</p>}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submitCode();
              }}
            >
              <label className="va-lab" htmlFor="va-code">
                {t("codeLabel")}
              </label>
              <input
                id="va-code"
                ref={codeRef}
                className="va-in va-otp"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                disabled={pending}
              />
              {error && (
                <p className="va-err" role="alert">
                  {error}
                </p>
              )}
              {info && !error && <p className="va-ok">{info}</p>}
              <button type="submit" className="va-cta" disabled={!loaded || pending}>
                {pending ? (
                  <>
                    <span className="va-spin" /> {t("working")}
                  </>
                ) : (
                  t("verify")
                )}
              </button>
            </form>

            <div className="va-meta">
              <button
                type="button"
                className="va-link"
                onClick={() => void resend()}
                disabled={pending}
              >
                {t("resend")}
              </button>
              <button
                type="button"
                className="va-link"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError(null);
                  setInfo(null);
                }}
                disabled={pending}
              >
                {t("changeEmail")}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
