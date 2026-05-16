"use client";

import { motion } from "framer-motion";

interface MenuItemProps {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  index: number;
}

export function MenuItem({ name, description, price, imageUrl, index }: MenuItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-2xl bg-neutral-900/50 p-2 sm:p-4 border border-neutral-800/80 backdrop-blur-sm transition-all hover:border-amber-900/50 hover:bg-neutral-900/80 hover:shadow-lg hover:shadow-amber-900/20"
    >
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-neutral-950">
        <img 
          src={imageUrl} 
          alt={name} 
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
      </div>
      <div className="mt-3 sm:mt-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm sm:text-lg font-semibold text-neutral-100 group-hover:text-amber-500 transition-colors">{name}</h3>
          <span className="text-sm sm:text-base font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">{price}</span>
        </div>
        <p className="mt-1.5 text-xs sm:text-sm text-neutral-400 line-clamp-2 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
