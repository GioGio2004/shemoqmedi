import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["en", "ka"],
  defaultLocale: "ka",
});

// These routes bypass ALL middleware — no Clerk auth, no intl locale redirect.
const isBypassRoute = createRouteMatcher([
  "/t/(.*)",     // NFC tap pages — fully public, page.tsx handles logic
  "/api/(.*)",   // API routes — must never get a locale prefix
]);

export default clerkMiddleware(async (_auth, req: NextRequest) => {
  if (isBypassRoute(req)) {
    return; // pass straight through
  }
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|lottie)).*)",
    // Always run for API routes so Clerk can handle auth when needed
    "/(api|trpc)(.*)",
  ],
};
