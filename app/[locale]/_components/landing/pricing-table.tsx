"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";

export function PricingTable() {
  const t = useTranslations("Landing.Pricing");

  return (
    <section className="py-32 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white">{t("title")}</h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* STARTER */}
          <div className="p-8 rounded-[2rem] border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-colors relative group">
            <h3 className="text-xl font-medium text-white mb-4">{t("starter.title")}</h3>
            <div className="text-4xl font-bold text-white mb-8">{t("starter.price")}</div>
            <ul className="space-y-4 mb-8">
              {(t.raw("starter.features") as string[]).map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-400 text-sm">
                  <Check className="w-5 h-5 text-white shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
             <button className="w-full py-4 rounded-xl border border-zinc-700 text-white font-bold hover:bg-zinc-800 transition-colors">
              Select Plan
            </button>
          </div>

           {/* PRO */}
           <div className="p-8 rounded-[2rem] border-2 border-red-900/50 bg-zinc-900/40 shadow-[0_0_50px_rgba(127,29,29,0.1)] relative transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-red-800 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg">
              Most Popular
            </div>
            <h3 className="text-xl font-medium text-white mb-4">{t("pro.title")}</h3>
            <div className="text-4xl font-bold text-white mb-8">{t("pro.price")}</div>
            <ul className="space-y-4 mb-8">
              {(t.raw("pro.features") as string[]).map((f, i) => (
                 <li key={i} className="flex items-start gap-3 text-zinc-300 text-sm">
                  <Check className="w-5 h-5 text-red-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full py-4 rounded-xl bg-red-800 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20">
              Select Plan
            </button>
          </div>

           {/* MAINTENANCE */}
           <div className="p-8 rounded-[2rem] border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-colors">
            <h3 className="text-xl font-medium text-white mb-4">{t("maintenance.title")}</h3>
            <div className="text-4xl font-bold text-white mb-2">{t("maintenance.price")}</div>
            <div className="text-sm text-zinc-500 mb-8">{t("maintenance.unit")}</div>
            <p className="text-zinc-500 text-sm leading-relaxed mb-8">
               {t("maintenance.desc")}
            </p>
             <button className="w-full py-4 rounded-xl border border-zinc-700 text-zinc-400 font-bold hover:bg-zinc-800 transition-colors">
              Add-on
            </button>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block px-6 py-3 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 text-sm">
             {t("guarantee")}
          </div>
        </div>
      </div>
    </section>
  );
}
