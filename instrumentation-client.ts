// Browser error monitoring (Sentry, lib/sentry.ts). Next runs this file
// before the app hydrates. Without NEXT_PUBLIC_SENTRY_DSN it does nothing and
// the SDK is never downloaded; with it, the SDK loads as its own chunk so it
// never delays the first paint.
//
// Session replay stays off: claim pages carry tokens, and replays would
// record what visitors type.

import { clientDsn, sentryOptions } from "./lib/sentry";

type Sentry = typeof import("@sentry/nextjs");
let sentry: Sentry | null = null;

if (clientDsn) {
  const dsn = clientDsn;
  void import("@sentry/nextjs")
    .then((S) => {
      S.init(sentryOptions(dsn));
      sentry = S;
    })
    .catch(() => {});
}

// Ties client-side navigations to their traces once the SDK has loaded.
export function onRouterTransitionStart(...args: Parameters<Sentry["captureRouterTransitionStart"]>) {
  sentry?.captureRouterTransitionStart(...args);
}
