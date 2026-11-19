"use client";

// Route error boundary. Without it Next dev hard-reloads on runtime errors.

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { reportError } from "@/lib/sentry";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Details only while developing; visitors just see the message below.
    if (process.env.NODE_ENV === "development") console.error(error);
    // Sent to Sentry when it is set up (lib/sentry.ts); a no-op otherwise.
    reportError(error);
  }, [error]);

  return (
    <main id="main-content" className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold">Something broke.</h1>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
