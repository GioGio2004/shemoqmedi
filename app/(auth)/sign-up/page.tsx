import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default function SignUpPage() {
  return (
    <AuthShell prelude="list your work" title="Join">
      <Suspense>
        <SignUpForm />
      </Suspense>
    </AuthShell>
  );
}
