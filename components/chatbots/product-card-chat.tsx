"use client";

import Image from "next/image";
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
}

export function ProductCard({ product, isBackgroundDark }: ProductCardChatProps) {
  return (
    <div 
      className="group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]"
      style={{
        backgroundColor: isBackgroundDark ? "rgba(20,20,20,0.9)" : "rgba(255,255,255,0.9)",
        border: `1px solid ${isBackgroundDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
        backdropFilter: "blur(30px) saturate(180%)",
        WebkitBackdropFilter: "blur(30px) saturate(180%)"
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <Image 
          src={product.image} 
          alt={product.name} 
          fill 
          className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
          sizes="(max-width: 768px) 100vw, 300px"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-widest text-white">
            {product.category}
          </span>
        </div>
        
        {/* Color Indicator */}
        <div className="absolute top-3 right-3">
          <div className={`w-8 h-8 ${product.color} rounded-full border-2 border-white/30 shadow-lg backdrop-blur-sm`} />
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Title & Price */}
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-base font-black leading-tight group-hover:text-orange-500 transition-colors duration-300 flex-1">
            {product.name}
          </h3>
          <span 
            className="text-lg font-black font-mono shrink-0 px-2 py-1 rounded-lg"
            style={{
              backgroundColor: isBackgroundDark ? "rgba(234,88,12,0.1)" : "rgba(234,88,12,0.05)",
              color: "#ea580c"
            }}
          >
            ${product.price.toFixed(2)}
          </span>
        </div>
        
        {/* Description */}
        <p 
          className="text-xs leading-relaxed line-clamp-2 min-h-[2.5em]"
          style={{
            color: isBackgroundDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"
          }}
        >
          {product.description}
        </p>
        
        {/* Action Area */}
        <div 
          className="flex items-center justify-between pt-4 border-t"
          style={{
            borderColor: isBackgroundDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
          }}
        >
          {/* Visual Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${product.color} shadow-lg`} />
            <span className="text-[10px] font-mono uppercase tracking-wider opacity-50">
              {product.category}
            </span>
          </div>
          
          {/* Order Button */}
          <ContactDropdown 
            productName={product.name}
            productCategory={product.category}
            productPrice={product.price}
            productImage={product.image}
            colorClass="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white text-xs px-5 py-2.5 shadow-lg shadow-orange-900/30 hover:shadow-orange-900/50 font-black uppercase tracking-wider"
          />
        </div>
      </div>
      
      {/* Hover Glow Effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(234,88,12,0.05) 0%, transparent 70%)"
        }}
      />
    </div>
  );
}