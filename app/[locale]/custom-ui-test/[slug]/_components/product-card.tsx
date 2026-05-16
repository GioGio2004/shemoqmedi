"use client";

import Image from "next/image";
import { ContactDropdown } from "./contact-dropdown";

import type { ConvexMenuItem } from "./menu-section";

interface Product extends ConvexMenuItem {
  categoryName: string;
}

export function ProductCard({ product, socialLinks }: { product: Product; socialLinks: any }) {
  const productName = product.name["en"] || Object.values(product.name)[0] || "Unknown";
  const displayPrice = (product.price / 100).toFixed(2);
  return (
    <div className="group rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <Image
          src={product.imageUrl || "/placeholder.svg"}
          alt={productName}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={product.sortOrder <= 3}
        />
        {/* Category badge */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium text-foreground tracking-wide">
          {product.categoryName}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-serif text-foreground">{productName}</h3>
          <span className="text-base font-medium text-primary">${displayPrice}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {product.description ? (typeof product.description === 'string' ? product.description : product.description["en"] || Object.values(product.description)[0]) : ""}
        </p>

        {/* Benefits */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {product.tags?.map((benefit) => (
            <span
              key={benefit}
              className="px-2.5 py-0.5 rounded-full bg-secondary text-xs font-medium text-muted-foreground"
            >
              {benefit}
            </span>
          ))}
        </div>

        {/* Order button */}
        <div className="flex justify-end pt-4 border-t border-border">
          <ContactDropdown
            productName={productName}
            productCategory={product.categoryName}
            productPrice={Number(displayPrice)}
            productImage={product.imageUrl || ""}
            socialLinks={socialLinks}
          />
        </div>
      </div>
    </div>
  );
}
