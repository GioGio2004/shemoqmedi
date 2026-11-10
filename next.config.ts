import type { NextConfig } from "next";

// The one host that may be indexed. Hard-coded on purpose (not read from
// NEXT_PUBLIC_URL) so an env typo can never noindex the live site.
const CANONICAL_HOST = "www.shemoqmedi.space";
const APEX_HOST = "shemoqmedi.space";

const nextConfig: NextConfig = {
  experimental: {
    // Turbopack's on-disk dev cache survives restarts, and on Windows it
    // twice kept a stale route table after route files changed under a
    // running server (every /sign-in, then every /sites/* page 404ed).
    // Slightly slower cold starts in exchange for routes that always match disk.
    turbopackFileSystemCacheForDev: false,
  },
  async redirects() {
    // Old URLs reach their final answer in one hop. Only paths with a live
    // page redirect; dead Voloo pages (/menu/*, /venues/*, /privacy,
    // /terms, ...) fall through to a real 404 (app/not-found.tsx, noindex)
    // instead of redirecting to the home page, which Google treats as a soft 404.
    const legacy = [
      // The site used to be localized under /en, /ka and /ru. It is English-only
      // now; /ka is the hand-written Georgian landing page (app/(site)/ka).
      { source: "/:locale(en|ru)", destination: "/" },
      // The old Clerk catch-all pages (/en/sign-in/factor-one, ...).
      { source: "/:locale(en|ka|ru)/:page(sign-in|sign-up)/:rest*", destination: "/:page" },
      {
        source: "/:locale(en|ka|ru)/:page(account|submit|sites|creators|collections|badges|vote|claim)/:rest*",
        destination: "/:page/:rest*",
      },
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
          // Clickjacking protection. Widen this if the admin app ever needs
          // to embed the site in an iframe.
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
        ],
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

export default nextConfig;
