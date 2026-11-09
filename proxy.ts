import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Pages that need a signed-in user. Everything else is public.
// /claim is not here: a /claim/<token> link must open for people who have no
// account yet (the page sends them through sign-up), and the /claim/<slug>
// request form checks the session itself.
const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/submit(.*)",
  "/vote(.*)",
  "/jury/profile(.*)",
  "/jury/rounds(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  // Pending (a task such as a password reset is left): finish it first. By
  // default Clerk reports a pending session as signed out, which sent people
  // to /sign-in, where Clerk then refused to log them in again.
  const { userId, sessionStatus } = await auth({ treatPendingAsSignedOut: false });
  if (userId && sessionStatus === "pending") {
    const url = new URL("/session-tasks", req.url);
    url.searchParams.set("redirect_url", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
  if (!userId) {
    // Our own sign-in page (not Clerk's hosted one), then back here.
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("redirect_url", req.nextUrl.href);
    return NextResponse.redirect(url);
  }
});

export const config = {
  // Clerk runs only where a session matters: the (auth) route group, which is
  // the only place ClerkProvider is mounted, and API routes. Public pages
  // (/, /sites, /creators, /collections, /badges, /jury, sitemap, robots) never
  // use auth, so they skip the proxy: cached HTML is served straight away and
  // returning signed-in visitors (and crawlers) never get a handshake redirect.
  // "/x/:path*" also matches "/x" itself.
  matcher: [
    "/account/:path*",
    "/submit/:path*",
    "/vote/:path*",
    "/claim/:path*",
    "/jury/profile/:path*",
    "/jury/rounds/:path*",
    "/sign-in/:path*",
    "/sign-up/:path*",
    "/sso-callback/:path*",
    "/session-tasks/:path*",
    "/(api|trpc)(.*)",
  ],
};
