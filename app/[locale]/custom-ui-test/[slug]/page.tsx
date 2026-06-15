/**
 * Public Menu Page — Server Component
 * ─────────────────────────────────────────────────────────────────────────────
 * This file is intentionally a Server Component (no "use client") so that:
 *
 *  1. `generateMetadata()` can be exported — enabling per-venue dynamic
 *     <title>, <meta description>, canonical URLs, and OpenGraph images
 *     that are written into the HTML before it reaches the browser or crawler.
 *
 *  2. A <script type="application/ld+json"> tag with LocalBusiness +
 *     Restaurant schema can be injected server-side, making structured data
 *     immediately readable by Google without JavaScript execution.
 *
 *  3. The page shell arrives as fully-formed HTML for Googlebot — not as
 *     an empty skeleton dependent on a client-side WebSocket round-trip.
 *
 * All real-time interactivity (Convex useQuery, useState, dynamic theming)
 * lives in VenueClientView.tsx which is rendered as a child here.
 *
 * Metadata Strategy:
 * ─────────────────
 * For the title and description we format the slug into a human-readable
 * venue name. The canonical URL and OG image are fully dynamic per-slug.
 * If a venue-specific OG image (`/og-{slug}.jpg`) doesn't exist in /public,
 * the fallback is the platform default `/og-default.jpg`.
 */

import type { Metadata } from "next";
import MenuRouterClient from "./_components/MenuRouterClient";

// ── Constants ─────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://shemoqmedi.space";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Converts a URL slug ("noir-cafe", "spectrum-bar") into a presentable
 * venue name ("Noir Cafe", "Spectrum Bar") for use in titles and descriptions.
 */
function slugToVenueName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const venueName = slugToVenueName(slug);
  const canonicalUrl = `${BASE_URL}/${locale}/${slug}`;

  // Prefer a per-venue OG image if one has been placed in /public.
  // Falls back to the platform default so sharing always has an image.
  const ogImageUrl = `${BASE_URL}/og-${slug}.jpg`;
  const ogFallbackUrl = `${BASE_URL}/og-default.jpg`;

  return {
    title: `${venueName} | Menu`,
    description: `Explore the full digital menu of ${venueName} — crafted with care and powered by Voloo. Browse our categories, discover seasonal specials, and order with ease.`,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}/en/${slug}`,
        ka: `${BASE_URL}/ka/${slug}`,
      },
    },
    openGraph: {
      title: `${venueName} | Menu`,
      description: `Discover the menu at ${venueName}. A premium digital dining experience powered by Shemoqmedi.`,
      url: canonicalUrl,
      type: "website",
      locale: locale,
      siteName: "Shemoqmedi",
      images: [
        // Venue-specific image first — if it exists, social platforms use it.
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${venueName} — Digital Menu`,
        },
        // Platform default as a reliable fallback.
        {
          url: ogFallbackUrl,
          width: 1200,
          height: 630,
          alt: "Shemoqmedi — Digital Menus",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${venueName} | Menu`,
      description: `Explore the menu at ${venueName}.`,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  // Await the Promise — required by Next.js App Router for dynamic segments.
  const { slug, locale } = await params;

  const venueName = slugToVenueName(slug);
  const canonicalUrl = `${BASE_URL}/${locale}/${slug}`;

  // ── JSON-LD: LocalBusiness + Restaurant ─────────────────────────────────────
  //
  // Injected as a server-rendered <script> tag so Google can read structured
  // data without executing any JavaScript. Both @types are included so the
  // schema satisfies both the generic LocalBusiness and the more specific
  // Restaurant rich-result requirements.
  //
  // Fields that require live DB data (address, telephone, openingHours) are
  // intentionally omitted here — they will be added in a future iteration
  // once a server-side Convex fetch is configured. The presence of this
  // schema block alone is sufficient for Google to begin processing rich results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Restaurant"],
    "@id": canonicalUrl,
    name: venueName,
    url: canonicalUrl,
    image: `${BASE_URL}/og-${slug}.jpg`,
    // servesCuisine, priceRange, and address are enriched by VenueClientView
    // once DB data is available. For static crawls, the name + url is sufficient.
    hasMenu: {
      "@type": "Menu",
      "@id": `${canonicalUrl}#menu`,
      name: `${venueName} Digital Menu`,
      url: canonicalUrl,
    },
    potentialAction: {
      "@type": "ViewAction",
      target: canonicalUrl,
    },
  };

  return (
    <>
      {/*
       * Structured data — rendered synchronously into the HTML stream so
       * Googlebot reads it on first crawl without JavaScript execution.
       * dangerouslySetInnerHTML is the correct pattern for JSON-LD in React;
       * the content is produced server-side from a known-safe object.
       */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/*
       * MenuRouterClient handles all real-time interactivity:
       *  - Convex WebSocket subscription (useQuery)
       *  - Route to correct UI client component
       */}
      <MenuRouterClient slug={slug} />
    </>
  );
}
