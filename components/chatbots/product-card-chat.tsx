"use client";

import { useRef } from "react";
import Image from "next/image";
import { Check, Plus } from "lucide-react";
import gsap from "gsap";
import { ContactDropdown } from "../../app/[locale]/(temlates)/(coffee-shops)/coffee-3/_components/contact-dropdown";

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
}

export function ProductCard({
  product,
  isBackgroundDark,
  isSelected,
  onToggle,
}: ProductCardChatProps) {
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  // GSAP pop on every toggle — only animates the button, never the card layout
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't interfere with horizontal scroll
    onToggle(product);

    if (toggleBtnRef.current) {
      gsap.fromTo(
        toggleBtnRef.current,
        { scale: 0.6 },
        { scale: 1, duration: 0.4, ease: "back.out(2.5)" }
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
          ? "rgba(249,115,22,0.55)"   // orange glow border when selected
          : isBackgroundDark
            ? "rgba(255,255,255,0.08)"
            : "rgba(0,0,0,0.08)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        // Subtle orange inner glow when selected
        boxShadow: isSelected
          ? "0 0 0 1px rgba(249,115,22,0.4), 0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(249,115,22,0.12) inset"
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

        {/* ── Context-Select Toggle Button ──
            Replaces the colour dot. Lives in the top-right corner of the image.
            Unselected: faint outline circle with a Plus icon.
            Selected:   orange filled circle with a Check icon + glow.
        */}
        <button
          ref={toggleBtnRef}
          onClick={handleToggle}
          aria-label={isSelected ? "Remove from context" : "Add to context"}
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-150 focus:outline-none"
          style={
            isSelected
              ? {
                  backgroundColor: "#ea580c",
                  boxShadow: "0 0 10px rgba(234,88,12,0.55), 0 0 4px rgba(234,88,12,0.4)",
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
            style={{ color: isSelected ? "#f97316" : undefined }}
          >
            {product.name}
          </h3>
          <p className="text-[10px] leading-snug line-clamp-2 mt-0.5 opacity-55">
            {product.description}
          </p>
        </div>

        {/* Price + Order row */}
        <div className="flex items-center justify-between gap-2 mt-1.5">
          <span
            className="text-xs font-black font-mono px-1.5 py-0.5 rounded-lg shrink-0"
            style={{
              backgroundColor: "rgba(234,88,12,0.15)",
              color: "#f97316",
            }}
          >
            ${product.price.toFixed(2)}
          </span>

          <ContactDropdown
            productName={product.name}
            productCategory={product.category}
            productPrice={product.price}
            productImage={product.image}
            colorClass="
              bg-gradient-to-r from-orange-600 to-orange-500
              hover:from-orange-500 hover:to-orange-400
              text-white text-[9px] px-2.5 py-1
              shadow-md shadow-orange-900/30
              font-black uppercase tracking-wider rounded-lg
              transition-all duration-200
            "
          />
        </div>
      </div>
    </div>
  );
}