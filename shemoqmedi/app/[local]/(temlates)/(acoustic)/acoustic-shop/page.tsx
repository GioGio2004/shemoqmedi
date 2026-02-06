"use client";

import { Navbar } from "./_components/navbar";
import { Hero } from "./_components/hero";
import { ProductGrid } from "./_components/product-grid";
import { AboutSection } from "./_components/about-section";
import { ContactSection } from "./_components/contact-section";
import { Footer } from "./_components/footer";

export default function AcousticShopPage() {
  
  const scrollToCategory = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
        // Offset for fixed navbar + margin
        const y = el.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#2a1d15] min-h-screen font-sans selection:bg-[#e6b800] selection:text-[#3d2b1f]">
      <Navbar scrollToCategory={scrollToCategory} />
      <Hero />
      <AboutSection />
      <ProductGrid />
      <ContactSection />
      <Footer />
    </div>
  );
}
