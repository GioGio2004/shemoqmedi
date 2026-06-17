"use client";

import { useRef, memo } from "react";
import Image from "next/image";
import { Check, Plus } from "lucide-react";
import gsap from "gsap";

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  ingredients?: string;
  nutrition?: { isGlutenFree: boolean };
  allergens?: string[];
}

interface ProductCardChatProps {
  product: Product;
  isSelected: boolean;
  onToggle: (product: Product) => void;
  onAddToBasket: (product: Product) => void;
  onOpenDetails?: (product: Product) => void;
  primaryColor?: string;
  primaryColorLight?: string;
}

export const ProductCard = memo(function ProductCard({
  product,
  isSelected,
  onToggle,
  onAddToBasket,
  onOpenDetails,
  primaryColor = "#ea580c",
  primaryColorLight = "#f97316",
}: ProductCardChatProps) {
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(product);
    if (toggleBtnRef.current) {
      gsap.fromTo(
        toggleBtnRef.current,
        { scale: 0.6 },
        { scale: 1, duration: 0.4, ease: "back.out(2.5)" },
      );
    }
  };

  const handleAddToBasket = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToBasket(product);
    if (addBtnRef.current) {
      gsap.fromTo(
        addBtnRef.current,
        { scale: 0.8 },
        { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)" },
      );
    }
  };

  const handleCardClick = () => {
    if (onOpenDetails) {
      onOpenDetails(product);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="
        group relative flex-none w-[190px] h-[240px]
        flex flex-col overflow-hidden rounded-lg cursor-pointer
        snap-start transition-all duration-400 ease-out
        hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)]
      "
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.1)", // Glassmorphism
        borderColor: isSelected
          ? "rgba(255, 255, 255, 0.8)"
          : "rgba(255, 255, 255, 0.15)",
        borderWidth: "1px",
        borderStyle: "solid",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        boxShadow: isSelected
          ? "0 0 20px rgba(255,255,255,0.1) inset, 0 10px 30px rgba(0,0,0,0.1)"
          : "0 8px 30px rgba(0,0,0,0.05)",
      }}
    >
      {/* ── Image Section ── */}
      <div className="relative w-full h-[60%] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="190px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Minimalist Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 items-center">
          <span className="px-2 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest text-white bg-black/40 backdrop-blur-md border border-white/10">
            {product.category}
          </span>
        </div>

        {/* Stark White Toggle Button */}
        <button
          ref={toggleBtnRef}
          onClick={handleToggle}
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
          style={
            isSelected
              ? {
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(255,255,255,0.3)",
                }
              : {
                  backgroundColor: "rgba(0,0,0,0.4)",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  backdropFilter: "blur(8px)",
                }
          }
        >
          {isSelected ? (
            <Check className="w-3.5 h-3.5" strokeWidth={3} />
          ) : (
            <Plus className="w-3.5 h-3.5 text-white/80" strokeWidth={2} />
          )}
        </button>
      </div>

      {/* ── Info Section ── */}
      <div className="flex flex-col justify-between flex-1 px-4 pt-3 pb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-black leading-tight truncate tracking-tight text-white mix-blend-normal">
            {product.name}
          </h3>
          <p className="text-[10px] leading-snug line-clamp-2 mt-0.5 text-zinc-300 font-medium mix-blend-normal">
            {product.description}
          </p>
        </div>

        {/* Price + ADD row */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold font-mono tracking-tighter text-white mix-blend-normal">
            ${product.price.toFixed(2)}
          </span>

          <button
            ref={addBtnRef}
            onClick={handleAddToBasket}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[9px] font-black uppercase tracking-widest transition-all duration-200 hover:bg-white/15 active:scale-95"
            style={{ 
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Plus className="w-3 h-3 text-white" strokeWidth={3} />
            ADD
          </button>
        </div>
      </div>
    </div>
  );
});
