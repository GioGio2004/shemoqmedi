import type { Metadata } from "next";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export const metadata: Metadata = { title: "Logging in", robots: { index: false } };

// Google sends people back here; Clerk finishes the sign-in (or turns it into
// a sign-up for a new Google account) and then redirects.
export default function SsoCallbackPage() {
  return (
    <main id="main-content" className="grid min-h-dvh place-items-center px-6">
      <p className="eyebrow">Logging you in…</p>
      <AuthenticateWithRedirectCallback signInUrl="/sign-in" signUpUrl="/sign-up" />
      {/* Bot protection for Google sign-ups that become new accounts. */}
      <div id="clerk-captcha" />
    </main>
  );
}
