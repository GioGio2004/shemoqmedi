/**
 * MenuCard — The "Chameleon" Card
 * ─────────────────────────────────────────────────────────────────────────────
 * Premium editorial card with:
 *  - Glassmorphism container (bg-black/40 backdrop-blur-md)
 *  - Top-down image dissolve gradient overlay
 *  - Framer Motion staggered whileInView entrance animation
 *  - font-serif product title with serif typography
 *  - Ghost/10%-opacity action button with dynamic primary color
 *  - All dynamic theme props (borderRadius, buttonColor, etc.) preserved
 */

"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ConvexMenuItem } from "./menu-section";
import { Plus, Sparkles } from "lucide-react";

// ─── Utility ─────────────────────────────────────────────────────────────────
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
  /** Used to stagger the entrance animation per card within a category */
  animationIndex?: number;
}

// ─── Border Radius Resolver ───────────────────────────────────────────────────

function resolveBorderRadius(
  value: CardShapeProps["borderRadius"] | undefined
): string {
  if (!value || value === "rounded") return "16px";
  if (value === "sharp") return "0px";
  if (value === "pill") return "9999px";
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

// ─── Animation Variants ───────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function MenuCard({
  product,
  socialLinks,
  shapeProps = {},
  animationIndex = 0,
}: MenuCardProps) {
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
      ? "rgba(255,255,255,0.05)"
      : borderColor === "accent"
      ? "var(--theme-accent, oklch(0.922 0 0))"
      : borderColor;

  // Accent for the price badge — always theme-accent
  const accentColor =
    product.accentColor || "var(--theme-accent, oklch(0.922 0 0))";

  // Ghost button color: 10% opacity of the primary/buttonColor
  const ghostButtonBg = buttonColor
    ? `color-mix(in srgb, ${buttonColor} 10%, transparent)`
    : "rgba(255,255,255,0.07)";
  const ghostButtonBorder = buttonColor
    ? `color-mix(in srgb, ${buttonColor} 25%, transparent)`
    : "rgba(255,255,255,0.1)";

  return (
    /**
     * ── Framer Motion wrapper ────────────────────────────────────────────────
     * whileInView triggers the animation only when the card enters the viewport.
     * `once: true` prevents re-triggering on scroll-up.
     * `margin: "-50px"` fires just before the card fully appears.
     * The cubic-bezier [0.25, 0.1, 0.25, 1] gives a buttery premium deceleration.
     */
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
        delay: animationIndex * 0.08, // Stagger cards within a group
      }}
      className={cn(
        "group relative overflow-hidden flex flex-col h-full",
        // Glassmorphism: dark base with backdrop blur
        "bg-black/40 backdrop-blur-md",
        "transition-all duration-500 ease-out",
        "translate-y-0 hover:-translate-y-2",
        "shadow-lg hover:shadow-2xl hover:shadow-black/50"
      )}
      style={{
        borderRadius: cardRadius,
        borderWidth: `${borderWidth}px`,
        borderStyle: "solid",
        borderColor: resolvedBorderColor,
      }}
    >
      {/* ── Image container ─────────────────────────────────────────────────
       * The top half is entirely image, dissolving into the card below.
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

        {/* ── Image dissolve gradient overlay ──────────────────────────────
         * Fades the image into the card's black/40 background at the bottom,
         * eliminating any hard visual edge between image and content area.
         */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Category badge — glassmorphic pill */}
        <div
          className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium tracking-wide z-10"
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
            className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full ring-2 ring-white/20 z-10"
            style={{ background: accentColor }}
          />
        )}

        {/* Price floating over the image bottom — visible on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
          <span
            className="text-xl font-bold tabular-nums"
            style={{ color: "var(--theme-accent, var(--primary))" }}
          >
            ₾{displayPrice}
          </span>
        </div>
      </div>

      {/* ── Content area ─────────────────────────────────────────────────── */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title + Price (static, below image) */}
        <div className="flex justify-between items-start mb-2 gap-2">
          {/* font-serif applied to product title per spec */}
          <h3
            className="font-serif text-base leading-snug"
            style={{ color: "var(--theme-text, var(--foreground))" }}
          >
            {productName}
          </h3>
          <span
            className="text-sm font-bold tabular-nums shrink-0"
            style={{ color: "var(--theme-accent, var(--primary))" }}
          >
            ₾{displayPrice}
          </span>
        </div>

        {/* Description — light sans-serif per spec */}
        {description && (
          <p className="text-gray-400 font-light text-sm mb-4 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 text-xs font-medium rounded-full"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color:
                    "color-mix(in oklch, var(--theme-text, var(--foreground)), transparent 30%)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* ── Ghost Action Button ───────────────────────────────────────────
         * Subtle ghost style (10% opacity of primaryColor) keeps visual
         * hierarchy focused on the image and title.
         * On hover: fills to full primaryColor.
         */}
        <div
          className="flex justify-between items-center pt-4 mt-auto"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Ask AI Button */}
          <button
            onClick={() => {
              const aiProduct = {
                id: product._id as any,
                name: productName,
                category: product.categoryName,
                price: product.price / 100,
                image: product.imageUrl || "/placeholder.svg",
                description: description,
              };
              window.dispatchEvent(
                new CustomEvent("ask-voloo-ai", {
                  detail: {
                    message: `Tell me about the ${productName}`,
                    product: aiProduct,
                    keepOpen: true,
                  },
                })
              );
            }}
            className="flex items-center gap-1.5 px-4 py-2 font-medium tracking-wide transition-all duration-300"
            style={{
              borderRadius: btnRadius,
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--theme-text, var(--foreground))",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
            }}
          >
            <Sparkles className="w-4 h-4" style={{ color: "var(--theme-accent, var(--primary))" }} />
            <span>Ask AI</span>
          </button>

          <button
            onClick={() => {
              const aiProduct = {
                id: product._id as any,
                name: productName,
                category: product.categoryName,
                price: product.price / 100,
                image: product.imageUrl || "/placeholder.svg",
                description: description,
              };
              window.dispatchEvent(
                new CustomEvent("add-to-voloo-basket", {
                  detail: { product: aiProduct },
                })
              );
            }}
            className="flex items-center gap-2 px-4 py-2 font-medium tracking-wide transition-all duration-300"
            style={{
              borderRadius: btnRadius,
              backgroundColor: ghostButtonBg,
              border: `1px solid ${ghostButtonBorder}`,
              color: "var(--theme-text, var(--foreground))",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = buttonColor || "var(--theme-accent, var(--primary))";
              e.currentTarget.style.color = "var(--primary-foreground, #000)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = ghostButtonBg;
              e.currentTarget.style.color = "var(--theme-text, var(--foreground))";
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
