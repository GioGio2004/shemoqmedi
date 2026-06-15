import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

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
  serverExternalPackages: [],
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
    ],
  },
};

export default withPWA(withNextIntl(nextConfig));
