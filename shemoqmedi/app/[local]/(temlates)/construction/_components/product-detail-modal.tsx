"use client";

import { useEffect, useRef } from "react";
import { ContactDropdown } from "./contact-dropdown";

interface ProductSpec {
  label: string;
  value: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  specs: ProductSpec[];
  tags: string[];
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
}: ProductDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Product details for ${product.name}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#2C1A0E]/80 backdrop-blur-sm" />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#FAF6F1] shadow-2xl border border-[#D4C5B2]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-[#2C1A0E] text-[#FAF6F1] hover:bg-[#8B5E3C] transition-colors"
          aria-label="Close modal"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Side */}
          <div className="relative h-72 md:h-auto md:min-h-[500px] bg-[#E8DDD0]">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 px-3 py-1 bg-[#2C1A0E] text-[#FAF6F1] text-xs font-bold uppercase tracking-wider">
              {product.category}
            </div>
          </div>

          {/* Details Side */}
          <div className="p-6 md:p-8 flex flex-col">
            <div className="flex-grow">
              <h2 className="font-serif text-3xl md:text-4xl text-[#2C1A0E] mb-2">
                {product.name}
              </h2>
              <div className="text-3xl font-bold text-[#8B5E3C] mb-4">
                ${product.price}
                <span className="text-sm font-normal text-[#8B7355] ml-1">
                  / sheet
                </span>
              </div>

              <p className="text-[#5C4A3A] leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Specs Table */}
              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#8B7355] mb-3">
                  Specifications
                </h3>
                <div className="border border-[#D4C5B2]">
                  {product.specs.map((spec, idx) => (
                    <div
                      key={idx}
                      className={`flex ${idx !== product.specs.length - 1 ? "border-b border-[#D4C5B2]" : ""}`}
                    >
                      <div className="w-1/3 px-4 py-3 bg-[#E8DDD0] text-xs font-bold uppercase tracking-wider text-[#5C4A3A]">
                        {spec.label}
                      </div>
                      <div className="w-2/3 px-4 py-3 text-sm text-[#2C1A0E]">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[#E8DDD0] text-[#5C4A3A] text-xs font-semibold uppercase tracking-wider border border-[#D4C5B2]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#D4C5B2]">
              <div className="text-sm text-[#8B7355]">
                Available for bulk orders
              </div>
              <ContactDropdown
                productName={product.name}
                productPrice={product.price}
                productImage={product.image}
                productCategory={product.category}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
