"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";

export function Hero() {

  useGSAP(() => {
    gsap.from(".hero-title span", {
      y: 100,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: "power4.out",
      delay: 0.2
    });

    gsap.from(".hero-img", {
      x: 100,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      delay: 0.5
    });
  });

  return (
    <section className="pt-20 min-h-screen bg-white relative overflow-hidden flex flex-col md:flex-row items-center border-b-4 border-black">
      
      {/* Background Shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ccff00] rounded-full blur-[100px] opacity-50 mix-blend-multiply" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ff00cc] rounded-full blur-[100px] opacity-30 mix-blend-multiply" />

      {/* Content */}
      <div className="w-full md:w-1/2 p-6 md:p-20 z-10 flex flex-col justify-center h-full relative">
        <div className="hero-title text-6xl md:text-[8rem] font-black uppercase leading-[0.85] italic tracking-tighter mb-8 text-center md:text-left">
          <span className="block text-stroke text-transparent">Run</span>
          <span className="block text-black">The</span>
          <span className="block text-[#00ccff]">Streets</span>
        </div>
        
        <p className="font-bold text-xl uppercase tracking-wide mb-10 max-w-sm">
          The freshest kicks dropped today. Cop them before they vanish.
        </p>

        <div className="flex justify-center md:justify-start w-full">
            <a href="#shop" className="group inline-flex items-center gap-3 w-fit px-8 py-4 bg-black text-white rounded-full font-black uppercase text-lg hover:bg-[#ccff00] hover:text-black transition-all hover:scale-105 border-2 border-black">
            Shop Now
            <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <ArrowUpRight size={18} strokeWidth={3} />
            </div>
            </a>
        </div>
      </div>

      {/* Hero Image */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-screen relative bg-[#f0f0f0] md:border-l-4 border-black border-t-4 md:border-t-0 flex items-center justify-center overflow-hidden">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(black 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
        />
        
        <img 
          src="https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=2021" 
          alt="Featured Sneaker" 
          className="hero-img w-[120%] h-auto object-cover transform -rotate-12 shadow-[20px_20px_0px_#ccff00] border-4 border-black rounded-3xl z-10 hover:shadow-[30px_30px_0px_#ff00cc] hover:-rotate-6 transition-all duration-500 cursor-pointer"
        />

        <div className="absolute bottom-10 right-10 z-20 bg-white border-4 border-black p-4 rotate-3 shadow-[8px_8px_0px_black]">
            <p className="font-black uppercase text-xs">Featured</p>
            <p className="font-black uppercase text-2xl italic">Air Jordan 1</p>
            <p className="font-bold text-[#ff00cc]">$180.00</p>
        </div>
      </div>

      <style jsx global>{`
        .text-stroke {
          -webkit-text-stroke: 3px black;
        }
      `}</style>
    </section>
  );
}
