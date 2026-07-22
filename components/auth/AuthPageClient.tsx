"use client";

// components/auth/AuthPageClient.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Full-page rendering of the auth panel for the standalone /sign-in and
// /sign-up routes — dark stage, same RULED panel, no bare white Clerk
// defaults. After auth: redirect to the locale home ("/"), never anywhere
// near an admin URL.
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import AuthPanel, { type AuthIntent } from "./AuthPanel";
import { AUTH_CSS } from "./auth-css";

export default function AuthPageClient({ intent }: { intent: AuthIntent }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Auth");
  const home = `/${locale}`;

  return (
    <main className="va-page">
      <style>{AUTH_CSS}</style>
      <div className="va-sheet">
        <AuthPanel
          intent={intent}
          afterOAuthUrl={home}
          onComplete={() => router.push(home)}
        />
      </div>
      <Link href={home} className="va-back v-press">
        ← {t("backHome")}
      </Link>
    </main>
  );
}
