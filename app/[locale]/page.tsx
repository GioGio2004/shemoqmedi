import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex-helpers-api";
import MotionLanding, { type LandingVenue } from "@/components/landing/MotionLanding";
import { buildMenuUrl } from "@/lib/routes";

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://shemoqmedi.space";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Shemoqmedi — AI-Powered Digital Menus for Hospitality",
    description:
      "Voloo turns your café or restaurant into an AI-powered venue. NFC menus, smart ordering, and live customer insights — built for hospitality businesses in Georgia.",
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        en: `${BASE_URL}/en`,
        ka: `${BASE_URL}/ka`,
        ru: `${BASE_URL}/ru`,
        "x-default": `${BASE_URL}/en`,
      },
    },
    openGraph: {
      title: "Shemoqmedi — AI-Powered Digital Menus",
      description:
        "NFC menus, smart ordering, and live AI insights for hospitality businesses in Tbilisi.",
      url: `${BASE_URL}/${locale}`,
      type: "website",
      siteName: "Shemoqmedi",
      images: [{ url: `${BASE_URL}/og-default.jpg`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: "Shemoqmedi — AI-Powered Digital Menus" },
  };
}

// ISR — refresh the server-rendered venue list hourly.
export const revalidate = 3600;

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // ── Server-side venue fetch (crawlable + instant) ─────────────────────────
  let venues: LandingVenue[] = [];
  try {
    const rows = await fetchQuery(api.publicMenu.listOrganizations);
    venues = (rows ?? []).map((o: LandingVenue) => ({
      _id: o._id,
      name: o.name,
      slug: o.slug,
      imageUrl: o.imageUrl,
    }));
  } catch {
    // Convex briefly unreachable — render an empty gallery ("coming soon").
  }

  // ── JSON-LD: Organization + WebSite + ItemList of venues ──────────────────
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#org`,
        name: "Shemoqmedi",
        url: BASE_URL,
        description: "AI-powered NFC digital menus for cafés and restaurants in Georgia.",
      },
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#site`,
        url: BASE_URL,
        name: "Shemoqmedi",
        publisher: { "@id": `${BASE_URL}/#org` },
      },
      {
        "@type": "ItemList",
        name: "Venues on Shemoqmedi",
        itemListElement: venues.map((v, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${BASE_URL}${buildMenuUrl(locale, v.slug)}`,
          name: v.name,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <MotionLanding venues={venues} locale={locale} />
    </>
  );
}
