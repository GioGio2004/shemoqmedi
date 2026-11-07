import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default function SignUpPage() {
  return (
    <AuthShell>
      <SignUp path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/account" />
    </AuthShell>
  );
}
