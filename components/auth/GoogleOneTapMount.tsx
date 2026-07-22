"use client";

// components/auth/GoogleOneTapMount.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Mounts Clerk's <GoogleOneTap /> for the consumer app so returning users get
// the native Google prompt. Mounted ONLY from app/[locale]/layout.tsx — the
// /t/** NFC table-session tree has its own root layout and never renders this.
// The component has no per-route "auto prompt off" switch, so we gate by
// pathname instead: no One Tap on menu pages (spec) or on the auth routes
// themselves (competing UI). No force-redirect URLs are set → after One Tap
// auth the user stays on the current page.
// ─────────────────────────────────────────────────────────────────────────────

import { GoogleOneTap } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

// Locale prefix is optional defensively, though the intl middleware always
// applies one under this layout.
const SUPPRESSED =
  /^\/(?:(?:en|ka|ru)\/)?(?:menu|sign-in|sign-up|sso-callback)(?:\/|$)/;

export default function GoogleOneTapMount() {
  const pathname = usePathname() ?? "";
  if (SUPPRESSED.test(pathname)) return null;
  return <GoogleOneTap cancelOnTapOutside />;
}
