"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Product, useCart } from "./cart-context";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations("ShopTemplate.Products");
  const { addItem } = useCart();

  return (
    <div className="group relative bg-white/40 backdrop-blur-md rounded-3xl p-4 border border-white/50 hover:border-blue-400/50 hover:bg-white/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      {/* Image Area */}
      <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-gray-100 mb-4">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-2 right-2 bg-black/10 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-800">
          {product.category}
        </div>
      </div>

      {/* Content */}
      <div className="flex justify-between items-end">
        <div>
          <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">{product.name}</h3>
          <p className="text-blue-600 font-mono font-bold">${product.price}</p>
        </div>

        {/* Add Button */}
        <button
          onClick={() => addItem(product)}
          className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg active:scale-90"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
