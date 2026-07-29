// ruled-menu/types.ts
// ─────────────────────────────────────────────────────────────────────────────
// Shared types + tiny pure helpers for the RULED "Signature" menu template.
// Data contract: publicMenu.get payload (tetri prices, Record<locale,string>
// translated fields, categories with nested available items).
// ─────────────────────────────────────────────────────────────────────────────

export type TranslatedText = Record<string, string>;

export type RmItem = {
  _id: string;
  name: TranslatedText;
  description: TranslatedText | null;
  price: number; // tetri
  imageUrl: string | null;
  tags: string[];
  accentColor: string | null;
  isFeatured?: boolean;
  sortOrder: number;
};

export type RmCategory = {
  _id: string;
  name: TranslatedText;
  imageUrl: string | null;
  sortOrder: number;
  items: RmItem[];
};

export type RmRuledConfig = {
  tickerText?: TranslatedText;
  storyText?: TranslatedText;
  storyImageUrl?: string;
  galleryImageUrls?: string[];
  accentColor?: string;
  menuStyle?: "rows" | "gallery";
  showTicker?: boolean;
  showFeatured?: boolean;
  showStory?: boolean;
  showGallery?: boolean;
  showTunnel?: boolean;
} | null;

export type RmOrganization = {
  name: string;
  logoUrl: string | null;
  currency: string;
  themeSettings: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    buttonRadius?: string;
    menuType?: string;
    categoryLayout?: string;
  } | null;
  storefrontConfig: {
    heroHeadline?: string | TranslatedText;
    heroSubheadline?: string | TranslatedText;
    coverImageUrl?: string;
    heroImageUrls?: string[];
    address?: string | TranslatedText;
    cityStateZip?: string | TranslatedText;
  } | null;
  operatingHours: Array<{ day: string; hours: string }>;
  socialLinks: { whatsapp?: string; instagram?: string; email?: string } | null;
  announcements: Array<{ id: string; message: string; isActive: boolean }>;
  storefrontAlert: string | null;
  features: { hasAiManager?: boolean } | null;
  ruledMenuConfig: RmRuledConfig;
};

export type RmVenueMedia = {
  description: string | null;
  coverImage: string | null;
  galleryImages: string[];
  phone: string | null;
  address: string | null;
  category: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
} | null;

export type RmData = {
  organization: RmOrganization;
  venue: { lat: number; lng: number } | null;
  venueMedia?: RmVenueMedia;
  categories: RmCategory[];
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Locale pick with en → any fallback. Accepts plain strings too. */
export function pick(
  val: string | TranslatedText | null | undefined,
  locale: string,
): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[locale] ?? val.en ?? Object.values(val)[0] ?? "";
}

/** Tetri → "12.50" (number only — currency glyph is typeset separately). */
export function lari(tetri: number): string {
  return (tetri / 100).toFixed(2);
}

/**
 * Responsive srcset for a stored image URL.
 * ImageKit URLs get real width transforms; anything else is passed through.
 */
export function imgSrcSet(url: string): { src: string; srcSet?: string } {
  if (url.includes("ik.imagekit.io")) {
    const sep = url.includes("?") ? "&" : "?";
    return {
      src: `${url}${sep}tr=w-1200,q-80`,
      srcSet: `${url}${sep}tr=w-600,q-80 600w, ${url}${sep}tr=w-1200,q-80 1200w, ${url}${sep}tr=w-1800,q-80 1800w`,
    };
  }
  return { src: url };
}

/** Two-digit index: 0 → "01". */
export function idx2(i: number): string {
  return String(i + 1).padStart(2, "0");
}
