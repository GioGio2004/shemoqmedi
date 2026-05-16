/**
 * MenuCard — The "Chameleon" Card
 * ─────────────────────────────────────────────────────────────────────────────
 * A fully reusable, dynamically themed product card. Its physical shape and
 * color scheme are entirely driven by props that come from the database, making
 * every cafe's menu look unique without a single line of custom CSS.
 *
 * Architecture:
 *  - Glassmorphism: translucent backdrop, backdrop-blur, fine border
 *  - Micro-interactions: hover lift (translateY), shadow expand, image scale
 *  - Shape props: borderRadius, borderWidth, borderColor, buttonShape, buttonColor
 *  - Uses `clsx` + `tailwind-merge` (via `cn`) to merge prop-driven overrides
 *    cleanly on top of defaults — no conflicting class names
 *  - Accent color for price / badge is read from `--theme-accent` CSS variable
 */

"use client";

import Image from "next/image";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ContactDropdown } from "./contact-dropdown";
import type { ConvexMenuItem } from "./menu-section";

// ─── Utility ─────────────────────────────────────────────────────────────────
/** Merges Tailwind classes, resolving conflicts with tailwind-merge. */
function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

// ─── Shape Props ─────────────────────────────────────────────────────────────

/**
 * Controls the physical shape of the card and its interactive elements.
 * These values come directly from the org's `themeSettings` in Convex.
 */
export interface CardShapeProps {
  /**
   * Controls the card's corner radius.
   *  "sharp"  → 0px
   *  "rounded" → 16px (default)
   *  "pill"   → 9999px
   *  string   → any valid CSS value (e.g. "12px", "1.5rem")
   */
  borderRadius?: "sharp" | "rounded" | "pill" | string;

  /** Width of the card border in px. Default: 1. */
  borderWidth?: number;

  /**
   * Color of the card border.
   * "glass"    → semi-transparent white (glassmorphism default)
   * "accent"   → uses --theme-accent
   * string     → any valid CSS color string
   */
  borderColor?: "glass" | "accent" | string;

  /**
   * Shape of the CTA button.
   *  "squared" → 4px radius
   *  "rounded" → 8px radius (default)
   *  "pill"    → fully rounded (9999px)
   */
  buttonShape?: "squared" | "rounded" | "pill";

  /** Override the button background color. Defaults to --theme-accent. */
  buttonColor?: string;
}

// ─── Component Props ─────────────────────────────────────────────────────────

interface Product extends ConvexMenuItem {
  categoryName: string;
}

interface MenuCardProps {
  product: Product;
  socialLinks: any;
  shapeProps?: CardShapeProps;
}

// ─── Border Radius Resolver ───────────────────────────────────────────────────

function resolveBorderRadius(
  value: CardShapeProps["borderRadius"] | undefined
): string {
  if (!value || value === "rounded") return "16px";
  if (value === "sharp") return "0px";
  if (value === "pill") return "9999px";
  // Custom rem/px value passed directly from DB
  return value;
}

function resolveButtonRadius(
  shape: CardShapeProps["buttonShape"] | undefined
): string {
  if (!shape || shape === "rounded") return "8px";
  if (shape === "squared") return "4px";
  if (shape === "pill") return "9999px";
  return "8px";
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MenuCard({ product, socialLinks, shapeProps = {} }: MenuCardProps) {
  const {
    borderRadius,
    borderWidth = 1,
    borderColor = "glass",
    buttonShape,
    buttonColor,
  } = shapeProps;

  const productName =
    product.name["en"] || Object.values(product.name)[0] || "Unknown";
  const displayPrice = (product.price / 100).toFixed(2);
  const description = product.description
    ? typeof product.description === "string"
      ? product.description
      : product.description["en"] || Object.values(product.description)[0]
    : "";

  // ── Resolved CSS values ────────────────────────────────────────────────────
  const cardRadius = resolveBorderRadius(borderRadius);
  const btnRadius = resolveButtonRadius(buttonShape);

  // Border color resolution: "glass" → rgba white, "accent" → CSS var
  const resolvedBorderColor =
    borderColor === "glass"
      ? "rgba(255,255,255,0.12)"
      : borderColor === "accent"
      ? "var(--theme-accent, oklch(0.922 0 0))"
      : borderColor;

  // Accent for the price badge — always theme-accent
  const accentColor = product.accentColor || "var(--theme-accent, oklch(0.922 0 0))";

  return (
    /**
     * Glassmorphism card wrapper
     * ─────────────────────────────────────────────────────────────────────────
     * - `backdrop-blur-md`: frosted glass effect
     * - `bg-white/[0.05]`: very subtle white tint over the theme background
     * - `translate-y-0 hover:-translate-y-1.5`: micro-lift on hover
     * - `shadow-lg hover:shadow-2xl`: shadow expand on hover
     * - All shape/border props applied inline so they override class defaults
     */
    <div
      className={cn(
        "group relative overflow-hidden",
        "bg-white/[0.05] backdrop-blur-md",
        "transition-all duration-500 ease-out",
        "translate-y-0 hover:-translate-y-1.5",
        "shadow-lg hover:shadow-2xl hover:shadow-black/30"
      )}
      style={{
        borderRadius: cardRadius,
        borderWidth: `${borderWidth}px`,
        borderStyle: "solid",
        borderColor: resolvedBorderColor,
      }}
    >
      {/* ── Image container ─────────────────────────────────────────────────
       * overflow-hidden is on the image wrapper, not the card, to keep the
       * border-radius of the card visible during the hover scale effect.
       */}
      <div
        className="relative aspect-[4/3] overflow-hidden"
        style={{
          borderRadius: `${cardRadius} ${cardRadius} 0 0`,
        }}
      >
        <Image
          src={product.imageUrl || "/placeholder.svg"}
          alt={productName}
          fill
          className={cn(
            "object-cover",
            "transition-transform duration-700 ease-out",
            "group-hover:scale-[1.06]"
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={product.sortOrder <= 3}
        />

        {/* Gradient overlay — darkens bottom of image for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Category badge — glassmorphic pill */}
        <div
          className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium tracking-wide"
          style={{
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.9)",
          }}
        >
          {product.categoryName}
        </div>

        {/* Accent dot — uses accentColor from DB or falls back to --theme-accent */}
        {product.accentColor && (
          <div
            className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full ring-2 ring-white/20"
            style={{ background: accentColor }}
          />
        )}
      </div>

      {/* ── Content area ─────────────────────────────────────────────────── */}
      <div className="p-5">
        {/* Title + Price */}
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3
            className="text-base font-semibold leading-snug"
            style={{ color: "var(--theme-text, var(--foreground))" }}
          >
            {productName}
          </h3>
          <span
            className="text-base font-bold tabular-nums shrink-0"
            style={{ color: "var(--theme-accent, var(--primary))" }}
          >
            ₾{displayPrice}
          </span>
        </div>

        {/* Description */}
        {description && (
          <p
            className="text-sm mb-4 line-clamp-2 leading-relaxed"
            style={{ color: "color-mix(in oklch, var(--theme-text, var(--foreground)), transparent 40%)" }}
          >
            {description}
          </p>
        )}

        {/* Tags / Benefits */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 text-xs font-medium rounded-full"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "color-mix(in oklch, var(--theme-text, var(--foreground)), transparent 30%)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* ── Order Button (ContactDropdown) ───────────────────────────────
         * We pass `btnRadius` and `buttonColor` down so ContactDropdown can
         * apply the correct shape. ContactDropdown already reads
         * `--radius` via its inline style — here we override it per-card.
         */}
        <div className="flex justify-end pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <ContactDropdown
            productName={productName}
            productCategory={product.categoryName}
            productPrice={Number(displayPrice)}
            productImage={product.imageUrl || ""}
            socialLinks={socialLinks}
            buttonRadius={btnRadius}
            buttonColor={buttonColor}
          />
        </div>
      </div>
    </div>
  );
}
