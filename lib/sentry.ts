// Error monitoring (Sentry, audit E-01). Everything here is inert until a DSN
// is set: NEXT_PUBLIC_SENTRY_DSN for the browser (and the server, unless
// SENTRY_DSN overrides it there). Local dev and CI set neither, so nothing is
// loaded and nothing is sent.
//
// The SDK is imported lazily so a build without a DSN ships none of it, and
// one with a DSN loads it as its own chunk after the page instead of in the
// first JavaScript the visitor downloads.

import type { BrowserOptions } from "@sentry/nextjs";
import { scrubDeep } from "./sentryScrub";

export const clientDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || undefined;
export const serverDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || undefined;

/** Options shared by the browser, Node and edge setups. */
export function sentryOptions(dsn: string) {
  return {
    dsn,
    environment: process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
    // A tenth of requests traced: enough to spot a slow page, cheap on quota.
    tracesSampleRate: 0.1,
    // No IP addresses, cookies or request bodies.
    sendDefaultPii: false,
    // Claim links carry tokens: scrub them from everything that is sent.
    beforeSend: (event) => scrubDeep(event),
    beforeSendTransaction: (event) => scrubDeep(event),
    beforeBreadcrumb: (breadcrumb) => scrubDeep(breadcrumb),
  } satisfies BrowserOptions;
}

/**
 * Report an error caught by an error boundary (app/error.tsx,
 * app/global-error.tsx). React keeps those from reaching the global
 * handlers, so they are sent by hand. A no-op without a DSN.
 */
export function reportError(error: unknown) {
  if (!clientDsn) return;
  void import("@sentry/nextjs").then((Sentry) => Sentry.captureException(error)).catch(() => {});
}
