"use client";

// components/auth/SsoCallbackClient.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Landing pad for the Google OAuth round-trip started by AuthPanel
// (signIn.authenticateWithRedirect → redirectUrl = /[locale]/sso-callback).
// Clerk's <AuthenticateWithRedirectCallback /> completes the sign-in (or
// transfers to sign-up for first-time Google users) and then forwards to the
// redirectUrlComplete the panel supplied — the page the user started on, or
// the locale home from the standalone routes. Dark stage + mono status line
// while Clerk does its handshake.
// ─────────────────────────────────────────────────────────────────────────────

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { AUTH_CSS } from "./auth-css";

export default function SsoCallbackClient() {
  const t = useTranslations("Auth");
  return (
    <main className="va-page">
      <style>{AUTH_CSS}</style>
      <p className="va-wait">
        <span className="va-spin" aria-hidden="true" /> {t("completing")}
      </p>
      <AuthenticateWithRedirectCallback />
    </main>
  );
}
