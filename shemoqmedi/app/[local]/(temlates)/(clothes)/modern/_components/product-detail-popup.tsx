"use client";

import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    X, Star, Check, Minus, Plus, ShoppingBag, 
    TruckIcon, RotateCcw, ShieldCheck, Package 
} from "lucide-react";
import { Product } from "./data";

export function ProductDetailPopup({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>("description");

  useEffect(() => {
    if (product) {
        // Safe access to array elements with optional chaining and fallback
      setSelectedSize(product.sizes?.[2] || product.sizes?.[0] || "");
      setSelectedColor(product.colors?.[0] || "");
      setQuantity(1);
    }
  }, [product]);

  useGSAP(() => {
    if (product && overlayRef.current && cardRef.current) {
      // Animate in
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );

      gsap.fromTo(
        cardRef.current,
        { 
          scale: 0.8, 
          opacity: 0,
          y: 100 
        },
        { 
          scale: 1, 
          opacity: 1,
          y: 0,
          duration: 0.5, 
          ease: "back.out(1.2)" 
        }
      );
    }
  }, [product]);

  const handleClose = () => {
    if (overlayRef.current && cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 0.8,
        opacity: 0,
        y: 100,
        duration: 0.3,
        ease: "power2.in"
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: onClose
      });
    }
  };

  if (!product) return null;

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div 
        ref={cardRef}
        className="bg-[#0a0a1a] border border-white/10 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 z-10 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all group"
        >
          <X size={20} className="group-hover:rotate-90 transition-transform duration-300 text-white" />
        </button>

        <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
          {/* Left - Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden border border-white/10 relative group">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              {product.badge && (
                <Badge className="absolute top-4 left-4 bg-[#00e5ff] text-black text-xs font-black uppercase tracking-wider">
                  {product.badge}
                </Badge>
              )}
            </div>
            
            {/* Color swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all text-white ${
                      selectedColor === color
                        ? "bg-[#00e5ff] !text-black border-2 border-[#00e5ff]"
                        : "bg-white/5 border-2 border-white/10 hover:border-white/30"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - Details */}
          <div className="flex flex-col space-y-6 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
            <div>
              <h2 className="text-3xl md:text-4xl font-black uppercase italic mb-3 text-white">
                {product.name}
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      className={i < Math.floor(product.rating) ? "fill-[#00e5ff] text-[#00e5ff]" : "text-gray-600"} 
                    />
                  ))}
                </div>
                <span className="text-sm text-[#8888a0]">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
              <p className="text-4xl font-bold text-[#00e5ff] mb-2">
                ${product.price}
              </p>
              <p className="text-xs text-[#5a5a70] uppercase tracking-wider">
                Free shipping on orders over $100
              </p>
            </div>

            <Separator className="bg-white/10" />

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/5">
                <TabsTrigger value="description" className="text-xs uppercase font-bold text-white">
                  Details
                </TabsTrigger>
                <TabsTrigger value="features" className="text-xs uppercase font-bold text-white">
                  Features
                </TabsTrigger>
                <TabsTrigger value="specs" className="text-xs uppercase font-bold text-white">
                  Specs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-4 space-y-4">
                <p className="text-[#c8c8d0] leading-relaxed">
                  {product.description}
                </p>
              </TabsContent>

              <TabsContent value="features" className="mt-4">
                <ul className="space-y-3">
                  {product.features?.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#c8c8d0]">
                      <Check size={16} className="text-[#00e5ff] mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="specs" className="mt-4">
                <div className="space-y-3">
                  {product.specs?.map((spec, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-xs uppercase tracking-wider text-[#8888a0] font-bold">
                        {spec.label}
                      </span>
                      <span className="text-sm text-[#e8e8f0]">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <Separator className="bg-white/10" />

            {/* Size selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="text-xs uppercase font-bold mb-3 tracking-wider text-white">
                  Select Size
                </p>
                <div className="grid grid-cols-6 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-2 border rounded-lg text-sm font-bold transition-all text-white ${
                        selectedSize === size
                          ? "bg-[#00e5ff] !text-black border-[#00e5ff]"
                          : "border-white/10 hover:border-[#00e5ff]/50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-xs uppercase font-bold mb-3 tracking-wider text-white">
                Quantity
              </p>
              <div className="flex items-center gap-3 text-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 border border-white/10 rounded-lg hover:border-[#00e5ff] transition-all"
                >
                  <Minus size={16} />
                </button>
                <span className="text-2xl font-bold w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="p-3 border border-white/10 rounded-lg hover:border-[#00e5ff] transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <button className="w-full py-4 bg-[#00e5ff] text-black font-black uppercase text-sm tracking-widest rounded-xl hover:shadow-[0_0_40px_#00e5ff] transition-all flex items-center justify-center gap-2">
              <ShoppingBag size={18} /> 
              Add to Cart - ${product.price * quantity}
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs">
                <TruckIcon size={16} className="text-[#00e5ff]" />
                <span className="text-[#8888a0]">Free shipping</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <RotateCcw size={16} className="text-[#00e5ff]" />
                <span className="text-[#8888a0]">30-day returns</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck size={16} className="text-[#00e5ff]" />
                <span className="text-[#8888a0]">Secure checkout</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Package size={16} className="text-[#00e5ff]" />
                <span className="text-[#8888a0]">Gift packaging</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 229, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 229, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
