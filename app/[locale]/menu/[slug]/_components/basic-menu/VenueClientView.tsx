/**
 * VenueClientView — Client Component
 * ─────────────────────────────────────────────────────────────────────────────
 * Extracted from page.tsx so that page.tsx can be a pure Server Component
 * capable of exporting generateMetadata() and injecting JSON-LD.
 *
 * This component owns all real-time interactivity:
 *  - Convex `useQuery` for live menu data (real-time updates via WebSocket)
 *  - useState for the active category filter
 *  - Dynamic CSS custom-property theme injection
 *  - The full component tree (SiteNavbar → HeroSection → MenuSection → …)
 *
 * The `slug` is passed as a prop from the Server Component parent so we
 * avoid duplicating the `use(params)` unwrap on the client side.
 */

"use client";

import { useState } from "react";
import { SiteNavbar } from "./_components/site-navbar";
import { HeroSection } from "./_components/hero-section";
import { MenuSection } from "./_components/menu-section";
import { SiteFooter } from "./_components/site-footer";
import { MenuAIBridge } from "./_components/menu-ai-bridge";
import { StorefrontAlertBanner } from "./_components/storefront-alert-banner";

interface VenueClientViewProps {
  slug: string;
  data: any;
}

export default function VenueClientView({ slug, data }: VenueClientViewProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  // ── Build the runtime CSS custom property object ─────────────────────────────
  /**
   * `themeSettings` comes from the Convex DB (org.themeSettings).
   * Shape: { primaryColor, backgroundColor?, textColor?, fontFamily, buttonRadius }
   *
   * We map it to three semantic theme tokens + override the core Tailwind
   * token variables so all existing utility classes update automatically.
   */
  const themeSettings = data.organization.themeSettings;

  /**
   * RULED frame tokens — re-point the contextual `--v-c-*` variables
   * (defined in globals.css) at the venue's own theme colors so every
   * hairline, plus-mark, crosshair tick and mono label in the "frame"
   * (navbar, section rules, footer) automatically reads correctly on
   * light AND dark venue themes. Venue theming stays the source of truth;
   * RULED only derives its line/label opacities from it.
   */
  const frameTokens = {
    "--v-c-bg": "var(--theme-bg, #0A0A0A)",
    "--v-c-raise":
      "color-mix(in srgb, var(--theme-text, #F4F3F0) 4%, var(--theme-bg, #0A0A0A))",
    "--v-c-ink": "var(--theme-text, #F4F3F0)",
    "--v-c-mut": "color-mix(in srgb, var(--theme-text, #F4F3F0) 62%, transparent)",
    "--v-c-faint": "color-mix(in srgb, var(--theme-text, #F4F3F0) 34%, transparent)",
    "--v-c-line": "color-mix(in srgb, var(--theme-text, #F4F3F0) 14%, transparent)",
  } as React.CSSProperties;

  const themeStyleObj: React.CSSProperties = themeSettings
    ? ({
        // ── Dynamic theme tokens (the "new" variables) ──────────────────
        "--theme-accent": themeSettings.primaryColor,
        "--theme-bg": themeSettings.backgroundColor || "oklch(0.145 0 0)",
        "--theme-text": themeSettings.textColor || "oklch(0.985 0 0)",

        // ── Override core Tailwind token variables ──────────────────────
        // This means classes like `bg-background`, `text-foreground`,
        // `bg-primary`, `text-primary` all pick up the org's DB colors,
        // so components that haven't been updated yet still theme correctly.
        "--background": themeSettings.backgroundColor || "oklch(0.145 0 0)",
        "--foreground": themeSettings.textColor || "oklch(0.985 0 0)",
        "--primary": themeSettings.primaryColor,

        // ── Font family ──────────────────────────────────────────────────
        "--font-sans": `"${themeSettings.fontFamily}", sans-serif`,
        "--font-serif": `"${themeSettings.fontFamily}", serif`,

        // ── Border radius ────────────────────────────────────────────────
        "--radius": themeSettings.buttonRadius,
      } as React.CSSProperties)
    : {};

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    /**
     * Root wrapper:
     *  - `style={themeStyleObj}` injects all CSS custom properties at the
     *    highest possible scope so they cascade to every child.
     *  - `bg-theme-bg` uses the Tailwind token registered in globals.css
     *    (@theme inline: --color-theme-bg: var(--theme-bg, ...)).
     *  - `overflow-x-hidden` prevents horizontal scroll on mobile during
     *    hero animations.
     */
    <main
      className="min-h-screen overflow-x-hidden force-theme-text"
      style={{
        ...themeStyleObj,
        ...frameTokens,
        // Apply the dynamic background directly on the root element so there's
        // no flash of the default dark background before the style mounts.
        background: themeSettings?.backgroundColor || "oklch(0.145 0 0)",
        color: themeSettings?.textColor || "oklch(0.985 0 0)",
      }}
    >
      {/* ── Real-time VolooAI alert banner (sticky, above navbar) ────────── */}
      <StorefrontAlertBanner
        announcements={(data.organization as any).announcements}
        legacyMessage={(data.organization as any).storefrontAlert}
      />

      {/* Glassmorphic, scroll-aware navigation bar */}
      <SiteNavbar
        organizationName={data.organization.name}
        logoUrl={data.organization.logoUrl}
      />

      {/* Full-bleed hero with staggered animations */}
      <HeroSection config={data.organization.storefrontConfig} />

      {/* Section divider — hairline with plus-marks (RULED) */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="v-shead-rule" aria-hidden="true">
          <span className="v-line-x" />
          <i className="v-plus" data-end="left" />
          <i className="v-plus" data-end="right" />
        </div>
      </div>

      {/* Product card grid with category filters */}
      <MenuSection
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        categories={data.categories}
        socialLinks={data.organization.socialLinks}
        themeSettings={themeSettings ?? null}
      />

      {/* Section divider — hairline (RULED) */}
      <div className="max-w-7xl mx-auto px-6">
        <span className="v-line-x" aria-hidden="true" />
      </div>

      {/*
       * VolooAI Widget — The Cafe's Personal AI Concierge
       * ─────────────────────────────────────────────────
       * MenuAIBridge is the adapter between Convex data and the VolooAI widget:
       *  - Converts ConvexMenuItem[] → Product[] via djb2 hash IDs
       *  - Maps themeSettings → CafeTheme so colors match the org's branding
       *  - Uses slug as cafeId for Convex session isolation per cafe
       *  - Passes cafeName + currency to the API route via query params so
       *    Gemini's system prompt knows exactly which cafe it represents
       */}
      {data.organization.features?.hasAiManager !== false && (
        <MenuAIBridge
          organizationName={data.organization.name}
          slug={slug}
          categories={data.categories}
          themeSettings={themeSettings ?? null}
          currency={data.organization.currency}
        />
      )}

      {/* Footer */}
      <SiteFooter
        organizationName={data.organization.name}
        socialLinks={data.organization.socialLinks}
      />
    </main>
  );
}
