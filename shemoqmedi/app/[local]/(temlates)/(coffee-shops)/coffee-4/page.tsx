"use client";

import { useState } from "react";
import { SiteNavbar } from "./_components/site-navbar";
import { HeroSection } from "./_components/hero-section";
import { MenuSection } from "./_components/menu-section";
import { InfoSection } from "./_components/info-section";
import { SiteFooter } from "./_components/site-footer";

export default function Page() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SiteNavbar onCategorySelect={(cat) => setActiveCategory(cat)} />
      <HeroSection />

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-border" />
      </div>

      <MenuSection
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-border" />
      </div>

      <InfoSection />
      <SiteFooter />
    </main>
  );
}
