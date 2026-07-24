import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Must match the serving host (www) — see canonical-host note in [locale]/layout.tsx.
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "https://www.shemoqmedi.space";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Ephemeral per-NFC-tag tap URLs — thin/duplicate, redirect to the menu.
          "/t/",
          // Legacy reserved paths
          "/private/",
          "/admin/",
          // API routes — not HTML content
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

