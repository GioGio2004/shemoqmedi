"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";

export function IntroScreen() {
  const t = useTranslations("Landing.Intro");
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        onComplete: () => setIsVisible(false),
      });

      // Stark B&W reveal with Red accent
      tl.to(".intro-text", {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        stagger: 0.2,
      })
        .to(".intro-line", {
          scaleX: 1,
          duration: 0.8,
          ease: "expo.out",
        }, "-=0.5")
        .to(".intro-content", {
          opacity: 0,
          y: -20,
          duration: 0.8,
          delay: 1,
          ease: "power2.in",
        })
        .to(containerRef.current, {
          yPercent: -100,
          duration: 1,
          ease: "power4.inOut",
        });
    },
    { scope: containerRef }
  );

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-white"
    >
      <div className="intro-content flex flex-col items-center">
        <h1 className="intro-text opacity-0 translate-y-10 text-4xl md:text-7xl font-bold tracking-[0.2em] mb-4">
          {t("brand")}
        </h1>
        {/* Dark Red Accent Line */}
        <div className="intro-line w-24 h-[2px] bg-red-900 scale-x-0 origin-left mb-4" />
        <p className="intro-text opacity-0 translate-y-5 text-sm md:text-lg font-light tracking-widest text-zinc-400 uppercase">
          {t("subtitle")}
        </p>
      </div>
    </div>
  );
}
