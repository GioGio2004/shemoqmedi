import { memo, useRef, useEffect } from "react";
import gsap from "gsap";
import { ProductCard } from "@/components/chatbots/product-card-chat";
import { Product } from "./types";

export const ProductRow = memo(
  ({
    productIds,
    localizedProducts,
    isBackgroundDark,
    rowId,
    selectedContext,
    onToggleSelection,
    onAddToBasket,
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
    primaryColor: string;
    primaryColorLight: string;
  }) => {
    const rowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!rowRef.current) return;
      gsap.fromTo(
        rowRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", delay: 0.1 },
      );
    }, []);

    const products = productIds
      .map((id) => localizedProducts.find((p) => p.id === id))
      .filter(Boolean) as Product[];

    if (products.length === 0) return null;

    return (
      <div ref={rowRef} className={`product-row-${rowId} mt-3`}>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 ml-0.5">
          Recommendations
        </p>
        <div className="flex gap-3 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide pb-2">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product as any}
              isSelected={selectedContext.some((p) => p.id === product.id)}
              onToggle={onToggleSelection}
              onAddToBasket={onAddToBasket}
            />
          ))}
        </div>
      </div>
    );
  },
);
ProductRow.displayName = "ProductRow";
