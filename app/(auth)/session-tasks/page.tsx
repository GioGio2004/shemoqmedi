import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { SessionTasks } from "@/components/auth/SessionTasks";

export const metadata: Metadata = { title: "One more step", robots: { index: false } };

// Clerk sends a session with a task left here (taskUrls in clerk-provider.tsx,
// and proxy.ts for protected pages), then on to ?redirect_url.
export default function SessionTasksPage() {
  return (
    <AuthShell prelude="one more step" title="Almost in" crowLetter="i">
      <Suspense>
        <SessionTasks />
      </Suspense>
    </AuthShell>
  );
}
