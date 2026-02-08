"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import { VolooAIGeminiSideComponent } from "../../../../../components/chatbots/volooai-gemini-side-component";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const t = useTranslations("CoffeeTemplate2");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLHeadingElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  
  // Refs for the horizontal scroll section
  const horizontalSectionRef = useRef<HTMLDivElement>(null);
  const horizontalWrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // 1. Hero Animation
      const tl = gsap.timeline();
      tl.from(".hero-glass", {
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
      })
      .from(heroTextRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: -1,
      }, "<");

      // 2. Navbar Blur on Scroll
      gsap.to(".navbar", {
        scrollTrigger: {
          trigger: ".hero-section",
          start: "bottom top",
          toggleActions: "play none none reverse",
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(20px)",
        paddingTop: "1.5rem",
        paddingBottom: "1.5rem",
        duration: 0.5,
      });

      // 3. General Fade-Up for Sections (Story, Menu, Reviews)
      const fadeUpElements = gsap.utils.toArray(".fade-up") as Element[];
      fadeUpElements.forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
          y: 60,
          opacity: 0,
          duration: 1,
          ease: "power2.out",
        });
      });

      // 4. Horizontal Scroll Section
      const sections = gsap.utils.toArray(".horizontal-card");
      if (sections.length > 0) {
        gsap.to(sections, {
            xPercent: -100 * (sections.length - 1),
            ease: "none",
            scrollTrigger: {
            trigger: horizontalSectionRef.current,
            pin: true,
            scrub: 1,
            // Calculate snap points based on number of sections
            snap: 1 / (sections.length - 1),
            end: "+=3000",
            },
        });
      }

      // 5. Parallax Background
      gsap.to(".bg-image", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
        y: 300,
      });
    },
    { scope: containerRef }
  );

  // Data Interfaces
  interface MenuItem {
    icon: string;
    name: string;
    desc: string;
    price: string;
  }

  // Helper arrays for iteration
  const menuItems = t.raw("Menu.items") as MenuItem[];
  const communityReviews = [1, 2, 3]; // Placeholder count for demo
  const footerLinksExplore = t.raw("Footer.links.explore") as string[];
  const footerLinksVisit = t.raw("Footer.links.visit") as string[];
  const footerLinksFollow = t.raw("Footer.links.follow") as string[];

  return (
    <main ref={containerRef} className="relative min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black">
      
      {/* Background Image */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="bg-image absolute inset-0 scale-110">
          <Image
            src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2071&auto=format&fit=crop" 
            alt="Coffee Background"
            fill
            className="object-cover opacity-50"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" />
      </div>

      {/* NAVBAR */}
      <nav className="navbar fixed top-0 w-full z-50 px-8 py-8 transition-all border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-start items-center">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 drop-shadow-sm cursor-pointer hover:opacity-80 transition-opacity">
            {t("Navbar.brand")}
          </h1>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section relative z-10 h-screen flex items-center justify-center px-4">
        <div className="hero-glass max-w-4xl w-full p-12 md:p-20 rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl text-center">
          <h1 ref={heroTextRef} className="text-6xl md:text-8xl font-black tracking-tight mb-8">
            {t("Hero.title_1")} <span className="text-amber-500">{t("Hero.title_2")}</span>
          </h1>
          <p 
            className="text-xl md:text-2xl text-gray-300 mb-10 font-light tracking-wide"
            dangerouslySetInnerHTML={{ __html: t.raw("Hero.subtitle") }} 
          />
          <div className="animate-bounce mt-8">
            <span className="text-amber-500 text-3xl">↓</span>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section ref={storyRef} className="relative z-10 py-32 px-4 max-w-7xl mx-auto border-b border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="fade-up space-y-8">
            <span className="text-amber-500 font-mono tracking-widest text-sm uppercase">{t("Story.badge")}</span>
            <h2 
                className="text-5xl font-bold leading-tight"
                dangerouslySetInnerHTML={{ __html: t.raw("Story.title") }}
            />
            <p className="text-gray-400 text-lg leading-relaxed">
              {t("Story.p1")}
            </p>
            <p className="text-gray-400 text-lg leading-relaxed">
              {t("Story.p2")}
            </p>
            <button className="text-amber-500 border-b border-amber-500 pb-1 hover:text-white hover:border-white transition-colors">
              {t("Story.btn")}
            </button>
          </div>
          <div className="fade-up relative h-[600px] w-full rounded-[2rem] overflow-hidden border border-white/10 rotate-3 hover:rotate-0 transition-transform duration-700">
             <Image 
                src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2574&auto=format&fit=crop"
                alt="Coffee Shop Interior"
                fill
                className="object-cover"
             />
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section ref={menuRef} className="relative z-10 py-32 px-4 max-w-7xl mx-auto">
        <div className="mb-20 text-center fade-up">
          <span className="text-amber-500 font-mono tracking-widest text-sm uppercase mb-4 block">{t("Menu.badge")}</span>
          <h2 className="text-5xl font-bold mb-4 tracking-tight">{t("Menu.title")}</h2>
          <div className="h-1 w-24 bg-amber-500 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {menuItems.map((item, idx) => (
             <div key={idx} className="fade-up menu-item p-1 bg-gradient-to-b from-white/10 to-transparent rounded-3xl">
                <div className="h-full p-8 rounded-[1.3rem] bg-black/60 backdrop-blur-xl border border-white/5 hover:bg-white/5 transition-colors duration-500 group">
                    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                    <h3 className="text-3xl font-bold mb-2">{item.name}</h3>
                    <p className="text-gray-400 mb-6">{item.desc}</p>
                    <span className="text-amber-500 text-xl font-mono">{item.price}</span>
                </div>
            </div>
          ))}
        </div>
      </section>

      {/* Horizontal Scroll Section (Process Gallery) */}
      <section ref={horizontalSectionRef} className="relative z-20 h-screen overflow-hidden bg-zinc-900 border-t border-white/10">
        <div ref={horizontalWrapperRef} className="flex h-full w-[300vw]">
          
          {/* Card 01 */}
          <div className="horizontal-card w-[100vw] h-full flex items-center justify-center p-12 border-r border-white/5 shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-7xl w-full items-center">
                <div className="space-y-6">
                    <span className="text-amber-500 font-mono text-xl">{t("Process.step_1.badge")}</span>
                    <h2 
                        className="text-6xl md:text-7xl font-bold"
                        dangerouslySetInnerHTML={{ __html: t.raw("Process.step_1.title") }}
                    />
                    <p className="text-xl text-gray-400 leading-relaxed">
                        {t("Process.step_1.desc")}
                    </p>
                </div>
                <div className="relative h-[60vh] w-full rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group">
                    <Image 
                        src="https://images.unsplash.com/photo-1690983326555-8b8e27843a32?q=80&w=1170&auto=format&fit=crop"
                        alt="Coffee Beans"
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                </div>
            </div>
          </div>

          {/* Card 02 */}
          <div className="horizontal-card w-[100vw] h-full flex items-center justify-center p-12 border-r border-white/5 bg-zinc-900 shrink-0">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-7xl w-full items-center">
                <div className="relative h-[60vh] w-full rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group order-2 md:order-1">
                    <Image 
                        src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop"
                        alt="Roasting"
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                </div>
                <div className="space-y-6 order-1 md:order-2">
                    <span className="text-amber-500 font-mono text-xl">{t("Process.step_2.badge")}</span>
                    <h2 
                        className="text-6xl md:text-7xl font-bold"
                        dangerouslySetInnerHTML={{ __html: t.raw("Process.step_2.title") }}
                    />
                    <p className="text-xl text-gray-400 leading-relaxed">
                       {t("Process.step_2.desc")}
                    </p>
                </div>
            </div>
          </div>

           {/* Card 03 */}
           <div className="horizontal-card w-[100vw] h-full flex items-center justify-center p-12 bg-zinc-900 shrink-0">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-7xl w-full items-center">
                <div className="space-y-6">
                    <span className="text-amber-500 font-mono text-xl">{t("Process.step_3.badge")}</span>
                    <h2 
                        className="text-6xl md:text-7xl font-bold"
                        dangerouslySetInnerHTML={{ __html: t.raw("Process.step_3.title") }}
                    />
                    <p className="text-xl text-gray-400 leading-relaxed">
                        {t("Process.step_3.desc")}
                    </p>
                </div>
                 <div className="relative h-[60vh] w-full rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group">
                    <Image 
                        src="https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=2070&auto=format&fit=crop"
                        alt="Latte Art"
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Community Section */}
      <section className="relative z-10 py-32 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16 fade-up">
            <h2 className="text-4xl font-bold">{t("Community.title")}</h2>
            <p className="text-gray-400 mt-4">{t("Community.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {communityReviews.map((i) => (
                <div key={i} className="fade-up p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="flex gap-1 text-amber-500 mb-4">★★★★★</div>
                    <p className="text-gray-300 italic mb-6">"{t("Community.review")}"</p>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden relative">
                             <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-amber-800" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">{t("Community.author")}</p>
                            <p className="text-xs text-gray-500">{t("Community.verified")}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="relative z-10 py-24 px-4 border-t border-b border-white/10 bg-white/5 backdrop-blur-3xl">
        <div className="max-w-4xl mx-auto text-center fade-up">
            <h2 className="text-5xl font-black mb-6">{t("Newsletter.title")}</h2>
            <p className="text-xl text-gray-300 mb-10">{t("Newsletter.subtitle")}</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center max-w-lg mx-auto">
                <input 
                    type="email" 
                    placeholder={t("Newsletter.placeholder")}
                    className="flex-1 px-6 py-4 rounded-full bg-black/50 border border-white/20 focus:border-amber-500 outline-none text-white placeholder-gray-500"
                />
                <button className="px-8 py-4 rounded-full bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors">
                    {t("Newsletter.btn")}
                </button>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black pt-20 pb-10 px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-4">
                <h3 className="text-2xl font-black text-white">{t("Footer.brand")}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                    {t("Footer.desc")}
                </p>
            </div>
            <div>
                <h4 className="font-bold mb-6 text-amber-500">{t("Footer.headers.explore")}</h4>
                <ul className="space-y-4 text-gray-400 text-sm">
                    {footerLinksExplore.map((link, i) => (
                        <li key={i} className="hover:text-white cursor-pointer">{link}</li>
                    ))}
                </ul>
            </div>
            <div>
                <h4 className="font-bold mb-6 text-amber-500">{t("Footer.headers.visit")}</h4>
                <ul className="space-y-4 text-gray-400 text-sm">
                    {footerLinksVisit.map((link, i) => (
                        <li key={i} className={i > 1 ? "pt-2" : ""}>{link}</li>
                    ))}
                </ul>
            </div>
            <div>
                <h4 className="font-bold mb-6 text-amber-500">{t("Footer.headers.follow")}</h4>
                <ul className="space-y-4 text-gray-400 text-sm">
                     {footerLinksFollow.map((link, i) => (
                        <li key={i} className="hover:text-white cursor-pointer">{link}</li>
                    ))}
                </ul>
            </div>
        </div>
        <div className="text-center text-gray-600 text-xs pt-8 border-t border-white/5">
            {t("Footer.copyright")}
        </div>
      </footer>
<VolooAIGeminiSideComponent 
        apiEndpoint="/api/chat"
      />
    </main>
  );
}
