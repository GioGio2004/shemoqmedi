import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

// Keep the require for the analyzer, it works fine here
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    // Don't cache Clerk auth routes to avoid stale auth state
    navigateFallbackDenylist: [/^\/sign-in/, /^\/sign-up/, /^\/api\//],
  },
});

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "gentle-cars-cough.loca.lt",
    "*.loca.lt",
    "*.ngrok-free.app",
    "*.serveo.net",
  ] as any,
  serverExternalPackages: [],
  async redirects() {
    return [
      // Legacy public menu route → new /menu path (301).
      {
        source: "/:locale/custom-ui-test/:slug",
        destination: "/:locale/menu/:slug",
        permanent: true,
      },
      {
        source: "/custom-ui-test/:slug",
        destination: "/menu/:slug",
        permanent: true,
      },
    ];
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "tamper-bash-reshape.ngrok-free.dev",
        "*.ngrok-free.dev",
      ],
    },
  },
  images: {
    qualities: [25, 50, 75, 80, 90, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.convex.cloud",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

// Compose them all together into a single export!
export default withBundleAnalyzer(withPWA(withNextIntl(nextConfig)));
