import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default function SignInPage() {
  return (
    <AuthShell>
      <SignIn path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/account" />
    </AuthShell>
  );
}
