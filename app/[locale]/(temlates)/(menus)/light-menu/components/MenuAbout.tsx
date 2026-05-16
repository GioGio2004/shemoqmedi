"use client";

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export function MenuAbout() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="max-w-4xl mx-auto text-center my-32 px-6 border-y border-[#111111]/10 py-24" ref={ref}>
      <div className="overflow-hidden py-2 mb-10">
        <motion.h2 
          initial={{ y: "100%", opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl md:text-4xl font-serif text-[#111111] tracking-wide"
        >
          About Us
        </motion.h2>
      </div>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        className="text-[#555555] text-[15px] md:text-[17px] leading-[2.2] max-w-2xl mx-auto font-light tracking-wide"
      >
        Rooted in the vibrant culinary crossroads of Tbilisi, Karabak Restaurant brings the authentic warmth and rich flavors of Turkish and Caucasian heritage to your table. From hand-minced kebabs grilled over open charcoal to wood-fired Khachapuri, our dishes are crafted with time-honored recipes, fresh local ingredients, and a passion for true hospitality.
      </motion.p>
    </section>
  );
}
