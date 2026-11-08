import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Pages that need a signed-in user. Everything else is public.
const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/submit(.*)",
  "/vote(.*)",
  "/claim(.*)",
  "/jury/join(.*)",
  "/jury/profile(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  const { userId } = await auth();
  if (!userId) {
    // Our own sign-in page (not Clerk's hosted one), then back here.
    // Invited jurors usually have no account yet: send them to sign-up.
    const url = new URL(req.nextUrl.pathname.startsWith("/jury/join") ? "/sign-up" : "/sign-in", req.url);
    url.searchParams.set("redirect_url", req.nextUrl.href);
    return NextResponse.redirect(url);
  }
});

export const config = {
  // Clerk runs only where a session matters: the (auth) route group, which is
  // the only place ClerkProvider is mounted, and API routes. Public pages
  // (/, /sites, /creators, /collections, /badges, sitemap, robots) never use
  // auth, so they skip the proxy: cached HTML is served straight away and
  // returning signed-in visitors (and crawlers) never get a handshake redirect.
  // "/x/:path*" also matches "/x" itself.
  matcher: [
    "/account/:path*",
    "/submit/:path*",
    "/vote/:path*",
    "/claim/:path*",
    "/jury/join/:path*",
    "/jury/profile/:path*",
    "/sign-in/:path*",
    "/sign-up/:path*",
    "/sso-callback/:path*",
    "/(api|trpc)(.*)",
  ],
};
