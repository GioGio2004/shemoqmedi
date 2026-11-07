import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["en", "ka", "ru"],
  defaultLocale: "ka",
});

// Pages that need a signed-in user. Everything else is public.
const isProtectedRoute = createRouteMatcher(["/:locale/account(.*)"]);

const isApiRoute = createRouteMatcher(["/api/(.*)", "/trpc/(.*)"]);

// Send signed-out visitors to our own localized sign-in page (not Clerk's
// hosted Account Portal), then back to where they were going.
function redirectToSignIn(req: NextRequest) {
  const locale = req.nextUrl.pathname.split("/")[1] || "ka";
  const url = new URL(`/${locale}/sign-in`, req.url);
  url.searchParams.set("redirect_url", req.nextUrl.href);
  return NextResponse.redirect(url);
}

export default clerkMiddleware(async (auth, req) => {
  // API routes never get a locale prefix.
  if (isApiRoute(req)) return;

  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    if (!userId) return redirectToSignIn(req);
  }
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Skip Next.js internals and static assets, including sitemap.xml and robots.txt
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)",
    // Always run for API routes so Clerk can handle auth when needed
    "/(api|trpc)(.*)",
  ],
};
