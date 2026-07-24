/**
 * components/seo/JsonLd.tsx — Site-wide structured data (Server Components).
 * ─────────────────────────────────────────────────────────────────────────────
 * Rendered once per page from app/[locale]/layout.tsx, so every route under
 * [locale] carries the Organization + WebSite nodes without redeclaring them.
 *
 * The `@id` anchors are stable and canonical:
 *   ${BASE_URL}/#org   — the Organization (VOLOO by Shemoqmedi)
 *   ${BASE_URL}/#site  — the WebSite
 * Page-level graphs (home ItemList/OfferCatalog, venue Restaurant nodes)
 * reference these by `@id` instead of duplicating the nodes — JSON-LD parsers
 * merge nodes that share an `@id`.
 *
 * CANONICAL HOST: www is the serving host (apex 308s to www) — never hardcode
 * the apex here. See the canonical-host note in app/[locale]/layout.tsx.
 */

const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://www.shemoqmedi.space";

export const ORG_ID = `${BASE_URL}/#org`;
export const SITE_ID = `${BASE_URL}/#site`;

/**
 * JsonLd — renders any serializable object as a <script type="application/ld+json">.
 * `<` is escaped to < so DB-sourced strings can never break out of the
 * script tag (the standard React JSON-LD pattern used across this app).
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * OrgWebsiteJsonLd — Organization + WebSite graph, localized via inLanguage.
 * Server-rendered per locale from the [locale] layout.
 */
export function OrgWebsiteJsonLd({ locale }: { locale: string }) {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: "VOLOO by Shemoqmedi",
        url: BASE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${BASE_URL}/logo.png`,
        },
        email: "hello@shemoqmedi.space",
        sameAs: ["https://instagram.com/shemoqmedi"],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Tbilisi",
          addressCountry: "GE",
        },
      },
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        url: BASE_URL,
        name: "VOLOO by Shemoqmedi",
        inLanguage: locale,
        publisher: { "@id": ORG_ID },
      },
    ],
  };

  return <JsonLd data={graph} />;
}
