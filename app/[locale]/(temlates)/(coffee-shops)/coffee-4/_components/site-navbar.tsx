"use client";

import { useState, useEffect } from "react";
import { MegaMenu } from "./mega-menu";

export function SiteNavbar({
  onCategorySelect,
}: {
  onCategorySelect?: (category: string) => void;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <a href="#" className="text-xl font-serif tracking-wide text-foreground">
          KO<span className="text-primary">HI</span>
        </a>

        {/* Mega Menu */}
        <MegaMenu onCategorySelect={onCategorySelect} />
      </div>
    </nav>
  );
}
