"use client";

import { useTranslations } from "next-intl";
import { HeartHandshake } from "lucide-react";

export function AboutSection() {
  const t = useTranslations("Landing.About");

  return (
    <section className="py-32 px-6 bg-black border-y border-zinc-900">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-6 border border-zinc-800">
              {t("title")}
           </div>
           <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
             Building <span className="text-red-800">Trust</span>, Not Just Websites.
           </h2>
           <p className="text-zinc-400 text-lg leading-relaxed mb-8">
             {t("story")}
           </p>
           
           <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 flex gap-4 items-start">
              <div className="p-3 rounded-full bg-black border border-red-900/50 text-red-700 shrink-0">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">{t("trust_title")}</h4>
                <p className="text-zinc-500 text-sm">{t("trust_desc")}</p>
              </div>
           </div>
        </div>

        <div className="relative">
           {/* Abstract representational image placement */}
           <div className="aspect-square rounded-[3rem] bg-zinc-900 border border-zinc-800 overflow-hidden relative grayscale">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000')] bg-cover bg-center opacity-30 mix-blend-screen" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              
              <div className="absolute bottom-8 left-8 right-8">
                <div className="text-7xl font-black text-zinc-800 select-none">2026</div>
                <p className="text-zinc-300 text-sm font-medium border-l-2 border-red-800 pl-4">
                  {t("mission")}
                </p>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
