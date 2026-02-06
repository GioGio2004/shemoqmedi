"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Sparkles, Hammer, Coffee, ArrowRight } from "lucide-react";

export function PortfolioGrid() {
  const t = useTranslations("Landing.Showcase");
  const locale = useLocale();

  const templates = [
    {
      id: "beauty",
      icon: Sparkles,
      color: "from-pink-500 to-rose-400",
      bgHover: "group-hover:shadow-pink-500/20",
      href: `/${locale}/beauty`
    },
    {
      id: "construction",
      icon: Hammer,
      color: "from-blue-500 to-cyan-400",
      bgHover: "group-hover:shadow-blue-500/20",
       href: `/${locale}/construction`
    },
    {
      id: "coffee",
      icon: Coffee,
      color: "from-amber-500 to-orange-400",
      bgHover: "group-hover:shadow-amber-500/20",
       href: `/${locale}/coffee`
    }
  ];

  return (
    <section id="showcase" className="py-32 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-6xl font-bold text-stone-100">{t("title")}</h2>
          <p className="text-emerald-200/60 text-lg">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={template.href}
              className={`group relative p-1 rounded-[2.5rem] bg-gradient-to-b from-emerald-800/50 to-emerald-950/50 border border-emerald-800/50 hover:border-emerald-500/50 transition-all duration-500 hover:-translate-y-2 ${template.bgHover} hover:shadow-2xl`}
            >
              <div className="bg-[#031d17] rounded-[2.3rem] p-8 h-full flex flex-col justify-between overflow-hidden relative">
                {/* Background Glow */}
                <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${template.color} opacity-20 blur-[50px] group-hover:opacity-40 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-6 shadow-lg`}>
                    <template.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-stone-100 mb-2 group-hover:text-emerald-400 transition-colors">
                    {t(`${template.id}.title`)}
                  </h3>
                  <p className="text-emerald-100/50 text-sm leading-relaxed">
                    {t(`${template.id}.desc`)}
                  </p>
                </div>

                <div className="relative z-10 mt-8 flex items-center gap-2 text-sm font-bold text-stone-300 group-hover:text-emerald-400 transition-colors">
                  View Demo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
