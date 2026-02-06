"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";

import { ContactDropdown } from "./_components/contact-dropdown";
import { ProductDetailModal } from "./_components/product-detail-modal";
import { LanguageSwitcher } from "./_components/language-switcher";
import { MATERIAL_TYPES, PRODUCTS } from "./_components/image-list";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  // 1. Initialize translation hook scoped to the template
  const t = useTranslations("TimberCraftTemplate");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const catalogRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  const [selectedProduct, setSelectedProduct] = useState<
    (typeof PRODUCTS)[number] | null
  >(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 2. Merge Translations with Existing Image Data
  
  // Products: Merge JSON text with imported Images/IDs from 'PRODUCTS'
  const localizedProducts = t.raw("Catalog.items").map((item: any, index: number) => {
    // Fallback if PRODUCTS array is shorter than translation array
    const originalProduct = PRODUCTS[index] || PRODUCTS[0]; 
    return {
      ...originalProduct, // Keep id, price, image from original const
      ...item, // Overwrite name, desc, tags from JSON
    };
  });

  // Materials: Merge JSON text with imported Images/Colors from 'MATERIAL_TYPES'
  const localizedMaterials = t.raw("Materials.items").map((item: any, index: number) => {
    const originalMaterial = MATERIAL_TYPES[index] || MATERIAL_TYPES[0];
    return {
      ...originalMaterial,
      ...item,
    };
  });

  const benefits = t.raw("Benefits.items");
  const testimonials = t.raw("Testimonials.items");

  useGSAP(
    () => {
      const tl = gsap.timeline();
      tl.from(".hero-text-item", {
        y: 50,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: "power3.out",
      }).from(
        ".hero-image",
        {
          x: 50,
          opacity: 0,
          duration: 1.2,
          ease: "power2.out",
        },
        "<0.5"
      );

      gsap.to(".navbar", {
        scrollTrigger: {
          trigger: ".hero-section",
          start: "bottom top",
          toggleActions: "play none none reverse",
        },
        backgroundColor: "rgba(250, 246, 241, 0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(212, 197, 178, 0.5)",
        duration: 0.4,
      });

      gsap.to(".marquee-inner", {
        xPercent: -50,
        repeat: -1,
        duration: 25,
        ease: "linear",
      });

      const productCards = gsap.utils.toArray(".product-showcase-card");
      if (productCards.length > 0) {
        gsap.from(productCards, {
          scrollTrigger: {
            trigger: catalogRef.current,
            start: "top 75%",
          },
          y: 80,
          opacity: 0,
          scale: 0.95,
          stagger: 0.08,
          duration: 0.7,
          ease: "power2.out",
        });
      }

      const sections = gsap.utils.toArray(".horizontal-panel");
      if (sections.length > 0) {
        gsap.to(sections, {
          xPercent: -100 * (sections.length - 1),
          ease: "none",
          scrollTrigger: {
            trigger: horizontalRef.current,
            pin: true,
            scrub: 1,
            snap: 1 / (sections.length - 1),
            end: () => `+=${sections.length * 1000}`,
          },
        });
      }

      gsap.from(".benefit-item", {
        scrollTrigger: {
          trigger: ".benefits-section",
          start: "top 70%",
        },
        y: 40,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: "power2.out",
      });

      gsap.from(".testimonial-card", {
        scrollTrigger: {
          trigger: testimonialsRef.current,
          start: "top 75%",
        },
        y: 50,
        opacity: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: "power3.out",
      });

      gsap.from(".stat-item", {
        scrollTrigger: {
          trigger: ".stats-section",
          start: "top 80%",
        },
        scale: 0.8,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "back.out(2)",
      });

      gsap.from(".cta-content", {
        scrollTrigger: {
          trigger: ".cta-section",
          start: "top 80%",
        },
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
    },
    { scope: containerRef, dependencies: [] }
  );

  return (
    <main
      ref={containerRef}
      className="relative min-h-screen overflow-hidden font-sans"
      style={{
        backgroundColor: "#FAF6F1",
        color: "#2C1A0E",
      }}
    >
      {/* MARBLE BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/images/marble-bg.jpg"
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-[#FAF6F1]/60" />
      </div>

      {/* NAVBAR */}
      <nav className="navbar fixed top-0 w-full z-50 px-6 py-5 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="font-serif text-2xl text-[#2C1A0E]">
            TIMBER<span className="text-[#8B5E3C]">{t("Navbar.brand_suffix")}</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium tracking-wide uppercase text-[#5C4A3A] items-center">
            <a
              href="#products"
              className="hover:text-[#8B5E3C] transition-colors"
            >
              {t("Navbar.products")}
            </a>
            <a
              href="#materials"
              className="hover:text-[#8B5E3C] transition-colors"
            >
              {t("Navbar.materials")}
            </a>
            <a
              href="#about"
              className="hover:text-[#8B5E3C] transition-colors"
            >
              {t("Navbar.about")}
            </a>
            <LanguageSwitcher />
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#products"
              className="px-5 py-2.5 bg-[#2C1A0E] text-[#FAF6F1] text-xs font-bold uppercase tracking-wider hover:bg-[#8B5E3C] transition-colors"
            >
              {t("Navbar.quote")}
            </a>
            {/* Mobile Language Switcher */}
            <div className="md:hidden">
               <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section
        ref={heroRef}
        className="hero-section relative z-10 pt-40 pb-20 px-6 max-w-7xl mx-auto min-h-screen flex items-center"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center w-full">
          <div className="z-20">
            <div className="hero-text-item inline-block px-4 py-1.5 border border-[#8B5E3C] text-[#8B5E3C] text-xs font-bold tracking-[0.2em] uppercase mb-8">
              {t("Hero.since")}
            </div>
            <h1 className="hero-text-item font-serif text-6xl md:text-8xl leading-[0.95] text-[#2C1A0E] mb-8">
              {t("Hero.title_1")} <br />
              <span className="text-[#8B5E3C]">{t("Hero.title_2")}</span>
            </h1>
            <p className="hero-text-item text-lg text-[#5C4A3A] max-w-md leading-relaxed mb-8">
              {t("Hero.description")}
            </p>
            <div className="hero-text-item flex gap-4">
              <a
                href="#products"
                className="px-8 py-4 bg-[#2C1A0E] text-[#FAF6F1] font-bold uppercase text-sm tracking-wider hover:bg-[#8B5E3C] transition-colors"
              >
                {t("Hero.btn_catalog")}
              </a>
              <a
                href="#materials"
                className="px-8 py-4 border-2 border-[#2C1A0E] text-[#2C1A0E] font-bold uppercase text-sm tracking-wider hover:bg-[#2C1A0E] hover:text-[#FAF6F1] transition-colors"
              >
                {t("Hero.btn_materials")}
              </a>
            </div>
          </div>

          <div className="hero-image relative h-[550px] w-full z-10">
            <div className="absolute inset-0 overflow-hidden border border-[#D4C5B2] shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=1974"
                alt="Stacked plywood sheets in warehouse"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#2C1A0E]/10" />
            </div>
          </div>
        </div>
      </section>

      {/* INFINITE MARQUEE */}
      <div className="relative z-10 bg-[#2C1A0E] py-4 overflow-hidden">
        <div className="marquee-inner flex whitespace-nowrap">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <span
              key={i}
              className="text-[#D4C5B2] font-bold text-sm mx-8 tracking-[0.3em] uppercase"
            >
              {t("Marquee")}
            </span>
          ))}
        </div>
      </div>

      {/* BENEFITS SECTION */}
      <section className="benefits-section relative z-10 py-28 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-5xl text-[#2C1A0E] mb-4">
            {t("Benefits.heading")}
          </h2>
          <p className="text-[#8B7355] text-lg">
            {t("Benefits.subheading")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {benefits.map((item: any, idx: number) => {
            // Re-mapping icons based on index since JSON doesn't store components
            const icons = [
                <path key="1" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
                <path key="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />,
                <path key="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />,
                <path key="4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            ];
            
            return (
              <div
                key={idx}
                className="benefit-item text-center p-8 bg-[#FAF6F1]/60 backdrop-blur-sm border border-[#D4C5B2] hover:border-[#8B5E3C] transition-all"
              >
                <div className="w-14 h-14 mx-auto mb-5 border border-[#8B5E3C] flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-[#8B5E3C]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {icons[idx]}
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#2C1A0E] mb-2">
                  {item.title}
                </h3>
                <p className="text-[#8B7355] text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* PRODUCT CATALOG */}
      <section
        id="products"
        ref={catalogRef}
        className="relative z-10 py-28 px-6"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-1.5 border border-[#8B5E3C] text-[#8B5E3C] text-xs font-bold tracking-[0.2em] uppercase mb-6">
              {t("Catalog.badge")}
            </div>
            <h2 className="font-serif text-5xl md:text-7xl text-[#2C1A0E] mb-6">
              {t("Catalog.title")}
            </h2>
            <p className="text-lg text-[#8B7355] max-w-2xl mx-auto">
              {t("Catalog.subtitle")}
            </p>
          </div>

          {/* Products Grid - Rectangle Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#D4C5B2]">
            {localizedProducts.map((product: any) => (
              <div
                key={product.id}
                className="product-showcase-card group bg-[#FAF6F1]"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden bg-[#E8DDD0]">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-[#2C1A0E] text-[#FAF6F1] text-[10px] font-bold uppercase tracking-wider">
                    {product.category}
                  </div>
                  <div className="absolute inset-0 bg-[#2C1A0E]/0 group-hover:bg-[#2C1A0E]/20 transition-colors duration-500" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-serif text-xl text-[#2C1A0E] mb-1 group-hover:text-[#8B5E3C] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-[#8B7355] mb-4 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {product.tags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-[#E8DDD0] text-[#5C4A3A] text-[10px] font-bold uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Price Row */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#E8DDD0]">
                    <div>
                      <span className="text-2xl font-bold text-[#2C1A0E]">
                        ${product.price}
                      </span>
                      <span className="text-sm text-[#8B7355] ml-1">
                        {t("Catalog.price_unit")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setModalOpen(true);
                        }}
                        className="px-4 py-2.5 border border-[#D4C5B2] text-[#5C4A3A] text-xs font-bold uppercase tracking-wider hover:border-[#8B5E3C] hover:text-[#8B5E3C] transition-colors"
                      >
                        {t("Catalog.details")}
                      </button>
                      <ContactDropdown
                        productName={product.name}
                        productPrice={product.price}
                        productImage={product.image}
                        productCategory={product.category}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats-section relative z-10 py-20 px-6 bg-[#2C1A0E]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="stat-item text-center">
              <div className="font-serif text-5xl text-[#D4C5B2] mb-2">
                27+
              </div>
              <div className="text-xs text-[#8B7355] uppercase tracking-[0.2em]">
                {t("Stats.years")}
              </div>
            </div>
            <div className="stat-item text-center">
              <div className="font-serif text-5xl text-[#D4C5B2] mb-2">
                12k+
              </div>
              <div className="text-xs text-[#8B7355] uppercase tracking-[0.2em]">
                {t("Stats.projects")}
              </div>
            </div>
            <div className="stat-item text-center">
              <div className="font-serif text-5xl text-[#D4C5B2] mb-2">
                200+
              </div>
              <div className="text-xs text-[#8B7355] uppercase tracking-[0.2em]">
                {t("Stats.skus")}
              </div>
            </div>
            <div className="stat-item text-center">
              <div className="font-serif text-5xl text-[#D4C5B2] mb-2">
                98%
              </div>
              <div className="text-xs text-[#8B7355] uppercase tracking-[0.2em]">
                {t("Stats.satisfaction")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MATERIALS SECTION (Horizontal Scroll) */}
      <section
        id="materials"
        ref={horizontalRef}
        className="relative z-10 bg-[#1A0F06] overflow-hidden"
      >
        <div className="h-screen flex items-center m-20">
          {/* Fixed Header */}
          <div className="fixed top-20 left-10 md:left-20 z-50 pointer-events-none">
            <h2 className="font-serif text-4xl md:text-6xl text-[#FAF6F1] drop-shadow-2xl">
              {t("Materials.title_1")} <span className="text-[#8B5E3C]">{t("Materials.title_2")}</span>
            </h2>
            <p className="text-[#8B7355] mt-2 text-lg drop-shadow-lg">
              {t("Materials.scroll_hint")}
            </p>
          </div>

          {/* Horizontal Scrolling Container */}
          <div className="flex items-center gap-8 h-full py-20">
            {localizedMaterials.map((item: any) => (
              <div
                key={item.id}
                className={`horizontal-panel w-[85vw] md:w-[600px] h-[70vh] ${item.bgColor} flex-shrink-0 ${item.borderColor} border relative group overflow-hidden shadow-2xl ml-8 first:ml-[20vw]`}
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700"
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A0F06]/95 via-[#1A0F06]/50 to-[#1A0F06]/20" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-10">
                  <div className="mb-4">
                    <span className="text-xs font-bold text-[#D4C5B2]/80 uppercase tracking-[0.3em]">
                      {item.label}
                    </span>
                  </div>
                  <h3 className="font-serif text-4xl md:text-5xl text-[#FAF6F1] mb-4">
                    {item.title}
                  </h3>
                  <p className="text-base md:text-lg text-[#D4C5B2]/90 mb-6 max-w-md leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-4 py-2 bg-[#FAF6F1]/10 backdrop-blur-sm text-sm font-medium text-[#FAF6F1] border border-[#FAF6F1]/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div className="w-[20vw] flex-shrink-0" />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section
        ref={testimonialsRef}
        className="relative z-10 py-28 px-6 max-w-7xl mx-auto"
      >
        <div className="text-center mb-20">
          <h2 className="font-serif text-5xl text-[#2C1A0E] mb-4">
            {t("Testimonials.title")}
          </h2>
          <p className="text-[#8B7355] text-lg">
            {t("Testimonials.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial: any, idx: number) => (
            <div
              key={idx}
              className="testimonial-card bg-[#FAF6F1] p-8 border border-[#D4C5B2]"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-[#8B5E3C]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-[#5C4A3A] mb-6 leading-relaxed">
                {`"${testimonial.text}"`}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2C1A0E] flex items-center justify-center text-[#D4C5B2] text-sm font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-[#2C1A0E] text-sm">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-[#8B7355]">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section relative z-10 py-28 px-6">
        <div className="max-w-4xl mx-auto text-center cta-content">
          <div className="bg-[#2C1A0E] p-12 md:p-20 border border-[#4A3728]">
            <h2 className="font-serif text-4xl md:text-6xl text-[#FAF6F1] mb-6">
              {t("CTA.title")}
            </h2>
            <p className="text-[#D4C5B2]/80 text-lg mb-8 max-w-2xl mx-auto">
              {t("CTA.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#products"
                className="px-10 py-5 bg-[#8B5E3C] text-[#FAF6F1] font-bold text-sm uppercase tracking-wider hover:bg-[#A67348] transition-colors"
              >
                {t("CTA.btn_browse")}
              </a>
              <a
                href="#about"
                className="px-10 py-5 border border-[#D4C5B2] text-[#D4C5B2] font-bold text-sm uppercase tracking-wider hover:bg-[#D4C5B2] hover:text-[#2C1A0E] transition-colors"
              >
                {t("CTA.btn_contact")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        id="about"
        className="relative z-10 bg-[#1A0F06] text-[#D4C5B2] py-20 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <h2 className="font-serif text-3xl text-[#FAF6F1] mb-4">
                TIMBER<span className="text-[#8B5E3C]">CRAFT</span>
              </h2>
              <p className="text-[#8B7355] mb-6 max-w-md">
                {t("Footer.description")}
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 bg-[#2C1A0E] flex items-center justify-center text-[#8B7355] hover:text-[#8B5E3C] hover:bg-[#3D2B1F] transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-[#2C1A0E] flex items-center justify-center text-[#8B7355] hover:text-[#8B5E3C] hover:bg-[#3D2B1F] transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#FAF6F1] mb-4">
                {t("Footer.headers.products")}
              </h3>
              <ul className="flex flex-col gap-2 text-[#8B7355] text-sm">
                {t.raw("Footer.links.products").map((link: string, i: number) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="hover:text-[#D4C5B2] transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#FAF6F1] mb-4">
                {t("Footer.headers.services")}
              </h3>
              <ul className="flex flex-col gap-2 text-[#8B7355] text-sm">
                {t.raw("Footer.links.services").map((link: string, i: number) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="hover:text-[#D4C5B2] transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-[#2C1A0E] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#8B7355] text-sm">
              {t("Footer.copyright")}
            </p>
            <div className="flex gap-6 text-sm text-[#8B7355]">
              <a
                href="#"
                className="hover:text-[#D4C5B2] transition-colors"
              >
                {t("Footer.links.privacy")}
              </a>
              <a
                href="#"
                className="hover:text-[#D4C5B2] transition-colors"
              >
                {t("Footer.links.terms")}
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* PRODUCT DETAIL MODAL */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </main>
  );
}