"use client";

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { MenuItem } from './MenuItem';
interface MenuSectionProps {
  title: string;
  items: any[];
  addToCart: (item: { name: string; price: string; imageUrl?: string }) => void;
}

export function MenuSection({ title, items, addToCart }: MenuSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id={title.toLowerCase()} className="mb-32 pt-32 -mt-32" ref={ref}>
      <div className="flex flex-col items-center mb-24">
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={isInView ? { width: "6rem", opacity: 1 } : { width: 0, opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
          className="h-[1px] bg-[#111111] mb-10"
        />
        <div className="overflow-hidden py-2">
          <motion.h2 
            initial={{ y: "100%", opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="text-4xl md:text-5xl font-serif text-[#111111] capitalize tracking-wide"
          >
            {title}
          </motion.h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 lg:gap-x-24 gap-y-12">
        {items.map((item, index) => (
          <MenuItem key={index} {...item} index={index} addToCart={addToCart} />
        ))}
      </div>
    </section>
  );
}
