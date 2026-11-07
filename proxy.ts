import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Pages that need a signed-in user. Everything else is public.
const isProtectedRoute = createRouteMatcher(["/account(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  const { userId } = await auth();
  if (!userId) {
    // Our own sign-in page (not Clerk's hosted one), then back here.
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("redirect_url", req.nextUrl.href);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static assets, including sitemap.xml and robots.txt
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)",
    // Always run for API routes so Clerk can handle auth when needed
    "/(api|trpc)(.*)",
  ],
};
