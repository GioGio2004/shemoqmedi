"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Coffee, Cake, CloudSun, MapPin, Clock, Phone, Menu as MenuIcon, X, ArrowRight } from "lucide-react";

export function MegaMenu({ onCategorySelect }: { onCategorySelect?: (category: string) => void }) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const categories = [
    {
      title: "Menu",
      id: "menu",
      items: [
        { name: "Coffee", icon: Coffee, desc: "Espresso & Pour Over" },
        { name: "Cakes", icon: Cake, desc: "Fresh Pastries" },
        { name: "Drinks", icon: CloudSun, desc: "Teas & Refreshers" },
      ],
      featured: {
        title: "Seasonal Special",
        name: "Pumpkin Spice",
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600",
      },
    },
    {
      title: "Visit",
      id: "visit",
      items: [
        { name: "Locations", icon: MapPin, desc: "Find nearest cafe" },
        { name: "Hours", icon: Clock, desc: "Opening times" },
        { name: "Contact", icon: Phone, desc: "Get in touch" },
      ],
      featured: {
        title: "New Location",
        name: "Downtown Hub",
        image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600",
      },
    },
  ];

  const handleItemClick = (categoryName: string, sectionId: string) => {
    if (sectionId === "menu" && onCategorySelect) {
      onCategorySelect(categoryName);
    }
    setOpenSection(null);
    setMobileMenuOpen(false);
    const targetId = sectionId === "menu" ? "menu" : "visit";
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* DESKTOP MENU */}
      <div className="hidden md:flex gap-8 items-center" onMouseLeave={() => setOpenSection(null)}>
        {categories.map((cat) => (
          <div key={cat.id} className="relative group" onMouseEnter={() => setOpenSection(cat.id)}>
            <button
              className={`text-sm font-medium tracking-widest uppercase py-4 transition-colors duration-300 ${
                openSection === cat.id
                  ? "text-primary"
                  : scrolled
                    ? "text-foreground hover:text-primary"
                    : "text-foreground/80 hover:text-primary"
              }`}
            >
              {cat.title}
            </button>

            {/* Mega Dropdown */}
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 w-[560px] bg-background/98 backdrop-blur-2xl border border-border rounded-2xl shadow-xl p-6 grid grid-cols-2 gap-6 transition-all duration-300 origin-top z-50 ${
                openSection === cat.id
                  ? "opacity-100 scale-100 visible"
                  : "opacity-0 scale-95 invisible pointer-events-none"
              }`}
            >
              {/* List */}
              <div className="space-y-3">
                <h3 className="text-xs text-primary font-semibold uppercase tracking-wider mb-3">
                  {cat.title} Categories
                </h3>
                {cat.items.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleItemClick(item.name, cat.id)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary transition-colors cursor-pointer group/item w-full text-left"
                  >
                    <div className="p-2.5 bg-secondary rounded-lg group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Featured Image */}
              <div className="relative rounded-xl overflow-hidden group/img min-h-[200px]">
                <Image
                  src={cat.featured.image || "/placeholder.svg"}
                  alt={cat.featured.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover/img:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,15%,15%)]/80 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="text-xs text-primary-foreground/70 font-semibold uppercase mb-1">
                    {cat.featured.title}
                  </div>
                  <div className="text-lg font-serif text-primary-foreground">
                    {cat.featured.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MOBILE HAMBURGER */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 text-foreground"
          aria-label="Open menu"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      </div>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-background flex flex-col p-8 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-12">
              <div className="text-xl font-serif tracking-wide">
                KO<span className="text-primary">HI</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-foreground hover:text-primary transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8">
              {categories.map((cat) => (
                <div key={cat.id}>
                  <h3 className="text-primary text-xs font-semibold uppercase tracking-[0.2em] mb-4 pb-2 border-b border-border">
                    {cat.title}
                  </h3>
                  <div className="space-y-3">
                    {cat.items.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleItemClick(item.name, cat.id)}
                        className="flex items-center justify-between w-full text-foreground hover:text-primary transition-colors group/mobile py-2"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <span className="text-lg font-medium">{item.name}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover/mobile:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
