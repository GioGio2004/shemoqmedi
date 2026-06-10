import { memo, useRef, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import gsap from "gsap";
import { Product } from "./types";

// ─── ContextChip ──────────────────────────────────────────────────────────────
// A compact, removable chip that sits above the floating input pill.
export const ContextChip = memo(
  ({
    product,
    onRemove,
  }: {
    product: Product;
    onRemove: (id: number) => void;
  }) => {
    const chipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!chipRef.current) return;
      // Entrance: fade in + slide up from the input pill
      gsap.fromTo(
        chipRef.current,
        { opacity: 0, y: 8, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.8)" },
      );
    }, []);

    const handleRemove = () => {
      if (!chipRef.current) {
        onRemove(product.id);
        return;
      }
      // Exit animation before removing from state
      gsap.to(chipRef.current, {
        opacity: 0,
        scale: 0.85,
        y: 4,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => onRemove(product.id),
      });
    };

    return (
      <div
        ref={chipRef}
        className="relative overflow-hidden flex items-center gap-1.5 pl-0.5 pr-1.5 py-0.5 rounded-[20px] backdrop-blur-[20px] bg-gradient-to-b from-white/10 to-white/5 shadow-md"
      >
        <div className="absolute inset-0 rounded-[20px] border border-white/20 pointer-events-none" />
        {/* Tiny thumbnail */}
        <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-white/10">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="20px"
          />
        </div>

        {/* Name — capped width */}
        <span className="text-[10px] font-semibold text-zinc-300 max-w-[90px] truncate">
          {product.name}
        </span>

        {/* Remove button */}
        <button
          onClick={handleRemove}
          aria-label={`Remove ${product.name} from context`}
          className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-white/10 transition-all duration-150 shrink-0"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      </div>
    );
  },
);
ContextChip.displayName = "ContextChip";
