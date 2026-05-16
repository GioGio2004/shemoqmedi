/**
 * MenuSection
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders the full product catalog section: category filter pills + card grid.
 *
 * Upgrade notes:
 *  - Replaced `ProductCard` with the new `MenuCard` (Chameleon card)
 *  - `themeSettings` is passed in so shape props (borderRadius, buttonShape,
 *    buttonColor) can be derived from the DB and forwarded to each card.
 *  - Category filter pills now have a glassmorphic active state.
 *  - The section heading uses a gradient underline on the italic accent span.
 */

"use client";

import { useMemo } from "react";
import { MenuCard } from "./menu-card";
import type { CardShapeProps } from "./menu-card";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConvexCategory {
  _id: string;
  name: Record<string, string>;
  sortOrder: number;
  items: ConvexMenuItem[];
}

export interface ConvexMenuItem {
  _id: string;
  name: Record<string, string>;
  description: Record<string, string> | null;
  price: number;
  imageUrl: string | null;
  tags: string[];
  accentColor: string | null;
  sortOrder: number;
}

/** Subset of org.themeSettings as returned by publicMenu.get */
interface ThemeSettings {
  primaryColor: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily: string;
  /** CSS value for button/card radius — e.g. "9999px", "8px", "0.5rem" */
  buttonRadius: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Derives CardShapeProps from the org-level themeSettings.
 * This is the single source of truth for card shape — no per-item overrides
 * needed (the DB doesn't store them yet).
 */
function deriveShapeProps(theme: ThemeSettings | null): CardShapeProps {
  if (!theme) return {};

  // Map the stored buttonRadius CSS value → one of our named presets or pass
  // through as a raw value so the card can apply it directly.
  const buttonRadius = theme.buttonRadius;

  // If the admin stored "9999px" or "pill", make it pill-shaped buttons.
  const buttonShape: CardShapeProps["buttonShape"] =
    buttonRadius === "9999px" || buttonRadius === "pill"
      ? "pill"
      : buttonRadius === "0" || buttonRadius === "0px" || buttonRadius === "sharp"
      ? "squared"
      : "rounded";

  return {
    // Use the button radius for cards too — keeps visual language consistent.
    borderRadius: buttonRadius,
    borderWidth: 1,
    borderColor: "glass",   // Semi-transparent glassmorphic border
    buttonShape,
    buttonColor: theme.primaryColor,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MenuSection({
  activeCategory,
  onCategoryChange,
  categories,
  socialLinks,
  themeSettings,
}: {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  categories: ConvexCategory[];
  socialLinks: any;
  themeSettings: ThemeSettings | null;
}) {
  const CATEGORIES = [
    "All",
    ...categories.map((c) => c.name["en"] || Object.values(c.name)[0]),
  ];

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") {
      return categories.flatMap((c) =>
        c.items.map((item) => ({
          ...item,
          categoryName: c.name["en"] || Object.values(c.name)[0],
        }))
      );
    }
    const category = categories.find(
      (c) => (c.name["en"] || Object.values(c.name)[0]) === activeCategory
    );
    if (!category) return [];
    return category.items.map((item) => ({
      ...item,
      categoryName: category.name["en"] || Object.values(category.name)[0],
    }));
  }, [activeCategory, categories]);

  // Derive card shape props once from org theme settings
  const shapeProps = deriveShapeProps(themeSettings);

  return (
    <section id="menu" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* ── Section Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            {/* Eyebrow label */}
            <span
              className="text-xs font-semibold tracking-[0.25em] uppercase mb-3 block"
              style={{ color: "var(--theme-accent, var(--primary))" }}
            >
              Our Selection
            </span>
            <h2
              className="text-4xl md:text-5xl font-serif text-balance"
              style={{ color: "var(--theme-text, var(--foreground))" }}
            >
              Curated essentials for the
              <br className="hidden md:block" />
              {/* Accent italic span with animated gradient underline */}
              <span
                className="italic relative inline-block"
                style={{ color: "var(--theme-accent, var(--primary))" }}
              >
                modern palette
                {/* Underline element — grows on hover via CSS */}
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 transition-transform duration-500"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--theme-accent, var(--primary)) 0%, transparent 100%)",
                  }}
                />
              </span>
            </h2>
          </div>

          {/* ── Category Filter Pills ───────────────────────────────────── */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  aria-pressed={isActive}
                  className="px-4 py-2 text-sm font-medium tracking-wide transition-all duration-300"
                  style={{
                    borderRadius: themeSettings?.buttonRadius || "9999px",
                    /*
                     * Active: filled with theme accent + glass border
                     * Inactive: transparent with subtle glass border
                     */
                    background: isActive
                      ? "var(--theme-accent, var(--primary))"
                      : "rgba(255,255,255,0.05)",
                    border: "1px solid",
                    borderColor: isActive
                      ? "var(--theme-accent, var(--primary))"
                      : "rgba(255,255,255,0.12)",
                    color: isActive
                      ? "var(--primary-foreground, #000)"
                      : "color-mix(in oklch, var(--theme-text, var(--foreground)), transparent 30%)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Product Grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <MenuCard
              key={product._id}
              product={product}
              socialLinks={socialLinks}
              shapeProps={shapeProps}
            />
          ))}
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p
              className="text-lg font-serif"
              style={{
                color: "color-mix(in oklch, var(--theme-text, var(--foreground)), transparent 40%)",
              }}
            >
              No items found in this category.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
