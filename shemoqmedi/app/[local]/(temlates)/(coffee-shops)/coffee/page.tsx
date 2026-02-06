"use client";

import { useRef, useTransition } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Globe, Coffee, ArrowRight } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ContactDropdown } from "@/app/[local]/(temlates)/(coffee-shops)/coffee/_components/contact-dropdown";
import { INGREDIENTS, PRODUCTS } from "./_components/image-listing";

gsap.registerPlugin(ScrollTrigger);

// --- LANGUAGE SWITCHER COMPONENT ---
function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleSelect = (nextLocale: string) => {
    startTransition(() => {
      const segments = pathname.split("/");
      if (segments.length > 1) {
        segments[1] = nextLocale;
      } else {
        segments.unshift("", nextLocale);
      }
      const nextUrl = segments.join("/");
      router.replace(nextUrl);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-amber-100 text-slate-800 transition-colors rounded-full"
          disabled={isPending}
        >
          <Globe className="h-5 w-5" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-[#faf9f6] border-amber-100 z-[60]"
      >
        <DropdownMenuItem
          onClick={() => handleSelect("en")}
          className={`cursor-pointer ${
            locale === "en" ? "font-bold text-amber-900" : "text-slate-600"
          }`}
        >
          🇬🇧 English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSelect("ka")}
          className={`cursor-pointer ${
            locale === "ka" ? "font-bold text-amber-900" : "text-slate-600"
          }`}
        >
          🇬🇪 ქართული
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// --- MAIN HOME COMPONENT ---

export default function Home() {
  const t = useTranslations("CoffeeTemplate");
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const catalogRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  // Helper arrays for icons/colors
  const benefitIcons = [
    { color: "from-amber-700 to-orange-700", path: "M13 10V3L4 14h7v7l9-11h-7z" }, // Lightning/Energy
    {
      color: "from-stone-600 to-zinc-600",
      path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", // Shield/Quality
    },
    {
      color: "from-emerald-600 to-green-600",
      path: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z", // Leaf/Eco
    },
    {
      color: "from-amber-600 to-yellow-600",
      path: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", // Clock/Fresh
    },
  ];

  const testimonialStyles = [
    { color: "from-amber-700 to-orange-600" },
    { color: "from-stone-600 to-neutral-500" },
    { color: "from-emerald-700 to-green-600" },
  ];

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
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
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
          scale: 0.9,
          stagger: 0.1,
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

      gsap.to(".blob", {
        y: "20%",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
        },
      });

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

  // Data Interfaces
  interface BenefitItem {
    title: string;
    desc: string;
  }
  interface CatalogItem {
    name: string;
    description: string;
    category: string;
    benefits: string[];
  }
  interface IngredientItem {
    label: string;
    title: string;
    description: string;
    tags: string[];
  }
  interface TestimonialItem {
    text: string;
    name: string;
    role: string;
  }

  const benefitItems = t.raw("Benefits.items") as BenefitItem[];
  const catalogItems = t.raw("Catalog.items") as CatalogItem[];
  const ingredientItems = t.raw("Ingredients.items") as IngredientItem[];
  const testimonialItems = t.raw("Testimonials.items") as TestimonialItem[];
  const footerMenuLinks = t.raw("Footer.links.menu") as string[];
  const footerLocationsLinks = t.raw("Footer.links.locations") as string[];
  const footerSocialLinks = t.raw("Footer.links.social") as string[];

  return (
    <main
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[#faf9f6] text-stone-800 font-sans selection:bg-amber-200"
    >
      {/* BACKGROUND BLOBS (Coffee Tones) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="blob absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-100 rounded-full blur-[100px] opacity-40 mix-blend-multiply" />
        <div className="blob absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-orange-100 rounded-full blur-[100px] opacity-40 mix-blend-multiply" />
        <div className="blob absolute bottom-[10%] left-[20%] w-[45vw] h-[45vw] bg-stone-200 rounded-full blur-[100px] opacity-30 mix-blend-multiply" />
      </div>

      {/* NAVBAR */}
      <nav className="navbar fixed top-0 w-full z-50 px-6 py-6 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="text-2xl font-bold tracking-tighter flex items-center gap-2 text-amber-900">
            <Coffee className="w-6 h-6" />
            VOLOO<span className="text-stone-600">CAFE.</span>
          </div>

          {/* Desktop Links (Hidden on mobile) */}
          <div className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#menu" className="hover:text-amber-600 transition-colors">
              {t("Navbar.menu")}
            </a>
            <a href="#locations" className="hover:text-amber-600 transition-colors">
              {t("Navbar.locations")}
            </a>
            <a href="#about" className="hover:text-amber-600 transition-colors">
              {t("Navbar.about")}
            </a>
          </div>

          {/* ACTIONS GROUP */}
          <div className="flex items-center gap-2 md:gap-4">
            <LanguageSwitcher />
            <button className="px-5 py-2 rounded-full bg-stone-900 text-white text-xs font-bold hover:bg-amber-700 transition-colors">
              {t("Navbar.order")} (0)
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section
        ref={heroRef}
        className="hero-section relative z-10 pt-40 pb-20 px-6 max-w-7xl mx-auto min-h-screen flex items-center"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
          <div className="space-y-8 z-20">
            <div className="hero-text-item inline-block px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold tracking-widest">
              {t("Hero.badge")}
            </div>
            <h1 className="hero-text-item text-6xl md:text-8xl font-black leading-[0.9] text-stone-900">
              {t("Hero.title_1")} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-700">
                {t("Hero.title_2")}
              </span>
            </h1>
            <p className="hero-text-item text-lg text-stone-500 max-w-md leading-relaxed">
              {t("Hero.description")}
            </p>
            <div className="hero-text-item flex gap-4">
              <button className="px-8 py-4 rounded-full bg-stone-900 text-white font-bold hover:bg-amber-700 shadow-xl shadow-amber-900/20 transition-all">
                {t("Hero.btn_order")}
              </button>
              <button className="px-8 py-4 rounded-full border-2 border-stone-900 text-stone-900 font-bold hover:bg-stone-900 hover:text-white transition-all">
                {t("Hero.btn_locations")}
              </button>
            </div>
          </div>

          <div className="hero-image relative h-[600px] w-full z-10">
            <div className="absolute inset-0 bg-stone-100/50 backdrop-blur-md rounded-[3rem] border border-white/40 shadow-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1978"
                alt="Coffee Art"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* INFINITE MARQUEE */}
      <div className="relative z-10 bg-stone-900 py-4 overflow-hidden -rotate-1 shadow-lg border-y border-stone-800">
        <div className="marquee-inner flex whitespace-nowrap">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <span
              key={i}
              className="text-amber-50 font-black text-xl mx-8 tracking-widest uppercase"
            >
              {t("Marquee")}
            </span>
          ))}
        </div>
      </div>

      {/* BENEFITS SECTION */}
      <section className="benefits-section relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-4 text-stone-900">{t("Benefits.title")}</h2>
          <p className="text-stone-500 text-lg">{t("Benefits.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {benefitItems.map((item, idx) => (
            <div
              key={idx}
              className="benefit-item text-center p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-stone-100 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div
                className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br ${benefitIcons[idx].color} flex items-center justify-center`}
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={benefitIcons[idx].path}
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-stone-800">{item.title}</h3>
              <p className="text-stone-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MENU / PRODUCT SHOWCASE */}
      <section
        id="menu"
        ref={catalogRef}
        className="relative z-10 py-32 px-6 bg-gradient-to-b from-transparent via-amber-50/50 to-transparent"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-xs font-bold tracking-widest mb-6">
              {t("Catalog.badge")}
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-6 text-stone-900">
              {t("Catalog.title")}
            </h2>
            <p className="text-xl text-stone-500 max-w-2xl mx-auto">
              {t("Catalog.subtitle")}
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PRODUCTS.map((product, idx) => {
              const translatedProduct = catalogItems[idx];
              if (!translatedProduct) return null;

              return (
                <div
                  key={product.id}
                  className="product-showcase-card group relative"
                >
                  {/* Card Container */}
                  <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-stone-100 h-full flex flex-col">
                    {/* Image Section */}
                    <div className="relative h-80 overflow-hidden bg-stone-200">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={translatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />

                      {/* Floating Badge */}
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-stone-800 shadow-lg">
                        {translatedProduct.category}
                      </div>

                      {/* Gradient Overlay */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-t ${product.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                      />
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="text-2xl font-bold mb-2 text-stone-900 group-hover:text-amber-600 transition-colors duration-300">
                        {translatedProduct.name}
                      </h3>

                      <p className="text-sm text-stone-600 mb-4 leading-relaxed flex-grow">
                        {translatedProduct.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {translatedProduct.benefits.map(
                          (benefit: string, bIdx: number) => (
                            <span
                              key={bIdx}
                              className="px-3 py-1 rounded-full bg-stone-100 text-xs font-medium text-stone-700"
                            >
                              {benefit}
                            </span>
                          )
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                        <span className="text-2xl font-black text-stone-900">
                          ${product.price}
                        </span>
                        <ContactDropdown
                          productName={translatedProduct.name}
                          productPrice={product.price}
                          productImage={product.image}
                          productCategory={translatedProduct.category}
                          colorClass={product.color}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-16">
            <Button
              className="px-10 py-6 rounded-full border-2 border-stone-900 text-stone-900 bg-transparent font-bold hover:bg-stone-900 hover:text-white transition-all duration-300 inline-flex items-center gap-2 group text-lg"
            >
              {t("Catalog.btn_full_menu")}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats-section relative z-10 py-20 px-6 bg-stone-900 text-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="stat-item text-center">
              <div className="text-5xl font-black mb-2 text-amber-500">20k+</div>
              <div className="text-sm opacity-80 uppercase tracking-wider">{t("Stats.coffees")}</div>
            </div>
            <div className="stat-item text-center">
              <div className="text-5xl font-black mb-2 text-amber-500">100%</div>
              <div className="text-sm opacity-80 uppercase tracking-wider">{t("Stats.fairtrade")}</div>
            </div>
            <div className="stat-item text-center">
              <div className="text-5xl font-black mb-2 text-amber-500">12h</div>
              <div className="text-sm opacity-80 uppercase tracking-wider">{t("Stats.roasted")}</div>
            </div>
            <div className="stat-item text-center">
              <div className="text-5xl font-black mb-2 text-amber-500">3</div>
              <div className="text-sm opacity-80 uppercase tracking-wider">{t("Stats.locations")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* INGREDIENTS / SOURCES (Horizontal Scroll) */}
      <section
        id="locations"
        ref={horizontalRef}
        className="relative z-10 bg-[#1a1917] text-white overflow-hidden"
      >
        <div className="h-screen flex items-center m-20">
          <div className="fixed top-20 padding-10 left-10 md:left-20 z-50 pointer-events-none">
            <h2 className="text-4xl md:text-6xl font-black text-amber-50 drop-shadow-2xl">
              {t("Ingredients.title_1")}{" "}
              <span className="text-amber-500">{t("Ingredients.title_2")}</span>
            </h2>
            <p className="text-stone-400 mt-2 text-lg drop-shadow-lg">
              {t("Ingredients.scroll_hint")}
            </p>
          </div>

          <div className="flex items-center gap-8 h-full py-20">
            {INGREDIENTS.map((item, idx) => {
              const translatedIng = ingredientItems[idx];
              if (!translatedIng) return null;

              return (
                <div
                  key={item.id}
                  className={`horizontal-panel w-[85vw] md:w-[600px] h-[70vh] ${item.bgColor} rounded-[2.5rem] flex-shrink-0 ${item.borderColor} border-2 relative group overflow-hidden shadow-2xl ml-8 first:ml-[20vw]`}
                >
                  <div className="absolute inset-0 z-0">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={translatedIng.title}
                      className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                  <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-10">
                    <div className="mb-4">
                      <span className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                        {translatedIng.label}
                      </span>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-black mb-4 text-white drop-shadow-lg">
                      {translatedIng.title}
                    </h3>
                    <p className="text-base md:text-lg text-white/90 mb-6 max-w-md leading-relaxed">
                      {translatedIng.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {translatedIng.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium text-white border border-white/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="w-[20vw] flex-shrink-0" />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section
        ref={testimonialsRef}
        className="relative z-10 py-32 px-6 max-w-7xl mx-auto"
      >
        <div className="text-center mb-20">
          <h2 className="text-5xl font-black mb-4 text-stone-900">
            {t("Testimonials.title")}
          </h2>
          <p className="text-stone-500 text-lg">{t("Testimonials.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialItems.map((item, idx) => (
            <div
              key={idx}
              className="testimonial-card bg-white rounded-3xl p-8 shadow-xl border border-stone-100"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Coffee
                    key={i}
                    className="w-5 h-5 text-amber-500 fill-current"
                  />
                ))}
              </div>
              <p className="text-stone-600 mb-6 italic">"{item.text}"</p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonialStyles[idx].color}`}
                />
                <div>
                  <div className="font-bold text-stone-900">{item.name}</div>
                  <div className="text-sm text-stone-500">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto text-center cta-content">
          <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-[3rem] p-12 md:p-20 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px]" />

            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 relative z-10">
              {t("CTA.title")}
            </h2>
            <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto relative z-10">
              {t("CTA.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <button className="px-10 py-5 rounded-full bg-amber-500 text-stone-900 font-bold text-lg hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 transition-all">
                {t("CTA.btn_order")}
              </button>
              <button className="px-10 py-5 rounded-full border-2 border-stone-600 text-stone-300 font-bold text-lg hover:bg-stone-800 hover:text-white hover:border-stone-500 transition-all">
                {t("CTA.btn_visit")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        id="about"
        className="relative z-10 bg-[#121110] text-stone-400 py-20 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <h2 className="text-3xl font-bold tracking-tighter mb-4 text-white flex items-center gap-2">
                <Coffee className="w-6 h-6 text-amber-600" />
                VOLOO<span className="text-amber-600">CAFE.</span>
              </h2>
              <p className="text-stone-500 mb-6 max-w-md">
                {t("Footer.description")}
              </p>
              <div className="flex gap-4">
                 {/* Social Icons Placeholder */}
                 {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-stone-800 hover:bg-amber-700 transition-colors flex items-center justify-center cursor-pointer">
                        <Globe className="w-5 h-5 text-stone-300" />
                    </div>
                 ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4 text-white">
                {t("Footer.headers.menu")}
              </h3>
              <ul className="space-y-2">
                {footerMenuLinks.map((link, idx) => (
                  <li key={idx}>
                    <a href="#" className="hover:text-amber-500 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4 text-white">
                {t("Footer.headers.locations")}
              </h3>
              <ul className="space-y-2">
                {footerLocationsLinks.map((link, idx) => (
                  <li key={idx}>
                    <a href="#" className="hover:text-amber-500 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-stone-600 text-sm">{t("Footer.copyright")}</p>
            <div className="flex gap-6 text-sm">
              {footerSocialLinks.map((link, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="hover:text-amber-500 transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
