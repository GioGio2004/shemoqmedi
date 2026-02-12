"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Sparkles, Zap, Coffee, ShoppingBag, Scissors, Hammer, Utensils, Atom, Music } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

export function PortfolioGallery() {
  const t = useTranslations("Landing.Showcase");
  const locale = useLocale();

  const templates = [
    {
      id: "coffee-4",
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070",
      href: `/${locale}/coffee-4`,
      icon: Coffee,
      color: "text-amber-600"
    },
    {
      id: "auto-1",
      image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000",
      href: `/${locale}/auto-1`,
      icon: Zap,
      color: "text-red-600"
    },
    {
      id: "auto-shop",
      image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1000",
      href: `/${locale}/auto-shop`,
      icon: Hammer,
      color: "text-blue-500"
    },
    {
      id: "coffee-3",
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2000",
      href: `/${locale}/coffee-3`,
      icon: Coffee,
      color: "text-orange-600"
    },
    {
      id: "shop",
      image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000",
      href: `/${locale}/shop`,
      icon: ShoppingBag,
      color: "text-emerald-600"
    },
    {
      id: "beauty",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1674",
      href: `/${locale}/beauty`,
      icon: Scissors,
      color: "text-pink-600"
    },
    {
      id: "construction",
      image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2689",
      href: `/${locale}/construction`,
      icon: Hammer,
      color: "text-yellow-600"
    },
    {
      id: "coffee-2",
      image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=2070",
      href: `/${locale}/coffee-2`,
      icon: Coffee,
      color: "text-blue-600"
    },
    {
      id: "coffee",
      image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2671",
      href: `/${locale}/coffee`,
      icon: Coffee,
      color: "text-amber-600"
    },
    {
      id: "restaurant-regular",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D",
      href: `/${locale}/regular`,
      icon: Utensils,
      color: "text-amber-700"
    },
    {
      id: "restaurant-modern",
      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2670",
      href: `/${locale}/modern-restaurant`,
      icon: Atom,
      color: "text-cyan-400"
    },
    {
      id: "modern", // Changed id from clothes-modern to match JSON key
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800",
      href: `/${locale}/modern`,
      icon: ShoppingBag,
      color: "text-indigo-500"
    },
    {
      id: "shoes", // Changed from shoes-template to match JSON
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2070",
      href: `/${locale}/shoes`,
      icon: Zap,
      color: "text-yellow-500"
    },
    {
      id: "acoustic-shop",
      image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2070",
      href: `/${locale}/acoustic-shop`,
      icon: Music,
      color: "text-amber-800"
    }
  ];

  return (
    <section id="portfolio-gallery" className="relative py-20 md:py-32 px-6 bg-zinc-50 min-h-screen">
      {/* Background Blobs */}
      <div className="absolute top-[20%] right-[0%] w-[800px] h-[800px] bg-blue-100 rounded-full blur-[150px] opacity-60 mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-[0%] left-[0%] w-[600px] h-[600px] bg-pink-100 rounded-full blur-[150px] opacity-60 mix-blend-multiply pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 md:mb-20 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="text-zinc-500 font-bold text-sm uppercase tracking-[0.2em]">{t("title")}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter mb-2">
              {t.rich("subtitle", {
                span: (chunks) => <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">{chunks}</span>
              })}
            </h2>
          </div>
          <p className="text-zinc-500 font-medium max-w-sm text-right hidden md:block leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {templates.map((template) => (
            <Link 
              key={template.id} 
              href={template.href}
              className="group relative h-[420px] rounded-[2.5rem] overflow-hidden border border-white/60 bg-white/40 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10"
            >
              {/* Image Layer - Full Color */}
              <div className="absolute inset-0 z-0 h-[65%] overflow-hidden m-3 rounded-[2rem]">
                <Image 
                  src={template.image} 
                  alt={t(`items.${template.id}.title`)}
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Content Layer */}
              <div className="absolute inset-0 z-10 flex flex-col justify-end p-8">
                
                {/* Info Card */}
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-[1.5rem] shadow-sm border border-white/50 group-hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                        <div className={`px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] font-bold uppercase tracking-wider ${template.color} flex items-center gap-2`}>
                            <template.icon className="w-3 h-3" />
                            {t(`items.${template.id}.category`)}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-zinc-900 mb-1">{t(`items.${template.id}.title`)}</h3>
                    <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 font-medium">
                        {t(`items.${template.id}.desc`)}
                    </p>
                </div>
              </div>

            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}


