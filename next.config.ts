import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The site used to be localized under /en, /ka and /ru. It is
      // English-only now; send old links (and search results) to the clean paths.
      { source: "/:locale(en|ka|ru)", destination: "/", permanent: true },
      { source: "/:locale(en|ka|ru)/:path*", destination: "/:path*", permanent: true },
      // Category pages became programmatic collections.
      { source: "/category/:slug", destination: "/collections/:slug", permanent: true },
      // Old Voloo restaurant NFC menu routes.
      { source: "/menu", destination: "/", permanent: true },
      { source: "/menu/:path*", destination: "/", permanent: true },
      { source: "/t/:path*", destination: "/", permanent: true },
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
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ik.imagekit.io", pathname: "/**" },
      { protocol: "https", hostname: "img.clerk.com", pathname: "/**" },
      { protocol: "https", hostname: "*.convex.cloud", pathname: "/**" },
    ],
  },
};

export default nextConfig;
