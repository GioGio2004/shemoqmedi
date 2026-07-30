// ─────────────────────────────────────────────────────────────────────────────
// StudioConfig — the design-as-data contract published from the admin's
// Storefront Studio (admin repo: convex/studioConfig.ts). Kept as a plain type
// here because the consumer app reads the config through `anyApi`.
//
// Evolution rule: the admin only ADDS optional fields / new union members, so
// this renderer must treat unknown values as "fall back to the default".
// ─────────────────────────────────────────────────────────────────────────────

export type StudioConfig = {
  version: number;
  theme: {
    mode: "dark" | "light";
    background: string;
    surface: string;
    ink: string;
    accent: string;
    accentInk: string;
    headingFont: string;
    bodyFont: string;
    radius: number;
    density: "compact" | "cozy" | "spacious";
  };
  hero: {
    preset: "classic" | "editorial" | "poster";
    alignment: "left" | "center";
    showLogo: boolean;
    showTagline: boolean;
  };
  cards: {
    variant: "classic" | "minimal" | "glass" | "editorial" | "banner";
    columns: number;
    imageRatio: "square" | "portrait" | "landscape";
    showImages: boolean;
    showDescriptions: boolean;
    showTags: boolean;
    priceStyle: "plain" | "badge" | "dotted";
  };
  nav: { style: "pills" | "underline" | "chips"; sticky: boolean };
  motion: {
    enabled: boolean;
    entrance: "none" | "fade-up" | "stagger-rise" | "slide-mask" | "scale-in";
    hover: "none" | "lift" | "tilt" | "glow";
    speed: number;
    scrollReveal: boolean;
  };
  sections: Array<{ id: string; visible: boolean }>;
};

/** Font preset keys → CSS stacks (mirrors the admin's STUDIO_FONTS). */
const FONT_STACKS: Record<string, string> = {
  grotesk: "var(--font-display), 'Space Grotesk', 'Helvetica Neue', sans-serif",
  sans: "var(--font-sans), 'Outfit', system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "var(--font-geist-mono), ui-monospace, 'Cascadia Mono', monospace",
};

export function fontStack(key: string): string {
  return FONT_STACKS[key] ?? FONT_STACKS.sans;
}

export const DENSITY_SCALE: Record<string, number> = {
  compact: 0.8,
  cozy: 1,
  spacious: 1.3,
};

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex?.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** rgba() from a hex + alpha — derives muted/hairline tones from the palette. */
export function withAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

/** Best string for a locale out of a translatedText record. */
export function tr(
  record: Record<string, string> | string | null | undefined,
  locale: string,
): string {
  if (!record) return "";
  if (typeof record === "string") return record;
  return record[locale] ?? record["en"] ?? Object.values(record)[0] ?? "";
}

/** Tetri integer → display string. 550 → "5.50 ₾" */
export function formatPrice(tetri: number, currency = "GEL"): string {
  const value = (tetri / 100).toFixed(2);
  if (currency === "USD") return `$${value}`;
  if (currency === "EUR") return `€${value}`;
  // Suffix style; unknown codes fall back to the code itself, never bare.
  return `${value} ${currency === "GEL" ? "₾" : currency}`;
}

/**
 * Responsive srcset for a stored image URL (mirrors ruled-menu/types.ts).
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

/** Theme tokens → CSS custom properties consumed by the renderer + cards. */
export function themeVars(theme: StudioConfig["theme"]): React.CSSProperties {
  return {
    "--sd-bg": theme.background,
    "--sd-surface": theme.surface,
    "--sd-surface-70": withAlpha(theme.surface, 0.72),
    "--sd-ink": theme.ink,
    "--sd-ink-60": withAlpha(theme.ink, 0.62),
    "--sd-ink-25": withAlpha(theme.ink, 0.25),
    "--sd-ink-14": withAlpha(theme.ink, 0.14),
    "--sd-ink-08": withAlpha(theme.ink, 0.08),
    "--sd-ink-06": withAlpha(theme.ink, 0.06),
    "--sd-accent": theme.accent,
    "--sd-accent-ink": theme.accentInk,
    "--sd-accent-35": withAlpha(theme.accent, 0.35),
    "--sd-accent-08": withAlpha(theme.accent, 0.12),
    "--sd-radius": `${theme.radius}px`,
    "--sd-density": String(DENSITY_SCALE[theme.density] ?? 1),
    "--sd-font-heading": fontStack(theme.headingFont),
    "--sd-font-body": fontStack(theme.bodyFont),
  } as React.CSSProperties;
}
