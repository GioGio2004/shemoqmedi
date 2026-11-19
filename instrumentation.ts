// Server error monitoring (Sentry, lib/sentry.ts). Without SENTRY_DSN or
// NEXT_PUBLIC_SENTRY_DSN nothing is loaded and nothing is sent.

import { serverDsn, sentryOptions } from "./lib/sentry";

export async function register() {
  if (!serverDsn) return;
  const Sentry = await import("@sentry/nextjs");
  // Same options on Node and edge (proxy.ts runs on the edge).
  Sentry.init(sentryOptions(serverDsn));
}

// Errors thrown while rendering server components, in route handlers, server
// actions and the proxy. Next calls this; Sentry turns it into an issue.
export async function onRequestError(...args: Parameters<typeof import("@sentry/nextjs").captureRequestError>) {
  if (!serverDsn) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(...args);
}
