"use client";

import { useTranslations } from "next-intl";
import { IntroScreen } from "./_components/landing/intro-screen";
import { HeroSection } from "./_components/landing/hero-section";
import { Creations } from "./_components/landing/creations";
import { OrganizationsList } from "./_components/landing/organizations-list";
import { PortfolioGallery } from "./_components/landing/portfolio-gallery";
import { AboutSection } from "./_components/landing/about-section";
import { LanguageToggler } from "./_components/landing/language-toggler";
import { PricingTable } from "./_components/landing/pricing-table";


export default function LandingPage() {
  const t = useTranslations("Landing.Footer");

  return (
    <main className="min-h-screen w-full bg-zinc-50 text-zinc-900 selection:bg-pink-500 selection:text-white overflow-x-hidden">
      {/* so first of all we need to amke the check for admin panel and we can use clerks role based authentication for it  */}
      <LanguageToggler />
      <IntroScreen />

      <HeroSection />

      {/* Creations Section */}
      <Creations />

      {/* Dynamic Organizations */}
      <OrganizationsList />

      {/* Scroll Gallery replaces the Grid */}
      <PortfolioGallery />

      <AboutSection />

      <PricingTable />

      {/* FOOTER */}
      <footer className="py-12 border-t border-zinc-200 text-center text-zinc-500 text-sm bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="font-bold tracking-widest text-zinc-500 text-lg uppercase">Shemoqmedi
          </div>
          <span className="font-light">powered by <strong className="text-pink-500">voloostudio</strong></span>
          <p>{t("rights")}</p>
        </div>
      </footer>
    </main>
  );
}