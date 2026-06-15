"use client";
import React, { useState } from "react";
import gsap from "gsap";

// Retro SVG Icons with authentic 70s color backgrounds
const navLinks = [
  {
    name: "MENU",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full p-2 bg-[#E8A343] text-[#3B2F2F] rounded-xl border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
      >
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    name: "About US",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full p-2 bg-[#4A5D23] text-[#F5F5DC] rounded-xl border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    name: "Categories",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full p-2 bg-[#8B3A3A] text-[#F5F5DC] rounded-xl border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    name: "FAQ",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full p-2 bg-[#E8CE91] text-[#3B2F2F] rounded-xl border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    name: "contact us",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full p-2 bg-[#008080] text-[#F5F5DC] rounded-xl border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
];

export default function Navbar({ fontHeader }: { fontHeader: string }) {
  const [isOpen, setIsOpen] = useState(false);

  // GSAP Animation Functions
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const iconContainer = e.currentTarget.querySelector(".nav-icon-container");
    const textNode = e.currentTarget.querySelector(".nav-text");

    // Pop the icon in with an elastic, bouncy ease
    gsap.to(iconContainer, {
      width: 56, // Expand width
      opacity: 1,
      marginRight: 16, // Push text to the right
      rotation: -5, // Slight retro tilt
      duration: 0.6,
      ease: "elastic.out(1, 0.6)",
    });

    // Nudge the text right, add a tiny skew (the "wiggle"), and change color
    gsap.to(textNode, {
      x: 10,
      skewX: -4, // Playful retro skew
      color: "transparent",
      duration: 0.4,
      ease: "back.out(1.5)",
    });

    // Apply the Tailwind outline stroke class
    if (textNode) {
      textNode.classList.add("[-webkit-text-stroke:1.5px_black]");
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const iconContainer = e.currentTarget.querySelector(".nav-icon-container");
    const textNode = e.currentTarget.querySelector(".nav-text");

    // Smoothly hide the icon
    gsap.to(iconContainer, {
      width: 0,
      opacity: 0,
      marginRight: 0,
      rotation: 0,
      duration: 0.4,
      ease: "power3.out",
    });

    // Return text to original position and solid color
    gsap.to(textNode, {
      x: 0,
      skewX: 0,
      color: "#000000",
      duration: 0.4,
      ease: "power3.out",
    });

    // Remove the outline stroke class
    if (textNode) {
      textNode.classList.remove("[-webkit-text-stroke:1.5px_black]");
    }
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-6 right-4 z-50 p-2 text-[#F5F5DC] bg-black/50 rounded-full backdrop-blur-md border border-white/10"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Dark Overlay Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-[90] transition-opacity duration-500 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-out Menu Panel (Beige Background) */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[450px] lg:w-[500px] bg-[#DBCBB5] z-[100] border-l-2 border-black flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header / Close Button */}
        <div className="flex justify-end p-6 pb-12">
          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 flex items-center justify-center border-2 border-black/20 rounded-lg text-black/50 hover:text-black hover:border-black transition-colors"
          >
            <span className={`${fontHeader} text-xl leading-none`}>X</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col flex-1 border-t-2 border-black">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="flex items-center w-full text-left px-6 py-5 border-b-2 border-black overflow-visible group"
            >
              {/* Icon Container - Hidden by default width: 0 */}
              <div className="nav-icon-container h-14 w-0 opacity-0 flex-shrink-0 origin-left">
                {link.icon}
              </div>

              {/* Text Node */}
              <span
                className={`nav-text ${fontHeader} text-4xl md:text-5xl font-bold text-black transition-colors duration-200 block`}
              >
                {link.name}
              </span>
            </button>
          ))}
        </nav>

        {/* Footer Social Buttons */}
        <div className="p-6 grid grid-cols-2 gap-4 bg-[#DBCBB5]">
          <button
            className={`${fontHeader} border-2 border-black py-3 rounded-lg text-black font-bold text-lg hover:bg-[#E8A343] transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none`}
          >
            instagram
          </button>
          <button
            className={`${fontHeader} border-2 border-black py-3 rounded-lg text-black font-bold text-lg hover:bg-[#E8A343] transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none`}
          >
            facebook
          </button>
        </div>
      </div>
    </>
  );
}
