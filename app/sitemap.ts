import { MetadataRoute } from "next";

// Must match the serving host (www); see the canonical-host note in app/layout.tsx.
const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://www.shemoqmedi.space";

// Public routes. Add new pages here.
const ROUTES = ["/"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
