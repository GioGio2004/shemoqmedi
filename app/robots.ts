import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "https://shemoqmedi.space";

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

