"use client";

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface MenuItemProps {
  name: string;
  description: string;
  price: string;
  imageUrl?: string;
  index: number;
  addToCart?: (item: { name: string; price: string; imageUrl?: string }) => void;
}

export function MenuItem({ name, description, price, imageUrl, index, addToCart }: MenuItemProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const containerDelay = index * 0.1;

  return (
    <div ref={ref} className="flex flex-col gap-4 mb-16 group cursor-default">
      {imageUrl && (
        <div className="w-full aspect-[16/10] md:aspect-[4/3] mb-6 overflow-hidden bg-[#FCFCFC] relative rounded-[2rem] shadow-[0_10px_40px_rgb(0,0,0,0.04)] border border-[#111111]/5">
          {/* Curtain Reveal */}
          <motion.div 
            initial={{ scaleY: 1 }}
            animate={isInView ? { scaleY: 0 } : { scaleY: 1 }}
            transition={{ duration: 1.05, ease: [0.76, 0, 0.24, 1], delay: containerDelay }}
            style={{ originY: 1 }}
            className="absolute inset-0 bg-[#F5F5F5] z-20"
          />
          
          <div className="absolute inset-0 bg-[#111111]/[0.02] mix-blend-multiply z-10 transition-opacity duration-1000 group-hover:opacity-0 pointer-events-none"></div>
          
          <motion.div
            initial={{ scale: 1.2 }}
            animate={isInView ? { scale: 1 } : { scale: 1.2 }}
            transition={{ duration: 1.35, ease: [0.16, 1, 0.3, 1], delay: containerDelay + 0.1 }}
            className="w-full h-full"
          >
            <motion.img 
              src={imageUrl} 
              alt={name} 
              className="w-full h-full object-cover saturate-[0.8] contrast-[1.05]"
              whileHover={{ scale: 1.05, filter: "saturate(1.1) contrast(1.05)" }}
              transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
              loading="lazy" 
            />
          </motion.div>
        </div>
      )}
      
      <div className="overflow-hidden py-1">
        <motion.div 
          initial={{ y: "100%", opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: containerDelay + 0.3 }}
          className="transform transition-transform duration-700 group-hover:translate-x-2"
        >
          <h3 className="text-[15px] md:text-[17px] font-semibold text-[#111111] tracking-[0.15em] uppercase leading-tight mb-3 flex items-center">
            {name} 
            <span className="mx-3 font-light text-neutral-300">|</span> 
            <span className="font-medium text-neutral-500">{price.replace('₾', '')} GEL</span>
          </h3>
          <p className="text-[#555555] text-[13px] md:text-[15px] leading-loose max-w-lg font-serif italic tracking-wide mb-4">
            {description}
          </p>
          {addToCart && (
            <button 
              onClick={() => addToCart({ name, price, imageUrl })}
              className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] font-medium border border-[#111111] px-5 py-2 hover:bg-[#111111] hover:text-[#FCFCFC] transition-all duration-700 ease-[0.76,0,0.24,1]"
            >
              Add to order
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
