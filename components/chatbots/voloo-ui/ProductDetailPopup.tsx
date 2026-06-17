import { useEffect, useRef } from "react";
import Image from "next/image";
import { X, Plus, Info } from "lucide-react";
import gsap from "gsap";
import { Product } from "./types";

interface ProductDetailPopupProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToBasket: (product: Product) => void;
  primaryColor: string;
}

export function ProductDetailPopup({
  product,
  isOpen,
  onClose,
  onAddToBasket,
  primaryColor,
}: ProductDetailPopupProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (overlayRef.current && modalRef.current) {
        gsap.set(overlayRef.current, { display: "flex", opacity: 0 });
        gsap.set(modalRef.current, { y: 40, opacity: 0, scale: 0.95 });

        const tl = gsap.timeline();
        tl.to(overlayRef.current, { opacity: 1, duration: 0.3, ease: "power2.out" })
          .to(
            modalRef.current,
            { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.2)" },
            "-=0.2"
          );
      }
    } else {
      if (overlayRef.current && modalRef.current) {
        const tl = gsap.timeline({
          onComplete: () => {
            if (overlayRef.current) {
              gsap.set(overlayRef.current, { display: "none" });
            }
          },
        });
        tl.to(modalRef.current, { y: 20, opacity: 0, scale: 0.98, duration: 0.25, ease: "power2.in" })
          .to(overlayRef.current, { opacity: 0, duration: 0.2 }, "-=0.1");
      }
    }
  }, [isOpen]);

  const handleAddToBasket = () => {
    onAddToBasket(product);
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] hidden items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-zinc-50 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative w-full h-64 bg-zinc-200">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-transparent to-transparent opacity-90" />
        </div>

        {/* Content Section */}
        <div className="p-6 pt-2 flex flex-col flex-1">
          {/* Header */}
          <div className="flex justify-between items-start gap-4 mb-2">
            <div>
              <span 
                className="text-[10px] uppercase tracking-widest font-black mb-1 block"
                style={{ color: primaryColor }}
              >
                {product.category}
              </span>
              <h2 className="text-2xl font-black text-zinc-900 leading-tight">
                {product.name}
              </h2>
            </div>
            <div 
              className="text-xl font-bold font-mono tracking-tighter shrink-0"
              style={{ color: primaryColor }}
            >
              ${product.price.toFixed(2)}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-600 leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Details & Tags */}
          <div className="flex flex-col gap-4 mb-8">
            {product.ingredients && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Ingredients
                </span>
                <span className="text-xs text-zinc-500">{product.ingredients}</span>
              </div>
            )}
            {product.allergens && product.allergens.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.allergens.map((allergen, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-auto pt-4 border-t border-zinc-200">
            <button
              onClick={handleAddToBasket}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm tracking-wide shadow-lg transition-transform hover:-translate-y-0.5 active:scale-95"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
              Add to Order — ${product.price.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
