import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default function SignInPage() {
  return (
    <AuthShell prelude="welcome back" title="Log in" crowLetter="i">
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
