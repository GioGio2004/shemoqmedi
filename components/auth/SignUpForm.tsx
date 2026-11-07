"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleOneTap, useAuth, useSignUp } from "@clerk/nextjs";
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
  safeRedirect,
} from "./AuthUI";

// New accounts go straight to the listing form unless another page sent them.
export function SignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const redirect = safeRedirect(useSearchParams().get("redirect_url"), "/submit");

  const [step, setStep] = useState<"details" | "verify">("details");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState<null | "form" | "google" | "resend">(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) router.replace(redirect);
  }, [isSignedIn, redirect, router]);

  const ready = isLoaded && !!signUp;

  async function onDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setPending("form");
    setError(null);
    try {
      await signUp.create({
        emailAddress: email.trim(),
        password,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setCode("");
      setStep("verify");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(null);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setPending("form");
    setError(null);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete" && setActive) {
        await setActive({ session: result.createdSessionId });
        router.replace(redirect);
        return;
      }
      setError(
        result.missingFields.length
          ? `Almost there. Still needed: ${result.missingFields.join(", ").replaceAll("_", " ")}.`
          : "Could not finish creating the account. Please start again.",
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(null);
    }
  }

  async function onResend() {
    if (!ready) return;
    setPending("resend");
    setError(null);
    setNotice(null);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setNotice("A new code is on its way.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(null);
    }
  }

  async function onGoogle() {
    if (!ready) return;
    setPending("google");
    setError(null);
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: redirect,
      });
    } catch (err) {
      setError(errorMessage(err));
      setPending(null);
    }
  }

  if (step === "verify") {
    return (
      <form onSubmit={onVerify} noValidate className="grid gap-6">
        <div className="grid gap-2">
          <p className="text-2xl font-semibold tracking-[-0.04em]">Verify your email</p>
          <p className="text-sm leading-relaxed text-black/60">
            We sent a six-digit code to <span className="text-black">{email.trim()}</span>.
          </p>
        </div>
        <Field id="code" label="Code">
          <CodeInput value={code} onChange={setCode} disabled={pending === "form"} />
        </Field>
        <FormError message={error} />
        {notice && <p className="text-sm text-black/60">{notice}</p>}
        <SubmitButton pending={pending === "form"} disabled={code.length !== 6}>
          Create account
        </SubmitButton>
        <div className="flex items-center justify-between gap-4">
          <TextButton onClick={onResend} disabled={pending !== null}>
            {pending === "resend" ? "Sending…" : "Send a new code"}
          </TextButton>
          <TextButton
            onClick={() => {
              setStep("details");
              setError(null);
              setNotice(null);
            }}
          >
            Change details
          </TextButton>
        </div>
      </form>
    );
  }

  return (
    <div className="grid gap-6">
      <GoogleOneTap signInForceRedirectUrl={redirect} signUpForceRedirectUrl={redirect} />
      <GoogleButton onClick={onGoogle} pending={pending === "google"} disabled={!ready || pending !== null} />
      <Divider />
      <form onSubmit={onDetails} noValidate className="grid gap-5">
        <div className="grid grid-cols-2 gap-3">
          <Field id="firstName" label="First name">
            <input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field id="lastName" label="Last name">
            <input
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </Field>
        {/* Clerk's bot protection mounts its (usually invisible) check here. */}
        <div id="clerk-captcha" />
        <FormError message={error} />
        <SubmitButton pending={pending === "form"} disabled={!ready || !email || !password}>
          Continue
        </SubmitButton>
      </form>
      <p className="border-t border-black/10 pt-6 text-sm text-black/60">
        Already have an account?{" "}
        <Link
          href={redirect === "/submit" ? "/sign-in" : `/sign-in?redirect_url=${encodeURIComponent(redirect)}`}
          className="font-semibold text-black underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
