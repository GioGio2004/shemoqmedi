import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { GONE_HTML, isGonePath } from "@/lib/gone";

// Pages that need a signed-in user. Everything else is public.
// /claim is not here: a /claim/<token> link must open for people who have no
// account yet (the page sends them through sign-up), and the /claim/<slug>
// request form checks the session itself. /submit is open too: its 30-second
// form saves the submission first and offers a sign-in after. Only the full
// form, /submit/full, needs an account.
const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/submit/full(.*)",
  "/vote(.*)",
  "/jury/profile(.*)",
  "/jury/rounds(.*)",
]);

const clerk = clerkMiddleware(async (auth, req) => {
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
    // Our own auth pages (not Clerk's hosted ones), then back here. Someone
    // opening the full form (/submit/full) logged out is almost always new,
    // so they get sign-up, with "Log in" one tap away; the other protected
    // pages are for people who already have an account.
    const isSubmit = req.nextUrl.pathname.startsWith("/submit");
    const url = new URL(isSubmit ? "/sign-up" : "/sign-in", req.url);
    url.searchParams.set("redirect_url", req.nextUrl.href);
    // Keep campaign tags on the page people actually land on, so analytics
    // still credit the ad or post that sent them.
    for (const [key, value] of req.nextUrl.searchParams) {
      if (key.startsWith("utm_")) url.searchParams.set(key, value);
    }
    return NextResponse.redirect(url);
  }
});

export default function proxy(req: NextRequest, event: NextFetchEvent) {
  // Retired Voloo pages: 410 Gone, so search engines drop them for good.
  if (isGonePath(req.nextUrl.pathname)) {
    return new NextResponse(GONE_HTML, {
      status: 410,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Robots-Tag": "noindex",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
  // The live Georgian pages are matched only for the check above; like every
  // public page they skip Clerk, so they stay cached and never get a handshake.
  if (req.nextUrl.pathname.startsWith("/ka/")) return NextResponse.next();
  return clerk(req, event);
}

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
    // Certificates open only for the site's owner (the route reads the session).
    "/certificate/:path*",
    "/(api|trpc)(.*)",
    // Retired Voloo pages (lib/gone.ts answers them with 410 Gone).
    "/(en|ru)/:path*",
    "/ka/:path+",
    "/(menu|menu-examples|venues|volooaimenu|experimenr|admin|shop)/:path*",
    "/(acoustic-shop|auto-1|auto-shop|modern|shoes|coffee|coffee-2|coffee-3|coffee-4)/:path*",
    "/(dark-menu|light-menu|modern-restaurant|regular|beauty|construction)/:path*",
  ],
};
