import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

// The one host that may be indexed. Hard-coded on purpose (not read from
// NEXT_PUBLIC_URL) so an env typo can never noindex the live site.
const CANONICAL_HOST = "www.shemoqmedi.space";
const APEX_HOST = "shemoqmedi.space";

// Other sites that may show this one inside a frame. Giorgi's portfolio opens
// the live site in its work section; the second address is the same portfolio
// on its Vercel address. Everything else is refused (clickjacking protection).
const FRAME_ANCESTORS = ["https://khvichia.shemoqmedi.space", "https://khvichia-shemoqmedi-space.vercel.app"];

const nextConfig: NextConfig = {
  // The certificate routes read their fonts and crow from public/ at request
  // time (lib/certificate.tsx): ship those files with the functions.
  outputFileTracingIncludes: {
    "/certificate/[slug]": ["./public/fonts/certificate/**", "./public/brand/crow-clear*.png"],
    "/certificate/sample/[tier]": ["./public/fonts/certificate/**", "./public/brand/crow-clear*.png"],
  },
  experimental: {
    // Turbopack's on-disk dev cache survives restarts, and on Windows it
    // twice kept a stale route table after route files changed under a
    // running server (every /sign-in, then every /sites/* page 404ed).
    // Slightly slower cold starts in exchange for routes that always match disk.
    turbopackFileSystemCacheForDev: false,
  },
  async redirects() {
    // Old URLs reach their final answer in one hop. Only paths with a live
    // page redirect; dead Voloo pages (/menu/*, /venues/*, the templates, ...)
    // answer 410 Gone from proxy.ts (lib/gone.ts) instead of redirecting to the
    // home page, which Google treats as a soft 404.
    const legacy = [
      // The site used to be localized under /en, /ka and /ru. It is English
      // now, plus hand-written Georgian pages under /ka (lib/kaPages.ts): keep
      // their paths clear of the page names redirected below (/ka/submit
      // redirects, so the Georgian guide is /ka/how-to-submit).
      { source: "/:locale(en|ru)", destination: "/" },
      // The old Clerk catch-all pages (/en/sign-in/factor-one, ...).
      { source: "/:locale(en|ka|ru)/:page(sign-in|sign-up)/:rest*", destination: "/:page" },
      {
        source: "/:locale(en|ka|ru)/:page(account|submit|sites|creators|collections|badges|vote|claim)/:rest*",
        destination: "/:page/:rest*",
      },
      // The legal pages were localized too; the English ones are the live copies.
      { source: "/:locale(en|ka|ru)/:page(privacy|terms)", destination: "/:page" },
      // Site of the Day became a dated archive of its own.
      { source: "/collections/sotd", destination: "/site-of-the-day" },
      // Category pages became programmatic collections.
      { source: "/category/:slug", destination: "/collections/:slug" },
      { source: "/:locale(en|ka|ru)/category/:slug", destination: "/collections/:slug" },
      // Physical Voloo NFC stickers still point at /t/<uuid>. Never crawled;
      // people tapping one land on the home page rather than a 404.
      { source: "/t/:path*", destination: "/" },
    ];
    // The apex is a Vercel domain redirect today, so requests for it never
    // reach this app (apex /en/sites/x → www/en/sites/x → www/sites/x). If the
    // apex is attached to the project without a redirect, these host rules
    // send every old apex URL to its final www address in one hop instead.
    const apex = { type: "host" as const, value: APEX_HOST.replace(/\./g, "\\.") };
    return [
      ...legacy.map((r) => ({
        ...r,
        destination: `https://${CANONICAL_HOST}${r.destination}`,
        has: [apex],
        permanent: true,
      })),
      { source: "/:path*", has: [apex], destination: `https://${CANONICAL_HOST}/:path*`, permanent: true },
      ...legacy.map((r) => ({ ...r, permanent: true })),
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Vercel's default HSTS lacks includeSubDomains/preload.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Clickjacking protection: only this site itself and the pages
          // listed in FRAME_ANCESTORS may show it inside a frame.
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors 'self' ${FRAME_ANCESTORS.join(" ")}`,
          },
        ],
      },
      {
        // The Georgian pages (lib/kaPages.ts). The root layout's <html lang> is
        // "en" for every page; Bing reads Content-Language for the page's language.
        source: "/ka/:path*",
        headers: [{ key: "Content-Language", value: "ka" }],
      },
      {
        // Build output (JS chunks, CSS, fonts). Googlebot fetches these to
        // render pages, so they stay crawlable (never disallow /_next/ in
        // robots.txt), but they are not pages: keep them out of the index.
        // Without this they pile up in Search Console under "Crawled -
        // currently not indexed". /_next/image is left alone (Google Images).
        source: "/_next/static/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
      {
        // Crow sprite sheets: rebuilt rarely, so let browsers keep them a day
        // and revalidate in the background for a week.
        source: "/crow/:path+",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        // Any other host (shemoqmedi-hqja.vercel.app and other *.vercel.app
        // aliases, localhost) serves a duplicate of the site: keep it out of
        // the index. The value is a regex, hence the escaped dots.
        source: "/:path*",
        missing: [{ type: "host", value: CANONICAL_HOST.replace(/\./g, "\\.") }],
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
  images: {
    // Vercel's image cache sits in front of ImageKit (components/site/MediaImage.tsx):
    // ImageKit is fetched only on a cache miss. ImageKit file names are unique,
    // so the content under a URL never changes and can be cached for 31 days.
    minimumCacheTTL: 2678400,
    // Fewer widths and one format = fewer distinct transformations to create
    // and cache per image. Any width used in a hand-built /_next/image URL
    // (lib/imageLoader.ts optimizedImageUrl) must be listed here.
    deviceSizes: [640, 828, 1080, 1280, 1920, 2560],
    imageSizes: [256, 384],
    // 90 for the screenshot lightbox (ScreenshotGallery), 75 everywhere else.
    qualities: [75, 90],
    formats: ["image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "ik.imagekit.io", pathname: "/**" },
      { protocol: "https", hostname: "img.clerk.com", pathname: "/**" },
      { protocol: "https", hostname: "*.convex.cloud", pathname: "/**" },
    ],
  },
};

// Error monitoring (Sentry, lib/sentry.ts). The build plugin is only added
// when a DSN is set, so local and CI builds are exactly as before. Source maps
// are uploaded only when SENTRY_AUTH_TOKEN (with SENTRY_ORG and
// SENTRY_PROJECT) is set too; without it the build skips the upload and
// still passes, and stack traces show minified code.
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;
const sentryEnabled = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN);

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: sentryAuthToken,
      silent: !process.env.CI,
      telemetry: false,
      sourcemaps: { disable: !sentryAuthToken, deleteSourcemapsAfterUpload: true },
      release: { create: Boolean(sentryAuthToken) },
      widenClientFileUpload: true,
    })
  : nextConfig;
