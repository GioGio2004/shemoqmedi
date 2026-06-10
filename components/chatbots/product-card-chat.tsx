"use client";

import { useRef } from "react";
import Image from "next/image";
import { Check, Plus } from "lucide-react";
import gsap from "gsap";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  nutrition?: { isGlutenFree: boolean };
  allergens?: string[];
}

interface ProductCardChatProps {
  product: Product;
  isSelected: boolean;
  onToggle: (product: Product) => void;
  onAddToBasket: (product: Product) => void;
  primaryColor?: string;
  primaryColorLight?: string;
}

export function ProductCard({
  product,
  isSelected,
  onToggle,
  onAddToBasket,
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

  return (
    <div
      className="
        group relative flex-none w-[190px] h-[240px]
        flex flex-col overflow-hidden rounded-2xl
        snap-start transition-all duration-400 ease-out
        hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]
      "
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.15)", // Frosted glass
        borderColor: isSelected
          ? "rgba(255, 255, 255, 0.9)"
          : "rgba(255, 255, 255, 0.2)",
        borderWidth: "1px",
        borderStyle: "solid",
        backdropFilter: "blur(32px) saturate(200%)",
        WebkitBackdropFilter: "blur(32px) saturate(200%)",
        boxShadow: isSelected
          ? "0 0 24px rgba(255,255,255,0.15) inset, 0 12px 32px rgba(0,0,0,0.05)"
          : "0 12px 32px rgba(0,0,0,0.03)",
      }}
    >
      {/* ── Image Section ── */}
      <div className="relative w-full h-[60%]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          sizes="190px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Minimalist Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 items-center">
          <span className="px-2 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest text-white bg-black/60 backdrop-blur-md border border-white/10">
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
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  backdropFilter: "blur(8px)",
                }
          }
        >
          {isSelected ? (
            <Check className="w-3.5 h-3.5" strokeWidth={3} />
          ) : (
            <Plus className="w-3.5 h-3.5 text-white/70" strokeWidth={2} />
          )}
        </button>
      </div>

      {/* ── Info Section ── */}
      <div className="flex flex-col justify-between flex-1 px-4 pt-3 pb-4">
        <div className="min-w-0">
          <h3 className="text-sm font-black leading-tight truncate tracking-tight text-zinc-900 mix-blend-color-burn dark:text-white dark:mix-blend-normal">
            {product.name}
          </h3>
          <p className="text-[10px] leading-snug line-clamp-2 mt-1 text-zinc-600 font-medium mix-blend-color-burn dark:text-zinc-400 dark:mix-blend-normal">
            {product.description}
          </p>
        </div>

        {/* Price + ADD row */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold font-mono tracking-tighter text-zinc-900 mix-blend-color-burn dark:text-white dark:mix-blend-normal">
            ${product.price.toFixed(2)}
          </span>

          <button
            ref={addBtnRef}
            onClick={handleAddToBasket}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[9px] font-black uppercase tracking-widest transition-all duration-200 hover:bg-white/10 active:scale-95"
            style={{ 
              backgroundColor: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.4)",
            }}
          >
            <Plus className="w-3 h-3 text-white" strokeWidth={3} />
            ADD
          </button>
        </div>
      </div>
    </div>
  );
}
