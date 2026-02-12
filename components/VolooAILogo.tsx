import React, { useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import gsap from 'gsap';
import animationData from '../public/volooAIlogo.json'; // Ensure path is correct

const VolooAILogo = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && glowRef.current) {
      // 1. Hover/Floating animation for the whole icon
      gsap.to(containerRef.current, {
        y: -15,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // 2. The "Moving Light" Loop
      // This moves a subtle radial glow across the Lottie animation
      gsap.to(glowRef.current, {
        x: '200%',
        y: '200%',
        duration: 4,
        repeat: -1,
        ease: "power1.inOut",
        yoyo: true,
      });
    }
  }, []);

  return (
    <div className="relative w-64 h-64 group" ref={containerRef}>
      {/* The Moving Light (Overlay) */}
      <div 
        ref={glowRef}
        className="absolute -top-1/2 -left-1/2 w-full h-full pointer-events-none z-10"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(20px)',
          mixBlendMode: 'soft-light',
        }}
      />

      {/* The Lottie Animation */}
      <Lottie 
        animationData={animationData} 
        loop={true}
        className="w-full h-full"
      />

      {/* Optional: Subtle drop shadow that reacts to the float */}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-1/2 h-4 bg-black/20 blur-xl rounded-[100%] scale-x-110" />
    </div>
  );
};

export default VolooAILogo;