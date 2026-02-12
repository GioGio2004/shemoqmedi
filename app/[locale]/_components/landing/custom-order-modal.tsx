"use client";

import { useState, useEffect, useRef } from "react";
import { X, Check, ArrowRight, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { SELLER_CONFIG } from "@/lib/sellers-config";

interface CustomOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomOrderModal({ isOpen, onClose }: CustomOrderModalProps) {
  const t = useTranslations("Landing.Pricing.CustomModal");
  const [includeAI, setIncludeAI] = useState(false);
  const [includeCMS, setIncludeCMS] = useState(false);
  const [customRequest, setCustomRequest] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    // Construct message
    let features = [t("basic_site")];
    if (includeAI) features.push(t("ai_integration"));
    if (includeCMS) features.push(t("cms"));

    const message = `Hello, I'm interested in a Custom Order.\n\nRequired Features:\n- ${features.join("\n- ")}\n\nDetails:\n${customRequest}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${SELLER_CONFIG.whatsapp}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">{t("title")}</h2>
          <p className="text-zinc-400 text-sm">{t("subtitle")}</p>
        </div>

        <div className="space-y-6">
          {/* Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">{t("select_features")}</h3>
            
            {/* Basic Site (Always Selected) */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 opacity-70 cursor-not-allowed">
              <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-zinc-300 font-medium">{t("basic_site")}</span>
              <span className="ml-auto text-xs text-zinc-500">{t("included")}</span>
            </div>

            {/* AI Integration */}
            <label className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/30 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all group">
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${includeAI ? "bg-purple-500 border-purple-500" : "border-zinc-600 group-hover:border-zinc-500"}`}>
                {includeAI && <Check className="w-4 h-4 text-white" />}
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={includeAI} 
                onChange={(e) => setIncludeAI(e.target.checked)} 
              />
              <span className="text-zinc-200 font-medium">{t("ai_integration")}</span>
            </label>

            {/* CMS */}
            <label className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/30 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all group">
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${includeCMS ? "bg-purple-500 border-purple-500" : "border-zinc-600 group-hover:border-zinc-500"}`}>
                {includeCMS && <Check className="w-4 h-4 text-white" />}
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={includeCMS} 
                onChange={(e) => setIncludeCMS(e.target.checked)} 
              />
              <span className="text-zinc-200 font-medium">{t("cms")}</span>
            </label>
          </div>

          {/* Custom Message */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">{t("your_vision")}</h3>
            <textarea
              value={customRequest}
              onChange={(e) => setCustomRequest(e.target.value)}
              placeholder={t("placeholder")}
              className="w-full h-32 bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 resize-none placeholder:text-zinc-600"
            />
          </div>

          <button
            onClick={handleSend}
            className="w-full py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
          >
            <span>{t("send_request")}</span>
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
