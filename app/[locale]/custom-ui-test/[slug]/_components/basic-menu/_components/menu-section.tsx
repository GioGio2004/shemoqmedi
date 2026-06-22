/**
 * MenuSection
 * ─────────────────────────────────────────────────────────────────────────────
 * Upgraded to:
 *  - Sticky horizontal-scrolling category pill nav
 *  - Grouped by category with editorial section headers + separator lines
 *  - Staggered card entrance animations via MenuCard (Framer Motion)
 *  - All dynamic theme props preserved (primaryColor, textColor, buttonRadius)
 */

"use client";

import { useMemo, useRef, useState } from "react";
import { MenuCard, ProductPopupModal } from "./menu-card";
import { AnimatePresence } from "framer-motion";
import type { CardShapeProps } from "./menu-card";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConvexCategory {
  _id: string;
  name: Record<string, string>;
  imageUrl?: string;
  sortOrder: number;
  items: ConvexMenuItem[];
}

export interface Product extends ConvexMenuItem {
  categoryName: string;
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

function deriveShapeProps(theme: ThemeSettings | null): CardShapeProps {
  if (!theme) return {};
  const buttonRadius = theme.buttonRadius;
  const buttonShape: CardShapeProps["buttonShape"] =
    buttonRadius === "9999px" || buttonRadius === "pill"
      ? "pill"
      : buttonRadius === "0" || buttonRadius === "0px" || buttonRadius === "sharp"
      ? "squared"
      : "rounded";
  return {
    borderRadius: buttonRadius,
    borderWidth: 1,
    borderColor: "glass",
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
  const pillNavRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const CATEGORIES = [
    "All",
    ...categories.map((c) => c.name["en"] || Object.values(c.name)[0]),
  ];

  /**
   * When "All" is selected → return an array of { name, items } groups
   * When a specific category is selected → return that single group
   */
  const groupedCategories = useMemo(() => {
    if (activeCategory === "All") {
      return categories
        .filter((c) => c.items.length > 0)
        .map((c) => ({
          id: c._id,
          name: c.name["en"] || Object.values(c.name)[0],
          items: c.items.map((item) => ({
            ...item,
            categoryName: c.name["en"] || Object.values(c.name)[0],
          })),
        }));
    }
    const category = categories.find(
      (c) => (c.name["en"] || Object.values(c.name)[0]) === activeCategory
    );
    if (!category) return [];
    return [
      {
        id: category._id,
        name: activeCategory,
        items: category.items.map((item) => ({
          ...item,
          categoryName: activeCategory,
        })),
      },
    ];
  }, [activeCategory, categories]);

  const shapeProps = deriveShapeProps(themeSettings);

  // Scroll to the section when a pill is clicked
  const handleCategoryChange = (cat: string) => {
    onCategoryChange(cat);
    if (cat !== "All") {
      // Give React one tick to render the section, then scroll to it
      requestAnimationFrame(() => {
        const el = document.getElementById(`category-section-${cat}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const totalItems = groupedCategories.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <section id="menu" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* ── Section Header ─────────────────────────────────────────────── */}
        <div className="mb-10 md:mb-14">
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
            <span
              className="italic relative inline-block"
              style={{ color: "var(--theme-accent, var(--primary))" }}
            >
              modern palette
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

        {/* ── Sticky Horizontal Category Pill Nav ─────────────────────── */}
        <div
          className="sticky top-0 z-20 -mx-6 px-6 py-3 mb-12"
          style={{
            background: "var(--theme-bg, var(--background))",
            // Subtle bottom shadow to separate from content below
            boxShadow: "0 1px 0 0 rgba(255,255,255,0.05), 0 4px 24px -4px rgba(0,0,0,0.5)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div
            ref={pillNavRef}
            className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5"
            role="group"
            aria-label="Filter by category"
            style={{ scrollbarWidth: "none" }}
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              const categoryData = categories.find((c) => (c.name["en"] || Object.values(c.name)[0]) === cat);
              const imageUrl = categoryData?.imageUrl;

              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  aria-pressed={isActive}
                  className="group relative overflow-hidden shrink-0 flex items-center justify-center px-6 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 whitespace-nowrap"
                  style={{
                    borderRadius: themeSettings?.buttonRadius || "9999px",
                    background: isActive && !imageUrl
                      ? "var(--theme-accent, var(--primary))"
                      : "rgba(255,255,255,0.05)",
                    border: "1px solid",
                    borderColor: isActive
                      ? "var(--theme-accent, var(--primary))"
                      : "rgba(255,255,255,0.12)",
                    color: isActive
                      ? (imageUrl ? "var(--theme-accent, var(--primary))" : "var(--primary-foreground, #000)")
                      : "color-mix(in oklch, var(--theme-text, var(--foreground)), transparent 30%)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {imageUrl && cat !== "All" && (
                    <div className="absolute inset-0 z-0">
                      <img 
                        src={imageUrl} 
                        alt={cat} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      {/* Dark overlay to ensure text is readable */}
                      <div className="absolute inset-0 bg-black/50" />
                    </div>
                  )}
                  <span className="relative z-10" style={{
                    color: imageUrl && cat !== "All" && !isActive ? "rgba(255,255,255,0.9)" : undefined,
                    textShadow: imageUrl && cat !== "All" ? "0 2px 4px rgba(0,0,0,0.5)" : undefined,
                  }}>
                    {cat}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Grouped Category Sections ─────────────────────────────────── */}
        <div className="space-y-16">
          {groupedCategories.map((group, groupIndex) => (
            <div
              key={group.id}
              id={`category-section-${group.name}`}
              className="scroll-mt-24"
            >
              {/* Category Section Header — only show when "All" is active */}
              {activeCategory === "All" && (
                <div className="flex items-center gap-4 mb-8">
                  <h3
                    className="font-serif text-2xl md:text-3xl shrink-0"
                    style={{ color: "rgba(220,220,220,0.9)" }}
                  >
                    {group.name}
                  </h3>
                  {/* Minimalist separator line */}
                  <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
                  <span
                    className="text-xs font-medium tracking-widest uppercase shrink-0"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    {group.items.length} items
                  </span>
                </div>
              )}

              {/* Card grid for this category */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {group.items.map((product, itemIndex) => (
                  <MenuCard
                    key={product._id}
                    product={product}
                    socialLinks={socialLinks}
                    shapeProps={shapeProps}
                    animationIndex={itemIndex}
                    onClick={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {totalItems === 0 && (
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

        {/* Product Popup Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <ProductPopupModal
              product={selectedProduct}
              shapeProps={shapeProps}
              onClose={() => setSelectedProduct(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
