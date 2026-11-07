import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Only the API is blocked. The auth pages (/sign-in, /sign-up) carry
        // noindex and the signed-in routes (/account, /submit, /vote, /claim)
        // redirect to them; Google can only honour a noindex it may fetch, and
        // a blocked URL linked sitewide can still be indexed URL-only.
        disallow: ["/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
