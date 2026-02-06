"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ContactDropdown } from "@/app/[local]/(temlates)/beauty/_components/contact-dropdown";
import { INGREDIENTS, PRODUCTS } from "./_components/image-listing";

gsap.registerPlugin(ScrollTrigger);



export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const catalogRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

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
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        duration: 0.4,
      });

      gsap.to(".marquee-inner", {
        xPercent: -50,
        repeat: -1,
        duration: 20,
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

  return (
    <main
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[#fffdf9] text-slate-800 font-sans"
    >
      {/* BACKGROUND BLOBS */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="blob absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-200 rounded-full blur-[100px] opacity-40 mix-blend-multiply" />
        <div className="blob absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-rose-200 rounded-full blur-[100px] opacity-40 mix-blend-multiply" />
        <div className="blob absolute bottom-[10%] left-[20%] w-[45vw] h-[45vw] bg-orange-200 rounded-full blur-[100px] opacity-30 mix-blend-multiply" />
      </div>

      {/* NAVBAR */}
      <nav className="navbar fixed top-0 w-full z-50 px-6 py-6 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold tracking-tighter text-rose-500">
            AURA<span className="text-slate-800">SKIN.</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium">
            <a
              href="#products"
              className="hover:text-rose-500 transition-colors"
            >
              Shop
            </a>
            <a
              href="#ingredients"
              className="hover:text-rose-500 transition-colors"
            >
              Ingredients
            </a>
            <a href="#about" className="hover:text-rose-500 transition-colors">
              About
            </a>
          </div>
          <button className="px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-rose-500 transition-colors">
            CART (0)
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section
        ref={heroRef}
        className="hero-section relative z-10 pt-40 pb-20 px-6 max-w-7xl mx-auto min-h-screen flex items-center"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
          <div className="space-y-8 z-20">
            <div className="hero-text-item inline-block px-3 py-1 rounded-full border border-rose-200 bg-rose-50 text-rose-600 text-xs font-bold tracking-widest">
              NEW COLLECTION 2026
            </div>
            <h1 className="hero-text-item text-6xl md:text-8xl font-black leading-[0.9] text-slate-900">
              GLOW <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">
                FROM WITHIN
              </span>
            </h1>
            <p className="hero-text-item text-lg text-slate-500 max-w-md leading-relaxed">
              Plant-based skincare designed for radical radiance. No fillers.
              Just pure botanical power.
            </p>
            <div className="hero-text-item flex gap-4">
              <button className="px-8 py-4 rounded-full bg-slate-900 text-white font-bold hover:bg-rose-500 shadow-xl shadow-rose-200 transition-all">
                Shop Essentials
              </button>
              <button className="px-8 py-4 rounded-full border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-all">
                Learn More
              </button>
            </div>
          </div>

          <div className="hero-image relative h-[600px] w-full z-10">
            <div className="absolute inset-0 bg-white/30 backdrop-blur-md rounded-[3rem] border border-white/40 shadow-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=1974"
                alt="Skincare Products"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* INFINITE MARQUEE */}
      <div className="relative z-10 bg-rose-500 py-4 overflow-hidden -rotate-1 shadow-lg border-y border-rose-400">
        <div className="marquee-inner flex whitespace-nowrap">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <span
              key={i}
              className="text-white font-black text-xl mx-8 tracking-widest uppercase"
            >
              {"• Cruelty Free • Vegan • Organic • Sustainable"}
            </span>
          ))}
        </div>
      </div>

      {/* BENEFITS SECTION */}
      <section className="benefits-section relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-4">Why Choose AURASKIN</h2>
          <p className="text-slate-500 text-lg">
            Science meets nature in every bottle
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="benefit-item text-center p-8 rounded-3xl bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">100% Natural</h3>
            <p className="text-slate-600 text-sm">
              Pure botanical ingredients, no synthetic chemicals
            </p>
          </div>

          <div className="benefit-item text-center p-8 rounded-3xl bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Dermatologist Tested</h3>
            <p className="text-slate-600 text-sm">
              Clinically proven safe for all skin types
            </p>
          </div>

          <div className="benefit-item text-center p-8 rounded-3xl bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center">
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
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Eco-Friendly</h3>
            <p className="text-slate-600 text-sm">
              Sustainable packaging, carbon-neutral shipping
            </p>
          </div>

          <div className="benefit-item text-center p-8 rounded-3xl bg-white/50 backdrop-blur-sm border border-white/60 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
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
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Premium Quality</h3>
            <p className="text-slate-600 text-sm">
              Small-batch production for maximum freshness
            </p>
          </div>
        </div>
      </section>

      {/* PRODUCT SHOWCASE SECTION */}
      <section
        id="products"
        ref={catalogRef}
        className="relative z-10 py-32 px-6 bg-gradient-to-b from-transparent via-rose-50/30 to-transparent"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 rounded-full bg-rose-100 text-rose-600 text-xs font-bold tracking-widest mb-6">
              BESTSELLERS
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-6 text-slate-900">
              Curated for You
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Discover our most-loved formulas, handpicked for transformative
              results
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="product-showcase-card group relative"
              >
                {/* Card Container */}
                <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 h-full flex flex-col">
                  {/* Image Section */}
                  <div className="relative h-80 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Floating Badge */}
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-slate-800 shadow-lg">
                      {product.category}
                    </div>

                    {/* Gradient Overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${product.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    />
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex-grow flex flex-col">
                    {/* Product Name */}
                    <h3 className="text-2xl font-bold mb-2 text-slate-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-rose-500 group-hover:to-orange-500 transition-all duration-300">
                      {product.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed flex-grow">
                      {product.description}
                    </p>

                    {/* Benefits Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.benefits.map((benefit, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-700"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>

                    {/* Price and Connect CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div>
                        <span className="text-3xl font-black text-slate-900">
                          ${product.price}
                        </span>
                      </div>
                      <ContactDropdown
                        productName={product.name}
                        productPrice={product.price}
                        productImage={product.image}
                        productCategory={product.category}
                        colorClass={product.color}
                      />
                    </div>
                  </div>

                  {/* Hover Effect Border */}
                  <div
                    className={`absolute inset-0 rounded-[2rem] border-2 border-transparent group-hover:border-gradient-to-r group-hover:${product.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* View All CTA */}
          <div className="text-center mt-16">
            <button className="px-10 py-4 rounded-full border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-all duration-300 inline-flex items-center gap-2 group">
              View All Products
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats-section relative z-10 py-20 px-6 bg-gradient-to-br from-rose-500 to-orange-500">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="stat-item text-center text-white">
              <div className="text-5xl font-black mb-2">50k+</div>
              <div className="text-sm opacity-90 uppercase tracking-wider">
                Happy Customers
              </div>
            </div>
            <div className="stat-item text-center text-white">
              <div className="text-5xl font-black mb-2">100%</div>
              <div className="text-sm opacity-90 uppercase tracking-wider">
                Natural Ingredients
              </div>
            </div>
            <div className="stat-item text-center text-white">
              <div className="text-5xl font-black mb-2">4.9</div>
              <div className="text-sm opacity-90 uppercase tracking-wider">
                Average Rating
              </div>
            </div>
            <div className="stat-item text-center text-white">
              <div className="text-5xl font-black mb-2">5 Yrs</div>
              <div className="text-sm opacity-90 uppercase tracking-wider">
                In Business
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INGREDIENTS SECTION (Horizontal Scroll) */}
      <section
        id="ingredients"
        ref={horizontalRef}
        className="relative z-10 bg-slate-900 text-white overflow-hidden"
      >
        <div className="h-screen flex items-center m-20">
          {/* Fixed Header */}
          <div className="fixed top-20 padding-10 left-10 md:left-20 z-50 pointer-events-none">
            <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl">
              PURE <span className="text-rose-500">SOURCE.</span>
            </h2>
            <p className="text-slate-300 mt-2 text-lg drop-shadow-lg">
              {"Scroll to explore ingredients →"}
            </p>
          </div>

          {/* Horizontal Scrolling Container */}
          <div className="flex items-center gap-8 h-full py-20">
            {INGREDIENTS.map((item) => (
              <div
                key={item.id}
                className={`horizontal-panel w-[85vw] md:w-[600px] h-[70vh] ${item.bgColor} rounded-[2.5rem] flex-shrink-0 ${item.borderColor} border-2 relative group overflow-hidden shadow-2xl ml-8 first:ml-[20vw]`}
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-10">
                  <div className="mb-4">
                    <span className="text-sm font-bold text-white/80 uppercase tracking-wider">
                      {item.label}
                    </span>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black mb-4 text-white drop-shadow-lg">
                    {item.title}
                  </h3>
                  <p className="text-base md:text-lg text-white/95 mb-6 max-w-md leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium text-white border border-white/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Spacer at the end */}
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
          <h2 className="text-5xl font-black mb-4">Loved by Thousands</h2>
          <p className="text-slate-500 text-lg">
            Real results from real people
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="testimonial-card bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-slate-600 mb-6">
              {'"My skin has never looked better! The Rose Hip Serum is a game-changer. I\'ve noticed a visible reduction in fine lines after just two weeks."'}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-orange-400" />
              <div>
                <div className="font-bold">Sarah M.</div>
                <div className="text-sm text-slate-500">Verified Customer</div>
              </div>
            </div>
          </div>

          <div className="testimonial-card bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-slate-600 mb-6">
              {'"Finally found skincare that doesn\'t irritate my sensitive skin. The Cloud Cream is so lightweight yet incredibly moisturizing. Absolutely worth every penny!"'}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
              <div>
                <div className="font-bold">Emily R.</div>
                <div className="text-sm text-slate-500">Verified Customer</div>
              </div>
            </div>
          </div>

          <div className="testimonial-card bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-slate-600 mb-6">
              {'"I love that everything is natural and eco-friendly. The Midnight Oil transformed my dry skin overnight. My makeup applies so smoothly now!"'}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-400" />
              <div>
                <div className="font-bold">Jessica L.</div>
                <div className="text-sm text-slate-500">Verified Customer</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto text-center cta-content">
          <div className="bg-gradient-to-br from-rose-500 to-orange-500 rounded-[3rem] p-12 md:p-20 shadow-2xl">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Ready to Transform Your Skin?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of happy customers and start your journey to
              radiant, healthy skin today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-10 py-5 rounded-full bg-white text-rose-500 font-bold text-lg hover:shadow-2xl transition-all">
                Shop Now
              </button>
              <button className="px-10 py-5 rounded-full border-2 border-white text-white font-bold text-lg hover:bg-white hover:text-rose-500 transition-all">
                Take the Quiz
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        id="about"
        className="relative z-10 bg-slate-900 text-white py-20 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <h2 className="text-3xl font-bold tracking-tighter mb-4">
                AURA<span className="text-rose-500">SKIN.</span>
              </h2>
              <p className="text-slate-400 mb-6 max-w-md">
                Premium plant-based skincare designed for those who demand
                excellence. Sustainably sourced, scientifically proven,
                beautifully simple.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-rose-500 transition-colors"
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
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-rose-500 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-rose-500 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Shop</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    All Products
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Bestsellers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Gift Sets
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Sale
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Shipping
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Returns
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              {"© 2026 AuraSkin Inc. All rights reserved."}
            </p>
            <div className="flex gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
