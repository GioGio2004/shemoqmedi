"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api, type SubmissionEvent } from "@/convex-helpers-api";
import { friendlyError } from "@/lib/errors";
import { attribution, funnelSource, newToken, rememberLanding, saveRef } from "@/lib/submission";
import { FormError, SubmitButton, inputClass } from "@/components/auth/AuthUI";
import { cn } from "@/lib/utils";

// The 30-second submission: site name, website URL, email. Nothing else on
// this page: no code, no password, no account. The submission is saved for
// good the moment it's sent (convex/quickSubmit.ts submit); signing in to
// track it is offered afterwards, optionally, on /submit/received.

type Fields = { name: string; url: string; email: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function urlError(raw: string) {
  const value = raw.trim();
  if (!value) return "Enter your website's address.";
  if (/\s/.test(value)) return "A web address has no spaces.";
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    if (!/^https?:$/.test(url.protocol) || !/\.[a-z]{2,}$/i.test(url.hostname)) throw new Error();
    return null;
  } catch {
    return "That doesn't look like a web address. Try yoursite.com.";
  }
}

function validate(f: Fields): Errors {
  const errors: Errors = {};
  const name = f.name.trim();
  if (!name) errors.name = "Enter the site's name.";
  else if (name.length > 80) errors.name = "Keep the name under 80 characters.";
  const url = urlError(f.url);
  if (url) errors.url = url;
  const email = f.email.trim();
  if (!email) errors.email = "Enter your email address.";
  else if (!EMAIL.test(email) || email.length > 254) errors.email = "Check your email address. It looks incomplete.";
  return errors;
}

function InlineField({
  id,
  label,
  error,
  aside,
  children,
}: {
  id: string;
  label: string;
  error?: string;
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
      {error && (
        <p id={`${id}-error`} className="text-[13px] leading-snug text-black">
          <span aria-hidden="true" className="mr-1.5 inline-block size-1.5 -translate-y-px rounded-full bg-black align-middle" />
          {error}
        </p>
      )}
    </div>
  );
}

export function QuickSubmit() {
  const router = useRouter();
  const params = useSearchParams();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const submit = useMutation(api.quickSubmit.submit);
  const track = useMutation(api.quickSubmit.track);

  const [fields, setFields] = useState<Fields>({ name: "", url: "", email: "" });
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [tried, setTried] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);
  // Blocks a second press before React re-renders (double-clicks).
  const busy = useRef(false);
  // One secret per submission attempt: retries and double-clicks reuse it, so the server saves it once.
  const token = useRef<string | null>(null);

  const send = (event: SubmissionEvent) => void track({ event, source: funnelSource() }).catch(() => {});

  useEffect(() => {
    rememberLanding(params);
    send("submission_page_viewed");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per page view
  }, []);

  // Signed in: their account's email, so the submission is theirs right away.
  const accountEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors the signed-in account
    if (isSignedIn && accountEmail) setFields((f) => ({ ...f, email: accountEmail }));
  }, [isSignedIn, accountEmail]);

  const errors = validate(fields);
  const shown = (k: keyof Fields) => ((tried || touched[k]) && errors[k]) || undefined;

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!started.current) {
      started.current = true;
      send("submission_form_started");
    }
    setFields((f) => ({ ...f, [k]: e.target.value }));
    setError(null);
  };
  const blur = (k: keyof Fields) => () => {
    if (fields[k].trim()) setTouched((t) => ({ ...t, [k]: true }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy.current) return;
    setTried(true);
    const first = (["name", "url", "email"] as const).find((k) => errors[k]);
    if (first) {
      send("submission_validation_failed");
      document.getElementById(`qs-${first}`)?.focus();
      return;
    }
    send("submission_form_completed");
    busy.current = true;
    setPending(true);
    setError(null);
    try {
      token.current ??= newToken();
      const { id } = await submit({
        name: fields.name.trim(),
        url: fields.url.trim(),
        email: fields.email.trim(),
        token: token.current,
        website: honeypot || undefined,
        attribution: attribution(),
      });
      saveRef({ id, token: token.current });
      router.push("/submit/received");
    } catch (err) {
      setError(friendlyError(err));
      busy.current = false;
      setPending(false);
    }
  }

  const describe = (k: keyof Fields) => (shown(k) ? `qs-${k}-error` : undefined);
  const fieldClass = (k: keyof Fields) => cn(inputClass, shown(k) && "border-black");

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <InlineField id="qs-name" label="Site name" error={shown("name")}>
        <input
          id="qs-name"
          name="organization"
          autoComplete="organization"
          enterKeyHint="next"
          placeholder="Studio Nord"
          value={fields.name}
          onChange={set("name")}
          onBlur={blur("name")}
          aria-invalid={!!shown("name")}
          aria-describedby={describe("name")}
          className={fieldClass("name")}
        />
      </InlineField>
      <InlineField id="qs-url" label="Website URL" error={shown("url")}>
        <input
          id="qs-url"
          name="url"
          type="url"
          inputMode="url"
          autoComplete="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="next"
          placeholder="studionord.com"
          value={fields.url}
          onChange={set("url")}
          onBlur={blur("url")}
          aria-invalid={!!shown("url")}
          aria-describedby={describe("url")}
          className={fieldClass("url")}
        />
      </InlineField>
      <InlineField
        id="qs-email"
        label="Email address"
        error={shown("email")}
        aside={isSignedIn ? <span className="text-xs text-black/50">Signed in</span> : undefined}
      >
        <input
          id="qs-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="send"
          placeholder="you@studionord.com"
          value={fields.email}
          readOnly={!!isSignedIn}
          onChange={set("email")}
          onBlur={blur("email")}
          aria-invalid={!!shown("email")}
          aria-describedby={describe("email")}
          className={fieldClass("email")}
        />
      </InlineField>
      {/* Hidden from people; bots fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="qs-website">Leave this empty</label>
        <input id="qs-website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      <FormError message={error} />
      <SubmitButton pending={pending}>
        Submit my project
      </SubmitButton>
      <p className="text-xs leading-relaxed text-black/50">
        No account needed. By submitting you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-4">
          terms
        </Link>
        .
      </p>
    </form>
  );
}
