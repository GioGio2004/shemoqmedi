import { memo, useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ProductCard } from "@/components/chatbots/product-card-chat";
import { Product } from "./types";
import { Sparkles, ChevronDown } from "lucide-react";

export const ProductRow = memo(
  ({
    productIds,
    localizedProducts,
    isBackgroundDark,
    rowId,
    selectedContext,
    onToggleSelection,
    onAddToBasket,
    onOpenDetails,
    primaryColor,
    primaryColorLight,
  }: {
    productIds: number[];
    localizedProducts: Product[];
    isBackgroundDark: boolean;
    rowId: string;
    selectedContext: Product[];
    onToggleSelection: (product: Product) => void;
    onAddToBasket: (product: Product) => void;
    onOpenDetails?: (product: Product) => void;
    primaryColor: string;
    primaryColorLight: string;
  }) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const upsellRef = useRef<HTMLDivElement>(null);
    const [showUpsell, setShowUpsell] = useState(false);

    useEffect(() => {
      if (!rowRef.current) return;
      gsap.fromTo(
        rowRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", delay: 0.1 },
      );
    }, []);

    const products = productIds
      .slice(0, 2) // We strictly handle up to 2 items: primary and upsell
      .map((id) => localizedProducts.find((p) => p.id === id))
      .filter(Boolean) as Product[];

    if (products.length === 0) return null;

    const primaryProduct = products[0];
    const upsellProduct = products.length > 1 ? products[1] : null;

    const handleRevealUpsell = () => {
      setShowUpsell(true);
      setTimeout(() => {
        if (upsellRef.current) {
          gsap.fromTo(
            upsellRef.current,
            { opacity: 0, height: 0, scale: 0.95 },
            { opacity: 1, height: "auto", scale: 1, duration: 0.5, ease: "back.out(1.2)" }
          );
        }
      }, 0);
    };

    return (
      <div ref={rowRef} className={`product-row-${rowId} mt-3 flex flex-col gap-3`}>
        {/* Primary Product */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 ml-0.5">
            Recommended
          </p>
          <div className="flex gap-3 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide pb-2">
            <ProductCard
              key={primaryProduct.id}
              product={primaryProduct as any}
              isSelected={selectedContext.some((p) => p.id === primaryProduct.id)}
              onToggle={onToggleSelection}
              onAddToBasket={onAddToBasket}
              onOpenDetails={onOpenDetails}
              primaryColor={primaryColor}
              primaryColorLight={primaryColorLight}
            />
          </div>
        </div>

        {/* Upsell Reveal Button */}
        {upsellProduct && !showUpsell && (
          <button
            onClick={handleRevealUpsell}
            className="self-start flex items-center gap-2 px-4 py-2 mt-1 rounded-full text-xs font-bold transition-all duration-300 hover:bg-white/10 active:scale-95 border border-white/10"
            style={{ color: primaryColorLight, backgroundColor: "rgba(255,255,255,0.05)" }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            See Suggested Pairing
            <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-70" />
          </button>
        )}

        {/* Upsell Product (Hidden initially) */}
        {upsellProduct && showUpsell && (
          <div ref={upsellRef} className="overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 ml-0.5 flex items-center gap-1.5" style={{ color: primaryColorLight }}>
              <Sparkles className="w-3 h-3" /> Perfect Pairing
            </p>
            <div className="flex gap-3 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide pb-2">
              <ProductCard
                key={upsellProduct.id}
                product={upsellProduct as any}
                isSelected={selectedContext.some((p) => p.id === upsellProduct.id)}
                onToggle={onToggleSelection}
                onAddToBasket={onAddToBasket}
                onOpenDetails={onOpenDetails}
                primaryColor={primaryColor}
                primaryColorLight={primaryColorLight}
              />
            </div>
          </div>
        )}
      </div>
    );
  },
);
ProductRow.displayName = "ProductRow";
