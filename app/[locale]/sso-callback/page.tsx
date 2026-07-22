// app/[locale]/sso-callback/page.tsx
// OAuth landing pad — Clerk's AuthenticateWithRedirectCallback finishes the
// Google round-trip started in components/auth/AuthPanel.tsx and forwards to
// the redirectUrlComplete supplied there (current page / locale home).

import type { Metadata } from "next";
import SsoCallbackClient from "@/components/auth/SsoCallbackClient";

export const metadata: Metadata = {
  robots: { index: false },
};

export default function SsoCallbackPage() {
  return <SsoCallbackClient />;
}
