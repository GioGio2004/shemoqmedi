"use client";

import { useMemo } from "react";
import { PRODUCTS } from "./image-listing";
import { ProductCard } from "./product-card";

const CATEGORIES = ["All", "Signature", "Seasonal", "Espresso", "Tea", "Iced", "Bakery"];

export function MenuSection({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}) {
  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return PRODUCTS;
    return PRODUCTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <section id="menu" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <span className="text-xs font-medium tracking-[0.25em] uppercase text-primary mb-3 block">
              Our Selection
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-foreground text-balance">
              Curated essentials for the
              <br className="hidden md:block" />
              <span className="italic text-primary"> modern palette</span>
            </h2>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-serif">No items found in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
}
