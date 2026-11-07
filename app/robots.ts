import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Must match the serving host (www); see the canonical-host note in app/layout.tsx.
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "https://www.shemoqmedi.space";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/account", "/submit", "/sign-in", "/sign-up"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
