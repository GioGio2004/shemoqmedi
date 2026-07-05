/**
 * MenuAIBridge
 * ─────────────────────────────────────────────────────────────────────────────
 * The single adapter layer between the Convex-flavored menu data and the
 * VolooAI widget's internal Product / CafeConfig types.
 *
 * What this file does:
 *
 *  1. TYPE BRIDGE
 *     Converts `ConvexCategory[] + ConvexMenuItem[]` (from publicMenu.get)
 *     into the flat `Product[]` shape that VolooAI's `localizedProducts` prop
 *     expects. Each item gets:
 *       - a stable numeric `id` (hash of the Convex `_id` string)
 *       - `name`, `description`, `price` (converted from tetri → display unit)
 *       - `image`, `category`, `color`
 *       - tags → `allergens` (so the AI can filter by dietary restrictions)
 *
 *  2. CAFE CONTEXT INJECTION
 *     Injects the org name + menu into the AI's system prompt via a custom
 *     `apiEndpoint` that wraps `/api/chat`. The cafe slug is passed as a
 *     query-param so the backend can log/isolate per-tenant conversations.
 *
 *  3. THEME BRIDGE
 *     Maps `org.themeSettings` → `CafeTheme` so the widget's buttons,
 *     gradients, and glow effects all match the admin's chosen brand color.
 *
 *  4. CONTEXT-AWARE SYSTEM PROMPT
 *     The `productContext` string built from real DB items is already sent by
 *     VolooAI's `sendMessage` function. We update `/api/chat/route.ts`'s
 *     `systemInstruction` to reference the org name dynamically (passed via a
 *     new `cafeName` field in the request body).
 *
 * Usage (in page.tsx):
 *   <MenuAIBridge
 *     organizationName={data.organization.name}
 *     slug={slug}
 *     categories={data.categories}
 *     themeSettings={data.organization.themeSettings}
 *     currency={data.organization.currency}
 *   />
 */

"use client";

import { useMemo } from "react";
import {
  VolooAI,
  type CafeConfig,
  type CafeTheme,
} from "@/components/chatbots/volooAI";
import type { ConvexCategory } from "./menu-section";

// ─── Props ────────────────────────────────────────────────────────────────────

interface MenuAIBridgeProps {
  organizationName: string;
  /** URL slug — used as `cafeId` for Convex session isolation */
  slug: string;
  categories: ConvexCategory[];
  themeSettings: {
    primaryColor: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily: string;
    buttonRadius: string;
  } | null;
  /** Currency code from the org, e.g. "GEL", "USD" */
  currency?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * djb2 hash — converts a Convex `_id` string into a stable positive integer
 * that satisfies VolooAI's `Product.id: number` type contract.
 * The hash is deterministic across page loads — no random IDs.
 */
function hashId(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
    hash = hash & hash; // force 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Resolves a color value into a slightly lighter tint for `primaryColorLight`.
 * Appends "cc" (80% opacity) to a hex color to approximate a lighter variant.
 * Falls back to the same color if it's not a hex value.
 */
function lightenHex(hex: string): string {
  // If it's a valid 6-char hex, return a slightly transparent version
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    return hex + "cc"; // ~80% opacity — visually lighter
  }
  return hex;
}

/**
 * Builds a `CafeTheme` object from the org's themeSettings.
 * All six required fields are resolved — none are hardcoded to a specific brand.
 */
function buildCafeTheme(
  themeSettings: MenuAIBridgeProps["themeSettings"],
): CafeTheme {
  const primary = themeSettings?.primaryColor || "#ea580c";
  const bg = themeSettings?.backgroundColor || "#09090b";
  const text = themeSettings?.textColor || "#e4e4e7";

  return {
    primaryColor: primary,
    primaryColorLight: lightenHex(primary),
    backgroundColor: bg,
    // surfaceColor: semi-transparent version of the bg for pill surfaces
    surfaceColor: bg.startsWith("#") ? `${bg}e0` : "rgba(24,24,27,0.88)",
    textColor: text,
    // accentGlow: very faint bloom of the primary color for inner glows
    accentGlow: primary.startsWith("#")
      ? `${primary}14`
      : "rgba(249,115,22,0.08)",
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MenuAIBridge({
  organizationName,
  slug,
  categories,
  themeSettings,
  currency = "GEL",
}: MenuAIBridgeProps) {

  /**
   * Convert Convex menu items → VolooAI Product[] shape.
   *
   * We memoize this because the categories array reference is stable between
   * renders (Convex's reactive query only updates it when the DB changes).
   * Without memo, this O(n) mapping would re-run on every parent re-render.
   */
  const localizedProducts = useMemo(() => {
    return categories.flatMap((category) => {
      const categoryName =
        category.name["en"] || Object.values(category.name)[0] || "Item";

      return category.items.map((item) => {
        const name =
          item.name["en"] || Object.values(item.name)[0] || "Unknown";
        const description = item.description
          ? typeof item.description === "string"
            ? item.description
            : item.description["en"] || Object.values(item.description)[0] || ""
          : "";

        return {
          // Stable numeric ID derived from the Convex document ID
          id: hashId(String(item._id)),
          name,
          description,
          category: categoryName,
          // Price stored in tetri/cents → display unit (divide by 100)
          price: item.price / 100,
          image:
            item.imageUrl ||
            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600",
          // Color from DB, or a neutral dark fallback
          color: item.accentColor || "bg-zinc-800",
          // Tags become allergens — the AI uses these for dietary filtering
          allergens: item.tags && item.tags.length > 0 ? item.tags : undefined,
        };
      });
    });
  }, [categories]);

  /**
   * CafeConfig — the single object that controls all of VolooAI's
   * branding, Convex tenant isolation, and color scheme.
   *
   * `cafeId` = the org's slug. This is stored alongside every Convex chat
   * message so conversations are strictly scoped per-cafe — two different
   * orgs on the same device never share history.
   */
  const cafeConfig: CafeConfig = useMemo(
    () => ({
      cafeId: slug,
      brandName: `${organizationName} AI`,
      theme: buildCafeTheme(themeSettings),
    }),
    [slug, organizationName, themeSettings],
  );

  /**
   * Context-enriched API endpoint.
   *
   * We pass `cafeName` and `currency` as query params so the `/api/chat`
   * route can inject them into the system prompt without needing a separate
   * API endpoint per cafe. The actual menu items are already sent in the
   * request body by VolooAI's `sendMessage` function as `productContext`.
   */
  const apiEndpoint = `/api/chat?cafeId=${encodeURIComponent(slug)}&cafeName=${encodeURIComponent(organizationName)}&currency=${encodeURIComponent(currency)}`;

  return (
    <VolooAI
      apiEndpoint={apiEndpoint}
      localizedProducts={localizedProducts}
      cafeConfig={cafeConfig}
    />
  );
}
