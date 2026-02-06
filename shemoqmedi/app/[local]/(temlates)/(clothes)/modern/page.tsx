"use client";

import { useRef, useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { Product } from "./_components/data";

// Components
import { Navbar } from "./_components/navbar";
import { HeroSection } from "./_components/hero-section";
import { StatsSection } from "./_components/stats-section";
import { BrandPillars } from "./_components/brand-pillars";
import { ProductShowcase } from "./_components/product-showcase";
import { TestimonialsSection } from "./_components/testimonials-section";
import { AboutSection } from "./_components/about-section";
import { NewsletterSection } from "./_components/newsletter-section";
import { ContactSection } from "./_components/contact-section";
import { SiteFooter } from "./_components/site-footer";
import { ProductDetailPopup } from "./_components/product-detail-popup";

/* ─── MAIN COMPONENT ─── */
export default function VoloostoreEnhanced() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="bg-[#05050f] text-[#e8e8f0] min-h-screen selection:bg-[#00e5ff]/30 overflow-x-hidden">
      
      {/* ─── ANNOUNCEMENT BAR ─── */}
      <div className="w-full bg-gradient-to-r from-[#00e5ff] via-[#00b8d4] to-[#00e5ff] py-2 text-center overflow-hidden relative">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-black">
          // SPRING COLLECTION 2026 NOW LIVE // FREE SHIPPING $100+ // TBILISI GLOBAL
        </p>
      </div>

      {/* ─── NAVBAR ─── */}
      <Navbar 
        scrollTo={scrollTo} 
        wishlistCount={wishlist.size} 
        cartCount={cartCount} 
      />

      {/* ─── HERO ─── */}
      <HeroSection scrollTo={scrollTo} />

      {/* ─── STATS & BRAND PILLARS ─── */}
      <StatsSection />
      <BrandPillars />

      {/* ─── PRODUCTS ─── */}
      <ProductShowcase 
        onProductClick={handleProductClick} 
        toggleWishlist={toggleWishlist} 
        addToCart={() => setCartCount(prev => prev + 1)} 
        wishlist={wishlist} 
      />

      {/* ─── TESTIMONIALS ─── */}
      <TestimonialsSection />

      {/* ─── ABOUT ─── */}
      <AboutSection />

      {/* ─── NEWSLETTER ─── */}
      <NewsletterSection />

      {/* ─── CONTACT ─── */}
      <ContactSection />

      {/* ─── FOOTER ─── */}
      <SiteFooter />

      {/* ─── SCROLL TO TOP ─── */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 p-4 bg-[#00e5ff] text-black rounded-full shadow-lg hover:shadow-[0_0_30px_#00e5ff] transition-all z-50"
        >
          <ArrowUpRight size={24} className="rotate-[-90deg]" />
        </button>
      )}

      {/* ─── PRODUCT DETAIL POPUP ─── */}
      <ProductDetailPopup 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </div>
  );
}