// app/[locale]/sign-up/[[...sign-up]]/page.tsx
// Standalone consumer sign-up — same RULED AuthPanel (the email-code flow
// auto-creates accounts for unknown emails), sign-up header label.

import type { Metadata } from "next";
import AuthPageClient from "@/components/auth/AuthPageClient";

export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false },
};

export default function SignUpPage() {
  return <AuthPageClient intent="sign-up" />;
}
