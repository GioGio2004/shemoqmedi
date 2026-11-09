"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GoogleOneTap, useSignIn } from "@clerk/nextjs";
import {
  CodeInput,
  Divider,
  Field,
  FormError,
  GoogleButton,
  StuckSession,
  SubmitButton,
  TextButton,
  errorMessage,
  inputClass,
  isSessionExists,
  safeRedirect,
  useAfterAuth,
} from "./AuthUI";

type Step =
  | { kind: "credentials" }
  // first: passwordless email code; second: new-device check after a password.
  | { kind: "code"; factor: "first" | "second"; emailAddressId?: string };

export function SignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const redirect = safeRedirect(useSearchParams().get("redirect_url"), "/account");
  // Already logged in (or just logged in): on to `redirect`, via the task page if Clerk needs one.
  const { go, stuck } = useAfterAuth(redirect);

  const [step, setStep] = useState<Step>({ kind: "credentials" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState<null | "form" | "google" | "resend">(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const ready = isLoaded && !!signIn;

  async function finish(sessionId: string | null) {
    if (!setActive || !sessionId) throw new Error("No session");
    await setActive({ session: sessionId });
    go();
  }

  /** Shows a Clerk error; "already logged in" just moves on instead. */
  function fail(err: unknown) {
    if (isSessionExists(err)) return go();
    setError(errorMessage(err));
  }

  async function sendSecondFactorCode() {
    await signIn!.prepareSecondFactor({ strategy: "email_code" });
  }

  async function sendFirstFactorCode(emailAddressId: string) {
    await signIn!.prepareFirstFactor({ strategy: "email_code", emailAddressId });
  }

  async function onPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setPending("form");
    setError(null);
    try {
      const result = await signIn.create({ identifier: email.trim(), password });
      if (result.status === "complete") return await finish(result.createdSessionId);
      if (
        result.status === "needs_second_factor" &&
        result.supportedSecondFactors?.some((f) => f.strategy === "email_code")
      ) {
        await sendSecondFactorCode();
        setCode("");
        setStep({ kind: "code", factor: "second" });
        return;
      }
      setError("This account needs another way to log in. Try an email code.");
    } catch (err) {
      fail(err);
    } finally {
      setPending(null);
    }
  }

  async function onEmailCode() {
    if (!ready) return;
    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }
    setPending("form");
    setError(null);
    try {
      const result = await signIn.create({ identifier: email.trim() });
      const factor = result.supportedFirstFactors?.find((f) => f.strategy === "email_code");
      if (!factor || !("emailAddressId" in factor)) {
        setError("Email codes are not available for this account. Use your password.");
        return;
      }
      await sendFirstFactorCode(factor.emailAddressId);
      setCode("");
      setStep({ kind: "code", factor: "first", emailAddressId: factor.emailAddressId });
    } catch (err) {
      fail(err);
    } finally {
      setPending(null);
    }
  }

  async function onCode(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || step.kind !== "code") return;
    setPending("form");
    setError(null);
    try {
      const result =
        step.factor === "first"
          ? await signIn.attemptFirstFactor({ strategy: "email_code", code })
          : await signIn.attemptSecondFactor({ strategy: "email_code", code });
      if (result.status === "complete") return await finish(result.createdSessionId);
      setError("Could not finish logging in. Please start again.");
    } catch (err) {
      fail(err);
    } finally {
      setPending(null);
    }
  }

  async function onResend() {
    if (!ready || step.kind !== "code") return;
    setPending("resend");
    setError(null);
    setNotice(null);
    try {
      if (step.factor === "first" && step.emailAddressId) await sendFirstFactorCode(step.emailAddressId);
      else await sendSecondFactorCode();
      setNotice("A new code is on its way.");
    } catch (err) {
      fail(err);
    } finally {
      setPending(null);
    }
  }

  async function onGoogle() {
    if (!ready) return;
    setPending("google");
    setError(null);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: redirect,
      });
    } catch (err) {
      fail(err);
      setPending(null);
    }
  }

  if (stuck) return <StuckSession redirect={redirect} />;

  if (step.kind === "code") {
    return (
      <form onSubmit={onCode} noValidate className="grid gap-6">
        <div className="grid gap-2">
          <p className="text-2xl font-semibold tracking-[-0.04em]">Check your email</p>
          <p className="text-sm leading-relaxed text-black/60">
            {step.factor === "second" ? "New device. " : ""}We sent a six-digit code to{" "}
            <span className="text-black">{email.trim()}</span>.
          </p>
        </div>
        <Field id="code" label="Code">
          <CodeInput value={code} onChange={setCode} disabled={pending === "form"} />
        </Field>
        <FormError message={error} />
        {notice && <p className="text-sm text-black/60">{notice}</p>}
        <SubmitButton pending={pending === "form"} disabled={code.length !== 6}>
          Log in
        </SubmitButton>
        <div className="flex items-center justify-between gap-4">
          <TextButton onClick={onResend} disabled={pending !== null}>
            {pending === "resend" ? "Sending…" : "Send a new code"}
          </TextButton>
          <TextButton
            onClick={() => {
              setStep({ kind: "credentials" });
              setError(null);
              setNotice(null);
            }}
          >
            Use a different email
          </TextButton>
        </div>
      </form>
    );
  }

  return (
    <div className="grid gap-6">
      <GoogleOneTap
        signInForceRedirectUrl={redirect}
        // New accounts go to /submit, unless they came from a page (e.g. a claim link) that wants them back.
        signUpForceRedirectUrl={redirect === "/account" ? "/submit" : redirect}
      />
      <GoogleButton onClick={onGoogle} pending={pending === "google"} disabled={!ready || pending !== null} />
      <Divider />
      <form onSubmit={onPassword} noValidate className="grid gap-5">
        <Field id="email" label="Email">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@studio.com"
            className={inputClass}
          />
        </Field>
        <Field
          id="password"
          label="Password"
          aside={
            <TextButton onClick={() => setShowPassword((v) => !v)} className="text-[12px]">
              {showPassword ? "Hide" : "Show"}
            </TextButton>
          }
        >
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </Field>
        <FormError message={error} />
        <SubmitButton pending={pending === "form"} disabled={!ready || !email || !password}>
          Log in
        </SubmitButton>
        <TextButton onClick={onEmailCode} disabled={!ready || pending !== null} className="justify-self-start">
          Forgot your password? Email me a code instead
        </TextButton>
      </form>
      <p className="border-t border-black/10 pt-6 text-sm text-black/60">
        No account yet?{" "}
        <Link
          href={redirect === "/account" ? "/sign-up" : `/sign-up?redirect_url=${encodeURIComponent(redirect)}`}
          className="font-semibold text-black underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
