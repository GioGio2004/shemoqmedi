"use client";

import { useState } from "react";
import { Check, Sparkles, LayoutDashboard, Globe, Settings, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { PricingContactDropdown } from "./pricing-contact-dropdown";
import { CustomOrderModal } from "./custom-order-modal";

export function PricingTable() {
  const t = useTranslations("Landing.Pricing");
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  return (
    <section className="py-16 md:py-32 px-4 sm:px-6 bg-black">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-10 md:mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white">{t("title")}</h2>
          <p className="text-zinc-400 text-sm md:text-lg max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Changed grid gap for mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
          
          {/* STARTER */}
          <div className="p-6 md:p-8 rounded-[2rem] border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-colors relative flex flex-col">
            <div className="mb-6 p-3 w-fit rounded-2xl bg-zinc-800/50">
              <Globe className="w-5 h-5 md:w-6 md:h-6 text-zinc-400" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">{t("starter.title")}</h3>
            <div className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">{t("starter.price")} <span className="text-base md:text-lg font-normal text-zinc-500">{t("currency")}</span></div>
            
            <ul className="space-y-3 md:space-y-4 mb-8 flex-grow">
              {(t.raw("starter.features") as string[]).map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-400 text-sm">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-zinc-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <PricingContactDropdown 
              packageName={t("starter.title")}
              packagePrice={t("starter.price")}
              currency={t("currency")}
              buttonText={t("button")}
              colorClass="border border-zinc-700 text-white hover:bg-zinc-800"
              variant="outline"
            />
          </div>

          {/* PRO - AI Integration */}
          <div className="p-6 md:p-8 rounded-[2rem] border-2 border-red-900/50 bg-zinc-900/40 shadow-[0_0_50px_rgba(127,29,29,0.1)] relative flex flex-col">
            {/* Badge Position Adjustment */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-red-800 text-white text-[10px] md:text-xs font-bold rounded-full uppercase tracking-wider shadow-lg whitespace-nowrap z-10">
              {t("bg_badge")}
            </div>
            <div className="mb-6 p-3 w-fit rounded-2xl bg-red-900/20 border border-red-900/30">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">{t("pro.title")}</h3>
            <div className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">{t("pro.price")} <span className="text-base md:text-lg font-normal text-zinc-500">{t("currency")}</span></div>
            
            <ul className="space-y-3 md:space-y-4 mb-8 flex-grow">
              {(t.raw("pro.features") as string[]).map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-300 text-sm">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-red-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <PricingContactDropdown 
              packageName={t("pro.title")}
              packagePrice={t("pro.price")}
              currency={t("currency")}
              buttonText={t("button")}
              colorClass="bg-red-800 text-white"
              variant="solid"
            />
          </div>

          {/* FULL PACKAGE */}
          <div className="p-6 md:p-8 rounded-[2rem] border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-colors flex flex-col">
            <div className="mb-6 p-3 w-fit rounded-2xl bg-zinc-800/50">
               <LayoutDashboard className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">{t("full.title")}</h3>
            <div className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">{t("full.price")} <span className="text-base md:text-lg font-normal text-zinc-500">{t("currency")}</span></div>
            
            <ul className="space-y-3 md:space-y-4 mb-8 flex-grow">
              {(t.raw("full.features") as string[]).map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-400 text-sm">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-white shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <PricingContactDropdown 
              packageName={t("full.title")}
              packagePrice={t("full.price")}
              currency={t("currency")}
              buttonText={t("button")}
              colorClass="border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
              variant="outline"
            />
          </div>

          {/* CUSTOM */}
          <div className="p-6 md:p-8 rounded-[2rem] border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-colors flex flex-col">
            <div className="mb-6 p-3 w-fit rounded-2xl bg-zinc-800/50">
               <Settings className="w-5 h-5 md:w-6 md:h-6 text-zinc-400" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">{t("custom.title")}</h3>
            <div className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">{t("custom.price")}</div>
            
            <p className="text-zinc-500 text-sm mb-6 min-h-[40px]">
              {t("custom.description")}
            </p>

            <ul className="space-y-3 md:space-y-4 mb-8 flex-grow">
              {(t.raw("custom.features") as string[]).map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-400 text-sm">
                  <Check className="w-4 h-4 md:w-5 md:h-5 text-zinc-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            
            <button 
              onClick={() => setIsCustomModalOpen(true)}
              className="w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 border border-zinc-700 text-white hover:bg-zinc-800 hover:border-zinc-600"
            >
              <span>{t("custom.button")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
        </div>

        <div className="mt-12 md:mt-16 text-center">
          <div className="inline-block px-4 py-2 md:px-6 md:py-3 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 text-xs md:text-sm">
             {t("guarantee")}
          </div>
        </div>
      </div>

      <CustomOrderModal isOpen={isCustomModalOpen} onClose={() => setIsCustomModalOpen(false)} />
    </section>
  );
}