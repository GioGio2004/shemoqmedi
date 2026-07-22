// app/[locale]/sign-in/[[...sign-in]]/page.tsx
// Standalone consumer sign-in — renders the RULED AuthPanel full-page on a
// dark stage (no bare white Clerk defaults). Optional catch-all so any
// Clerk-style sub-paths (e.g. /sign-in/factor-one) resolve here too.

import type { Metadata } from "next";
import AuthPageClient from "@/components/auth/AuthPageClient";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default function SignInPage() {
  return <AuthPageClient intent="sign-in" />;
}
