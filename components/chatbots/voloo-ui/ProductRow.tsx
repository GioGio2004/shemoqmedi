import { memo, useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ProductCard } from "@/components/chatbots/product-card-chat";
import { Product } from "./types";
import { Sparkles, ChevronDown } from "lucide-react";

/**
 * ProductRow
 * ─────────────────────────────────────────────────────────────────────────────
 * Displays AI-recommended products from a chat message.
 *
 * Layout strategy:
 *  - Primary products (all but last):  shown immediately in a horizontal
 *    scrollable row labelled "RECOMMENDED".
 *  - Upsell product (last ID):         hidden behind a "See Suggested Pairing"
 *    button that animates open on click.
 *
 * This replaces the old hard-coded `.slice(0, 2)` limit so 2-3 primary items
 * can all be visible at once.
 */
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

    // Resolve all product IDs to actual Product objects (skip any missing)
    const allProducts = productIds
      .map((id) => localizedProducts.find((p) => p.id === id))
      .filter(Boolean) as Product[];

    if (allProducts.length === 0) return null;

    // If only 1 item, show it all; if 2+, treat the last as the upsell
    const hasUpsell = allProducts.length >= 2;
    const primaryProducts = hasUpsell ? allProducts.slice(0, -1) : allProducts;
    const upsellProduct = hasUpsell ? allProducts[allProducts.length - 1] : null;

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
        {/* ── Primary Products ── */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 ml-0.5">
            Recommended
          </p>
          {/* Horizontal scrollable row — snaps to each card */}
          <div className="flex gap-3 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide pb-2">
            {primaryProducts.map((product) => (
              <div key={product.id} className="snap-start shrink-0">
                <ProductCard
                  product={product as any}
                  isSelected={selectedContext.some((p) => p.id === product.id)}
                  onToggle={onToggleSelection}
                  onAddToBasket={onAddToBasket}
                  onOpenDetails={onOpenDetails}
                  primaryColor={primaryColor}
                  primaryColorLight={primaryColorLight}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Upsell Reveal Button ── */}
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

        {/* ── Upsell Product (revealed on click) ── */}
        {upsellProduct && showUpsell && (
          <div ref={upsellRef} className="overflow-hidden">
            <p
              className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2 ml-0.5 flex items-center gap-1.5"
              style={{ color: primaryColorLight }}
            >
              <Sparkles className="w-3 h-3" /> Perfect Pairing
            </p>
            <div className="flex gap-3 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide pb-2">
              <div className="snap-start shrink-0">
                <ProductCard
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
          </div>
        )}
      </div>
    );
  },
);
ProductRow.displayName = "ProductRow";
