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
import { useLocale } from "next-intl";
import type { Product } from "./menu-section";
import { Plus, Sparkles, X } from "lucide-react";

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

interface MenuCardProps {
  product: Product;
  socialLinks: any;
  shapeProps?: CardShapeProps;
  /** Used to stagger the entrance animation per card within a category */
  animationIndex?: number;
  onClick?: () => void;
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

// Animation variants removed to fix scroll twitching

// ─── Component ───────────────────────────────────────────────────────────────

export function MenuCard({
  product,
  socialLinks,
  shapeProps = {},
  animationIndex = 0,
  onClick,
}: MenuCardProps) {
  const {
    borderRadius,
    borderWidth = 1,
    borderColor = "glass",
    buttonShape,
    buttonColor,
  } = shapeProps;

  const locale = useLocale();

  const productName =
    product.name[locale] || product.name["en"] || Object.values(product.name)[0] || "Unknown";
  const displayPrice = (product.price / 100).toFixed(2);
  const description = product.description
    ? typeof product.description === "string"
      ? product.description
      : product.description[locale] || product.description["en"] || Object.values(product.description)[0]
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
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden flex flex-col h-[280px] sm:h-[320px] w-full cursor-pointer",
        "transition-all duration-500 ease-out",
        "translate-y-0 hover:-translate-y-2",
        "shadow-lg hover:shadow-2xl hover:shadow-black/50"
      )}
      style={{
        borderRadius: cardRadius,
        borderWidth: `${borderWidth}px`,
        borderStyle: "solid",
        borderColor: resolvedBorderColor,
        backgroundColor: "#000",
      }}
    >
      {/* ── Full Card Background Image ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src={product.imageUrl || "/placeholder.svg"}
          alt={productName}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={85}
          className={cn(
            "object-cover",
            "transition-transform duration-700 ease-out",
            "group-hover:scale-[1.06]"
          )}
          priority={product.sortOrder <= 3}
        />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
      </div>

      {/* ── Top Header (Title + Price) ── */}
      <div className="relative z-10 p-2 sm:p-4 flex flex-col sm:flex-row justify-between items-start gap-1">
        <h3 className="font-sans text-[11px] sm:text-xs font-bold text-white tracking-wide leading-tight drop-shadow-md line-clamp-2">
          {productName}
        </h3>
        <span className="text-[11px] sm:text-xs font-bold text-white tabular-nums shrink-0 drop-shadow-md">
          {displayPrice} ₾
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── Bottom Glassmorphic Panel ── */}
      <div
        className="relative z-20 p-2 sm:p-4 pt-3 pb-3 sm:pt-5 sm:pb-5 flex flex-col justify-end"
        style={{
          background: "linear-gradient(180deg, color-mix(in srgb, var(--theme-accent, #D9D9D9) 45%, transparent) 0%, color-mix(in srgb, var(--theme-accent, #FFFFFF) 15%, transparent) 100%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(255, 255, 255, 0.4)",
        }}
      >
        <p className="text-white font-medium text-[10px] sm:text-[11px] leading-snug mb-2 sm:mb-3 line-clamp-2 drop-shadow">
          {description || "A delicious treat made with the finest ingredients."}
        </p>

        <div className="flex justify-between items-center mt-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
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
            className="text-white text-[10px] sm:text-[11px] font-bold border-b-2 border-white/70 pb-0.5 hover:text-white/80 transition-colors drop-shadow"
          >
            ask AI
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
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
            className="text-white text-[10px] sm:text-xs font-bold px-3 py-1 sm:px-4 sm:py-1.5 transition-transform hover:scale-105"
            style={{
              backgroundColor: "var(--theme-accent, #B91C1C)",
              borderRadius: "9999px",
            }}
          >
            ADD+
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function ProductPopupModal({ product, shapeProps = {}, onClose }: any) {
  const {
    borderRadius,
    borderWidth = 1,
    borderColor = "glass",
  } = shapeProps;

  const locale = useLocale();

  const productName = product.name[locale] || product.name["en"] || Object.values(product.name)[0] || "Unknown";
  const displayPrice = (product.price / 100).toFixed(2);
  const description = product.description
    ? typeof product.description === "string"
      ? product.description
      : product.description[locale] || product.description["en"] || Object.values(product.description)[0]
    : "";

  const cardRadius = resolveBorderRadius(borderRadius);
  const resolvedBorderColor = borderColor === "glass" ? "rgba(255,255,255,0.05)" : borderColor === "accent" ? "var(--theme-accent, oklch(0.922 0 0))" : borderColor;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-sm sm:max-w-md overflow-hidden flex flex-col h-[400px] sm:h-[450px] shadow-2xl shadow-black/80"
        style={{
          borderRadius: cardRadius,
          borderWidth: `${borderWidth}px`,
          borderStyle: "solid",
          borderColor: resolvedBorderColor,
          backgroundColor: "#000",
        }}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="absolute inset-0 z-0">
          <Image
            src={product.imageUrl || "/placeholder.svg"}
            alt={productName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
            priority
          />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
        </div>

        <div className="relative z-10 p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start gap-2">
          <h3 className="font-sans text-sm sm:text-base font-bold text-white tracking-wide leading-tight drop-shadow-md">
            {productName}
          </h3>
          <span className="text-sm sm:text-base font-bold text-white tabular-nums shrink-0 drop-shadow-md">
            {displayPrice} ₾
          </span>
        </div>

        <div className="flex-1" />

        <div
          className="relative z-20 p-4 sm:p-5 pt-4 pb-4 sm:pt-6 sm:pb-6 flex flex-col justify-end"
          style={{
            background: "linear-gradient(180deg, color-mix(in srgb, var(--theme-accent, #D9D9D9) 45%, transparent) 0%, color-mix(in srgb, var(--theme-accent, #FFFFFF) 15%, transparent) 100%)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(255, 255, 255, 0.4)",
          }}
        >
          <p className="text-white font-medium text-xs sm:text-sm leading-snug mb-3 sm:mb-4 drop-shadow">
            {description || "A delicious treat made with the finest ingredients."}
          </p>

          <div className="flex justify-between items-center mt-2">
            <button
              onClick={(e) => {
                e.preventDefault();
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
              className="text-white text-xs sm:text-sm font-bold border-b-2 border-white/70 pb-0.5 hover:text-white/80 transition-colors drop-shadow"
            >
              ask AI
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
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
              className="text-white text-xs sm:text-sm font-bold px-5 py-2 sm:px-6 sm:py-2.5 transition-transform hover:scale-105"
              style={{
                backgroundColor: "var(--theme-accent, #B91C1C)",
                borderRadius: "9999px",
              }}
            >
              ADD+
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
