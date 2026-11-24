// The Georgian pages under /ka, and which English page each one translates.
// One list feeds the hreflang alternates (both sides), the sitemap and the
// links between the pages, so a pair can't be declared on one side only.
//
// /ka itself pairs with /collections/georgia only while that collection is
// indexable, so its alternates are worked out on the page (and the sitemap),
// not here.

import type { Metadata } from "next";

export type KaPage = { ka: string; en: string | null; label: string };

export const KA_PAGES: KaPage[] = [
  { ka: "/ka", en: null, label: "ქართული ვებსაიტები" },
  { ka: "/ka/how-we-score", en: "/how-we-score", label: "როგორ ვაფასებთ" },
  { ka: "/ka/jury", en: "/jury", label: "ჟიური" },
  { ka: "/ka/how-to-submit", en: null, label: "საიტის გამოგზავნა" },
  { ka: "/ka/faq", en: null, label: "ხშირი კითხვები" },
];

/** The Georgian translation of an English page, if there is one. */
export const kaTwinOf = (en: string) => KA_PAGES.find((p) => p.en === en)?.ka ?? null;

/** The English original of a Georgian page, if there is one. */
export const enTwinOf = (ka: string) => KA_PAGES.find((p) => p.ka === ka)?.en ?? null;

/** canonical + hreflang for a Georgian page (English is x-default). */
export function kaAlternates(ka: string): Metadata["alternates"] {
  const en = enTwinOf(ka);
  return en ? { canonical: ka, languages: { ka, en, "x-default": en } } : { canonical: ka };
}

/** canonical + hreflang for an English page that has a Georgian translation. */
export function enAlternates(en: string): Metadata["alternates"] {
  const ka = kaTwinOf(en);
  return ka ? { canonical: en, languages: { en, ka, "x-default": en } } : { canonical: en };
}

/** openGraph for a Georgian page (replaces the root one, so the shared fields repeat). */
export function kaOpenGraph(path: string, title: string, description: string) {
  return {
    type: "website" as const,
    siteName: "Shemoqmedi",
    locale: "ka_GE",
    alternateLocale: ["en_US"],
    url: path,
    title,
    description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Shemoqmedi: the web's finest websites" }],
  };
}
