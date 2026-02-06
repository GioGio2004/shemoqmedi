import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';

// 1. Setup Next-Intl Middleware
const intlMiddleware = createMiddleware({
  locales: ['en', 'ka'],
  defaultLocale: 'en', // Set your default language here
});

// 2. Define routes that do NOT need authentication (optional)
// You can leave this empty if you want to protect everything
const isPublicRoute = createRouteMatcher([
  '/:locale/sign-in(.*)', 
  '/:locale/sign-up(.*)',
  '/:locale', // Home page
]);

export default clerkMiddleware(async (auth, req) => {
  // Restrict access to all routes except the ones defined in isPublicRoute
  if (!isPublicRoute(req)) {
     await auth.protect();
  }

  // Execute Next-Intl middleware for i18n routing
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};