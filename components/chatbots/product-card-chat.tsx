/**
 * product-card-chat.tsx
 *
 * A compact product card rendered inside the VolooAI chat widget.
 *
 * Phase 2 changes:
 *  - Removed ContactDropdown entirely (replaced by the in-app basket flow)
 *  - Added `onAddToBasket` prop — fires when the user taps the ADD button
 *  - Added `primaryColor` / `primaryColorLight` theme props so the ADD button
 *    and selection border use the cafe's brand colour instead of hardcoded orange
 */
"use client";

import { useRef } from "react";
import Image from "next/image";
import { Check, Plus } from "lucide-react";
import gsap from "gsap";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  color: string;
}

interface ProductCardChatProps {
  product: Product;
  isBackgroundDark: boolean;
  // ── Context-selection props ──
  isSelected: boolean;
  onToggle: (product: Product) => void;
  // ── Basket props ──
  /** Called when the user taps the ADD button in the card footer */
  onAddToBasket: (product: Product) => void;
  /** The cafe's primary brand colour — used for the ADD button gradient */
  primaryColor: string;
  /** The cafe's lighter accent colour — used for price badge and ADD button */
  primaryColorLight: string;
}

// ─── ProductCard ───────────────────────────────────────────────────────────────

export function ProductCard({
  product,
  isBackgroundDark,
  isSelected,
  onToggle,
  onAddToBasket,
  primaryColor,
  primaryColorLight,
}: ProductCardChatProps) {
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  // GSAP pop on every context-toggle (the ✓ / + button in the image corner)
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(product);
    if (toggleBtnRef.current) {
      gsap.fromTo(
        toggleBtnRef.current,
        { scale: 0.6 },
        { scale: 1, duration: 0.4, ease: "back.out(2.5)" }
      );
    }
  };

  // Micro-bounce on ADD tap to signal success
  const handleAddToBasket = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToBasket(product);
    if (addBtnRef.current) {
      gsap.fromTo(
        addBtnRef.current,
        { scale: 0.75 },
        { scale: 1, duration: 0.35, ease: "back.out(3)" }
      );
    }
  };

  return (
    <div
      className="
        group relative flex-none w-[190px] h-[240px]
        flex flex-col overflow-hidden rounded-2xl
        border shadow-2xl shadow-black/60
        snap-start
        transition-transform duration-300 ease-out
        hover:-translate-y-1.5
      "
      style={{
        backgroundColor: isBackgroundDark
          ? "rgba(30, 30, 35, 0.85)"
          : "rgba(255, 255, 255, 0.85)",
        borderColor: isSelected
          ? `${primaryColor}8c`        // brand-tinted glow border when selected
          : isBackgroundDark
            ? "rgba(255,255,255,0.08)"
            : "rgba(0,0,0,0.08)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        boxShadow: isSelected
          ? `0 0 0 1px ${primaryColor}66, 0 20px 40px rgba(0,0,0,0.6), 0 0 20px ${primaryColor}1f inset`
          : "0 20px 40px rgba(0,0,0,0.6)",
      }}
    >
      {/* ── Top 60%: Image ── */}
      <div className="relative w-full" style={{ height: "60%" }}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="190px"
        />

        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Category badge */}
        <span
          className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white"
          style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
        >
          {product.category}
        </span>

        {/*
          Context-Select Toggle Button (top-right corner)
          Unselected: faint circle + Plus icon
          Selected:   brand-coloured circle + Check icon + glow
        */}
        <button
          ref={toggleBtnRef}
          onClick={handleToggle}
          aria-label={isSelected ? "Remove from context" : "Add to context"}
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-150 focus:outline-none"
          style={
            isSelected
              ? {
                  backgroundColor: primaryColor,
                  boxShadow: `0 0 10px ${primaryColor}8c, 0 0 4px ${primaryColor}66`,
                  border: "1.5px solid rgba(255,255,255,0.30)",
                }
              : {
                  backgroundColor: "rgba(0,0,0,0.45)",
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  backdropFilter: "blur(6px)",
                }
          }
        >
          {isSelected ? (
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          ) : (
            <Plus className="w-3 h-3 text-white/70" strokeWidth={2.5} />
          )}
        </button>
      </div>

      {/* ── Bottom 40%: Info ── */}
      <div
        className="flex flex-col justify-between flex-1 px-3 pt-2 pb-2.5"
        style={{ height: "40%" }}
      >
        <div className="min-w-0">
          <h3
            className="text-xs font-black leading-tight truncate transition-colors duration-300"
            style={{ color: isSelected ? primaryColorLight : undefined }}
          >
            {product.name}
          </h3>
          <p className="text-[10px] leading-snug line-clamp-2 mt-0.5 opacity-55">
            {product.description}
          </p>
        </div>

        {/* Price + ADD row */}
        <div className="flex items-center justify-between gap-2 mt-1.5">
          {/* Price badge — uses brand accent colour */}
          <span
            className="text-xs font-black font-mono px-1.5 py-0.5 rounded-lg shrink-0"
            style={{
              backgroundColor: `${primaryColor}26`,
              color: primaryColorLight,
            }}
          >
            ${product.price.toFixed(2)}
          </span>

          {/*
            ADD button — replaces ContactDropdown.
            A sleek pill with a gradient background using the cafe's theme colour.
            GSAP bounce fires on every tap (handleAddToBasket).
          */}
          <button
            ref={addBtnRef}
            onClick={handleAddToBasket}
            aria-label={`Add ${product.name} to basket`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-white text-[9px] font-black uppercase tracking-wider transition-opacity duration-150 hover:opacity-90 active:opacity-75"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColorLight})`,
              boxShadow: `0 4px 12px ${primaryColor}4d`,
            }}
          >
            <Plus className="w-2.5 h-2.5" strokeWidth={3} />
            ADD
          </button>
        </div>
      </div>
    </div>
  );
}