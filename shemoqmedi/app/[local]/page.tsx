"use client";

import { useTranslations } from "next-intl";
import { IntroScreen } from "./_components/landing/intro-screen";
import { HeroSection } from "./_components/landing/hero-section";
import { PortfolioGallery } from "./_components/landing/portfolio-gallery";
import { AboutSection } from "./_components/landing/about-section";
import { PricingTable } from "./_components/landing/pricing-table";

export default function LandingPage() {
  const t = useTranslations("Landing.Footer");

  return (
    <main className="min-h-screen w-full bg-black text-white selection:bg-red-900 selection:text-white">
      <IntroScreen />
      
      <HeroSection />
      
      {/* Scroll Gallery replaces the Grid */}
      <PortfolioGallery />
      
      <AboutSection />
      
      <PricingTable />

      {/* FOOTER */}
      <footer className="py-12 border-t border-zinc-900 text-center text-zinc-600 text-sm bg-black">
        <div className="flex flex-col items-center gap-4">
           <div className="font-bold tracking-widest text-zinc-500 text-lg uppercase">Shemoqmedi</div>
           <p>{t("rights")}</p>
        </div>
      </footer>
    </main>
  );
}