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
import { useQuery } from "convex/react";
import { api } from "@/convex-helpers-api";
import { SiteNavbar } from "./_components/site-navbar";
import { HeroSection } from "./_components/hero-section";
import { MenuSection } from "./_components/menu-section";
import { InfoSection } from "./_components/info-section";
import { SiteFooter } from "./_components/site-footer";
import { MenuSkeleton } from "./_components/menu-skeleton";
import { MenuAIBridge } from "./_components/menu-ai-bridge";
import { StorefrontAlertBanner } from "./_components/storefront-alert-banner";

interface VenueClientViewProps {
  slug: string;
}

export default function VenueClientView({ slug }: VenueClientViewProps) {
  const data = useQuery(api.publicMenu.get, { slug });
  const [activeCategory, setActiveCategory] = useState("All");

  // ── Loading state — full-page skeleton ──────────────────────────────────────
  if (data === undefined) {
    return <MenuSkeleton />;
  }

  // ── 404 state ───────────────────────────────────────────────────────────────
  if (data === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-6 text-center">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl">☕</span>
        </div>
        <h1 className="font-serif text-4xl mb-4 text-balance">
          Cafe Not Found
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          We couldn&apos;t find the menu you&apos;re looking for. Please check
          the URL or scan the QR code again.
        </p>
      </div>
    );
  }

  // ── Build the runtime CSS custom property object ─────────────────────────────
  /**
   * `themeSettings` comes from the Convex DB (org.themeSettings).
   * Shape: { primaryColor, backgroundColor?, textColor?, fontFamily, buttonRadius }
   *
   * We map it to three semantic theme tokens + override the core Tailwind
   * token variables so all existing utility classes update automatically.
   */
  const themeSettings = data.organization.themeSettings;

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
        // Apply the dynamic background directly on the root element so there's
        // no flash of the default dark background before the style mounts.
        background: themeSettings?.backgroundColor || "oklch(0.145 0 0)",
        color: themeSettings?.textColor || "oklch(0.985 0 0)",
      }}
    >
      {/* ── Real-time VolooAI alert banner (sticky, above navbar) ────────── */}
      <StorefrontAlertBanner message={data.organization.storefrontAlert} />

      {/* Glassmorphic, scroll-aware navigation bar */}
      <SiteNavbar
        organizationName={data.organization.name}
        logoUrl={data.organization.logoUrl}
        onCategorySelect={(cat) => setActiveCategory(cat)}
      />

      {/* Full-bleed hero with staggered animations */}
      <HeroSection config={data.organization.storefrontConfig} />

      {/* Section divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div
          className="h-px"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
      </div>

      {/* Glassmorphic product card grid with category filters */}
      <MenuSection
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        categories={data.categories}
        socialLinks={data.organization.socialLinks}
        themeSettings={themeSettings ?? null}
      />

      {/* Section divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div
          className="h-px"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
      </div>

      {/* Operating hours + location */}
      <InfoSection
        operatingHours={data.organization.operatingHours}
        storefrontConfig={data.organization.storefrontConfig}
      />

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
      <MenuAIBridge
        organizationName={data.organization.name}
        slug={slug}
        categories={data.categories}
        themeSettings={themeSettings ?? null}
        currency={data.organization.currency}
      />

      {/* Footer */}
      <SiteFooter />
    </main>
  );
}
