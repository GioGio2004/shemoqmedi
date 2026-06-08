import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "https://shemoqmedi.space";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Dashboard — authenticated pages, must never be indexed
          "/en/dashboard/",
          "/ka/dashboard/",
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
