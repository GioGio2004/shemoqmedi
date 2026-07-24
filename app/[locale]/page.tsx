import type { Metadata } from "next";
import type { FunctionReturnType } from "convex/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex-helpers-api";
import LandingPanels from "@/components/landing/LandingPanels";
import { type LandingVenue } from "@/components/landing/MotionLanding";
import { type DirectoryVenue } from "@/components/landing/sections/CityDirectory";
import { buildMenuUrl } from "@/lib/routes";

// CANONICAL HOST: www serves the 200s (apex redirects) — fallback must be www.
// See the canonical-host note in app/[locale]/layout.tsx.
const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://www.shemoqmedi.space";
const CONVEX_URL =
  process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://proficient-crow-922.convex.cloud";

// Per-locale home metadata (title/description tuned per language; the layout
// title template `%s | Shemoqmedi` is intentionally bypassed by these full titles).
const HOME_META: Record<string, { title: string; description: string }> = {
  en: {
    title: "VOLOO by Shemoqmedi — Good Food Deserves a Better Menu",
    description:
      "AI menus for Tbilisi's best rooms — tap the table, ask the concierge anything, rescue a Surprise Bag before close. No app, no wait. Put your venue on VOLOO.",
  },
  ka: {
    title: "VOLOO — კარგი საკვები უკეთეს მენიუს იმსახურებს",
    description:
      "AI მენიუ თბილისის საუკეთესო სივრცეებისთვის — შეეხე მაგიდას, ჰკითხე კონსიერჟს ყველაფერი, დაიჭირე სიურპრიზ ბოქსი დახურვამდე. აპლიკაციის გარეშე.",
  },
  ru: {
    title: "VOLOO — хорошая еда заслуживает лучшего меню",
    description:
      "AI-меню для лучших заведений Тбилиси — коснитесь стола, спросите консьержа о чём угодно, успейте забрать сюрприз-бокс до закрытия. Без приложения.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { title, description } = HOME_META[locale] ?? HOME_META.en;
  return {
    title,
    description,
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
      title,
      description,
      url: `${BASE_URL}/${locale}`,
      type: "website",
      siteName: "Shemoqmedi",
      images: [{ url: `${BASE_URL}/og-default.jpg`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

// ISR — refresh the server-rendered venue lists every 10 minutes (the city
// directory grows as venues are seeded/claimed in the admin).
export const revalidate = 600;

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

  // ── Server-side city-directory fetch (seeded venues, own section) ─────────
  // publicVenues.listStorefront returns EVERY published venue (org-born and
  // seeded). The partner catalogue above stays exactly as it is; the directory
  // gets only the rows the catalogue doesn't already show — dedupe by slug,
  // partners win (claimed venues share their organization's slug).
  let directoryVenues: DirectoryVenue[] = [];
  try {
    const rows = await fetchQuery(
      api.publicVenues.listStorefront,
      {},
      { url: CONVEX_URL },
    );
    const partnerSlugs = new Set(venues.map((v) => v.slug));
    directoryVenues = (rows ?? []).filter((r) => !partnerSlugs.has(r.slug));
  } catch {
    // Convex briefly unreachable — the directory section simply doesn't render.
  }

  // ── Server-side Surprise Bags fetch (structured data only) ────────────────
  // Cache-safe: shares this page's ISR window (revalidate = 600); on any
  // failure the OfferCatalog node is simply omitted from the graph.
  type ActiveBag = FunctionReturnType<
    typeof api.surpriseBags.listActiveBags
  >[number];
  let bags: ActiveBag[] = [];
  try {
    const rows = await fetchQuery(
      api.surpriseBags.listActiveBags,
      {},
      { url: CONVEX_URL },
    );
    bags = rows ?? [];
  } catch {
    // Convex briefly unreachable — no Offer nodes this revalidation.
  }

  // ── JSON-LD: ItemList of venues + OfferCatalog of Surprise Bags ───────────
  // Organization + WebSite nodes are rendered site-wide by the [locale]
  // layout (components/seo/JsonLd.tsx) — referenced here by @id only.
  const offerCatalog =
    bags.length > 0
      ? [
          {
            "@type": "OfferCatalog",
            "@id": `${BASE_URL}/#surprise-bags`,
            name: "Surprise Bags on VOLOO",
            itemListElement: bags.map((b) => ({
              "@type": "Offer",
              name:
                b.title?.en ?? Object.values(b.title ?? {})[0] ?? "Surprise Bag",
              // Prices are stored in tetri (GEL minor units).
              price: (b.price / 100).toFixed(2),
              priceCurrency: "GEL",
              availability: "https://schema.org/InStock",
              validThrough: new Date(b.pickupEnd).toISOString(),
              url: `${BASE_URL}${buildMenuUrl(locale, b.venue.slug)}`,
              seller: { "@type": "Organization", name: b.venue.name },
              ...(b.imageUrl ? { image: b.imageUrl } : {}),
            })),
          },
        ]
      : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
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
      ...offerCatalog,
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
      <LandingPanels
        venues={venues}
        locale={locale}
        directoryVenues={directoryVenues}
      />
    </>
  );
}
