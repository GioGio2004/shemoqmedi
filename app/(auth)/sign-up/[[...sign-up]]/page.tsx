import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

// New accounts go straight to the listing form.
export default function SignUpPage() {
  return (
    <AuthShell prelude="list your work" title="Join">
      <SignUp path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/submit" />
    </AuthShell>
  );
}
