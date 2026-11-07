import { MetadataRoute } from "next";

// Must match the serving host (www); see the canonical-host note in [locale]/layout.tsx.
const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://www.shemoqmedi.space";
const LOCALES = ["en", "ka", "ru"] as const;

// Public routes (path after the locale prefix). Add new pages here.
const ROUTES = [""];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.flatMap((route) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
  );
}
