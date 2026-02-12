"use client";

import { useState, useRef, useEffect } from "react";
import { SELLER_CONFIG } from "@/lib/sellers-config";
import { useTranslations } from "next-intl";
import { Mail, MessageCircle, Instagram, Send, X, Check, Package, Edit3 } from "lucide-react";

interface PricingContactDropdownProps {
  packageName: string;
  packagePrice: string;
  currency: string;
  buttonText: string;
  colorClass?: string; // e.g. "bg-white text-black" or "bg-red-800 text-white"
  variant?: "outline" | "solid";
}

export function PricingContactDropdown({
  packageName,
  packagePrice,
  currency,
  buttonText,
  colorClass = "bg-zinc-900 text-white",
  variant = "solid"
}: PricingContactDropdownProps) {
  const t = useTranslations("Landing.Pricing.Popup");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Message Construction
  const messageText = `Hi! I'm interested in the ${packageName} package (${packagePrice} ${currency}).\n\nPackage: ${packageName}\nPrice: ${packagePrice} ${currency}`;
  const customMessageText = `Hi! I'm interested in a Custom Package/Order. I'd like to discuss...`;

  const encodedMessage = encodeURIComponent(messageText);
  const encodedCustomMessage = encodeURIComponent(customMessageText);

  const whatsappUrl = `https://wa.me/${SELLER_CONFIG.whatsapp}?text=${encodedMessage}`;
  const whatsappCustomUrl = `https://wa.me/${SELLER_CONFIG.whatsapp}?text=${encodedCustomMessage}`;

  const instagramUrl = `https://ig.me/m/${SELLER_CONFIG.instagram}`;

  const emailSubject = encodeURIComponent(
    `Order Inquiry: ${packageName} - ${packagePrice} ${currency}`
  );
  const emailCustomSubject = encodeURIComponent(`Custom Order Inquiry`);
  
  const emailBody = encodeURIComponent(
    `Hello,\n\nI'd like to order:\n\nPackage: ${packageName}\nPrice: ${packagePrice} ${currency}`
  );
  const emailCustomBody = encodeURIComponent(
    `Hello,\n\nI have a custom request...\n\n`
  );

  const emailUrl = `mailto:${SELLER_CONFIG.email}?subject=${emailSubject}&body=${emailBody}`;
  const emailCustomUrl = `mailto:${SELLER_CONFIG.email}?subject=${emailCustomSubject}&body=${emailCustomBody}`;

  // Base classes for the button
  const baseButtonClasses = "w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden";
  const solidClasses = `${colorClass} hover:opacity-90 hover:scale-[1.02] hover:shadow-lg`;
  const outlineClasses = "border border-zinc-700 text-white hover:bg-zinc-800 hover:border-zinc-600";
  
  const buttonClasses = `${baseButtonClasses} ${variant === "solid" ? solidClasses : outlineClasses}`;

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClasses}
      >
        <span>{buttonText}</span>
        {/* Animated Icon */}
        <Package className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-12 scale-110" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      <div 
        className={`
          absolute bottom-full left-0 w-full mb-3 
          bg-white/10 backdrop-blur-xl border border-white/10 
          rounded-2xl shadow-2xl overflow-hidden z-50 
          transition-all duration-300 origin-bottom
          ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"}
        `}
      >
        <div className="p-2 space-y-1">
          <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider opacity-70">
            {t("choose_platform")}
          </div>

          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-green-500/10 hover:border-green-500/20 border border-transparent transition-all group/item"
          >
            <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center group-hover/item:bg-green-500 group-hover/item:text-white transition-all">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div className="flex-grow">
              <div className="text-sm font-bold text-zinc-200 group-hover/item:text-white transition-colors">{t("whatsapp")}</div>
              <div className="text-[10px] text-zinc-500 group-hover/item:text-green-200/70 transition-colors">Instant Chat</div>
            </div>
            <Send className="w-3 h-3 text-zinc-600 group-hover/item:text-green-400 -translate-x-2 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
          </a>

          {/* Instagram */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-pink-500/10 hover:border-pink-500/20 border border-transparent transition-all group/item"
          >
            <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-500 flex items-center justify-center group-hover/item:bg-pink-500 group-hover/item:text-white transition-all">
              <Instagram className="w-4 h-4" />
            </div>
            <div className="flex-grow">
              <div className="text-sm font-bold text-zinc-200 group-hover/item:text-white transition-colors">{t("instagram")}</div>
              <div className="text-[10px] text-zinc-500 group-hover/item:text-pink-200/70 transition-colors">DM Us</div>
            </div>
          </a>

          {/* Email */}
          <a
            href={emailUrl}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-blue-500/10 hover:border-blue-500/20 border border-transparent transition-all group/item"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center group-hover/item:bg-blue-500 group-hover/item:text-white transition-all">
              <Mail className="w-4 h-4" />
            </div>
            <div className="flex-grow">
              <div className="text-sm font-bold text-zinc-200 group-hover/item:text-white transition-colors">{t("email")}</div>
              <div className="text-[10px] text-zinc-500 group-hover/item:text-blue-200/70 transition-colors">Official Request</div>
            </div>
          </a>

        </div>
      </div>

      
      {/* Overlay for closing (mobile friendly) */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
