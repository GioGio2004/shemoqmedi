"use client";

import Image from "next/image";
import { ContactDropdown } from "./contact-dropdown";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  benefits: string[];
  color: string;
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={product.id <= 3}
        />
        {/* Category badge */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium text-foreground tracking-wide">
          {product.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-serif text-foreground">{product.name}</h3>
          <span className="text-base font-medium text-primary">${product.price}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Benefits */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {product.benefits.map((benefit) => (
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
            productName={product.name}
            productCategory={product.category}
            productPrice={product.price}
            productImage={product.image}
          />
        </div>
      </div>
    </div>
  );
}
