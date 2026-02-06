"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";

export function IntroScreen() {
  const t = useTranslations("Landing.Intro");
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already seen the intro in this session
    const hasSeen = sessionStorage.getItem("hasSeenIntro");
    if (!hasSeen) {
      setIsVisible(true);
      sessionStorage.setItem("hasSeenIntro", "true");
    }
  }, []);

  useGSAP(
    () => {
      if (!isVisible || !containerRef.current) return;

      const tl = gsap.timeline({
        onComplete: () => setIsVisible(false),
      });

      // Bright Gradient Reveal
      tl.to(".intro-text", {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        stagger: 0.2,
      })
        .to(".intro-line", {
          scaleX: 1,
          duration: 1.2,
          ease: "expo.out",
        }, "-=0.5")
        .to(".intro-content", {
          opacity: 0,
          y: -20,
          duration: 0.8,
          delay: 0.5,
          ease: "power2.in",
        })
        .to(containerRef.current, {
          yPercent: -100,
          duration: 1.2,
          ease: "power4.inOut",
        });
    },
    { scope: containerRef, dependencies: [isVisible] }
  );

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white text-zinc-900"
    >
      <div className="intro-content flex flex-col items-center">
        <h1 className="intro-text opacity-0 translate-y-10 text-4xl md:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600">
          {t("brand")}
        </h1>
        {/* Gradient Line Accent */}
        <div className="intro-line w-32 h-1.5 rounded-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 scale-x-0 origin-left mb-6 shadow-lg shadow-pink-200" />
        <p className="intro-text opacity-0 translate-y-5 text-sm md:text-lg font-medium tracking-widest text-zinc-500 uppercase">
          {t("subtitle")}
        </p>
      </div>
    </div>
  );
}
