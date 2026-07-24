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
 * We fetch the real venue record from Convex (publicVenues.getBySlug) and use
 * its name/description for the title, meta description, and JSON-LD. If the
 * record is missing or Convex is unreachable, we fall back to slug-derived
 * text so the page still renders sensible metadata.
 */

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex-helpers-api";
import MenuRouterClient from "./_components/MenuRouterClient";
import { buildMenuUrl } from "@/lib/routes";

// ── Constants ─────────────────────────────────────────────────────────────────

// CANONICAL HOST: www serves the 200s (apex redirects) — fallback must be www.
// See the canonical-host note in app/[locale]/layout.tsx.
const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://www.shemoqmedi.space";
const CONVEX_URL =
  process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://proficient-crow-922.convex.cloud";

// ── Types ─────────────────────────────────────────────────────────────────────

type PublicVenue = {
  _id: string;
  orgId: string;
  slug: string;
  name: string;
  category: "cafe" | "restaurant" | "bar" | "hotel" | "other";
  description: string;
  address: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  hours: Array<{ day: string; hours: string }>;
  coverImage: string | null;
  galleryImages: string[];
  tags: string[];
  gbpPlaceId: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  googleDataLastFetchedAt: number | null;
} | null;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Converts a URL slug ("noir-cafe", "spectrum-bar") into a presentable
 * venue name ("Noir Cafe", "Spectrum Bar") — the fallback when the venue
 * record is missing from the DB.
 */
function slugToVenueName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Server-side venue fetch; never throws — returns null on any failure. */
async function fetchVenue(slug: string): Promise<PublicVenue> {
  try {
    return await fetchQuery(
      api.publicVenues.getBySlug,
      { slug },
      { url: CONVEX_URL },
    );
  } catch {
    return null;
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const venue = await fetchVenue(slug);

  const venueName = venue?.name || slugToVenueName(slug);
  const description =
    venue?.description?.trim() ||
    `Explore the full digital menu of ${venueName} — crafted with care and powered by Voloo. Browse our categories, discover seasonal specials, and order with ease.`;

  // Canonical MUST match the real route (/{locale}/menu/{slug}).
  const canonicalUrl = `${BASE_URL}${buildMenuUrl(locale, slug)}`;

  // Prefer the venue's real cover image; fall back to the platform default.
  const ogImageUrl = venue?.coverImage || `${BASE_URL}/og-default.jpg`;

  return {
    title: `${venueName} | Menu`,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${BASE_URL}${buildMenuUrl("en", slug)}`,
        ka: `${BASE_URL}${buildMenuUrl("ka", slug)}`,
        ru: `${BASE_URL}${buildMenuUrl("ru", slug)}`,
        "x-default": `${BASE_URL}${buildMenuUrl("en", slug)}`,
      },
    },
    openGraph: {
      title: `${venueName} | Menu`,
      description,
      url: canonicalUrl,
      type: "website",
      locale: locale,
      siteName: "Shemoqmedi",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${venueName} — Digital Menu`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${venueName} | Menu`,
      description,
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

  // ── Read the secure NFC session cookie ────────────────────────────────────
  // Set by app/t/[uuid]/page.tsx during the Zero-URL handshake.
  // If absent, the user is an online-only browser — multiplayer is disabled
  // and the final checkout action is blocked.
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("shemoqmedi_session");
  let multiplayerSession: {
    guestId: string | null;
    sessionId: string | null;
    tagId: string | null;
    seatNumber: number | null;
  } = { guestId: null, sessionId: null, tagId: null, seatNumber: null };

  if (sessionCookie?.value) {
    try {
      const parsed = JSON.parse(sessionCookie.value);
      multiplayerSession = {
        guestId: parsed.guestId ?? null,
        sessionId: parsed.sessionId ?? null,
        tagId: parsed.tagId ?? null,
        seatNumber: parsed.seatNumber ?? null,
      };
    } catch {
      // Malformed cookie — treat as online-only
    }
  }

  const venue = await fetchVenue(slug);
  const venueName = venue?.name || slugToVenueName(slug);
  const canonicalUrl = `${BASE_URL}${buildMenuUrl(locale, slug)}`;

  // ── JSON-LD: LocalBusiness + Restaurant ─────────────────────────────────────
  //
  // Injected as a server-rendered <script> tag so Google can read structured
  // data without executing any JavaScript. Enriched with real venue data
  // (address, geo, phone, hours, cuisine, rating) when present; fields with
  // no data are omitted entirely rather than sent as empty strings.
  const cuisines = venue
    ? [venue.category, ...(venue.tags ?? [])].filter(Boolean)
    : [];

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Restaurant"],
    "@id": canonicalUrl,
    name: venueName,
    url: canonicalUrl,
    image: venue?.coverImage || `${BASE_URL}/og-default.jpg`,
    ...(venue?.description?.trim()
      ? { description: venue.description.trim() }
      : {}),
    ...(venue?.address?.trim()
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: venue.address.trim(),
            addressLocality: "Tbilisi",
            addressCountry: "GE",
          },
        }
      : {}),
    ...(venue?.lat != null && venue?.lng != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: venue.lat,
            longitude: venue.lng,
          },
        }
      : {}),
    ...(venue?.phone?.trim() ? { telephone: venue.phone.trim() } : {}),
    ...(venue?.hours?.length
      ? { openingHours: venue.hours.map((h) => `${h.day} ${h.hours}`) }
      : {}),
    ...(cuisines.length > 0 ? { servesCuisine: cuisines } : {}),
    ...(venue?.googleRating != null &&
    venue?.googleReviewCount != null &&
    venue.googleReviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: venue.googleRating,
            reviewCount: venue.googleReviewCount,
          },
        }
      : {}),
    hasMenu: {
      "@type": "Menu",
      "@id": `${canonicalUrl}#menu`,
      name: `${venueName} Digital Menu`,
      url: canonicalUrl,
    },
    // Site-wide Organization node rendered by the [locale] layout
    // (components/seo/JsonLd.tsx) — referenced by @id, never re-declared.
    parentOrganization: { "@id": `${BASE_URL}/#org` },
    potentialAction: {
      "@type": "ViewAction",
      target: canonicalUrl,
    },
  };

  // ── JSON-LD: BreadcrumbList (Home → Venues → {venue}) ───────────────────────
  // "Venues" points at the home page's venues section (#venues anchor on
  // MenusCTA) — there is no standalone /menu directory route to link to.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${BASE_URL}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Venues",
        item: `${BASE_URL}/${locale}#venues`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: venueName,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      {/*
       * Structured data — rendered synchronously into the HTML stream so
       * Googlebot reads it on first crawl without JavaScript execution.
       * dangerouslySetInnerHTML is the correct pattern for JSON-LD in React;
       * `<` is escaped to prevent any </script> breakout from DB strings.
       */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/*
       * MenuRouterClient handles all real-time interactivity:
       *  - Convex WebSocket subscription (useQuery)
       *  - Route to correct UI client component
       */}
      <MenuRouterClient
        slug={slug}
        guestId={multiplayerSession.guestId}
        sessionId={multiplayerSession.sessionId}
        tagId={multiplayerSession.tagId}
        seatNumber={multiplayerSession.seatNumber}
      />
    </>
  );
}
