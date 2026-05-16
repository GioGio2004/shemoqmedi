"use client";

import { motion } from "framer-motion";
import { MenuItem } from "./MenuItem";

interface Item {
  id: string | number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
}

interface MenuSectionProps {
  title: string;
  description?: string;
  items: Item[];
}

export function MenuSection({ title, description, items }: MenuSectionProps) {
  return (
    <section className="py-12 sm:py-20 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-8 sm:mb-14 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tighter text-neutral-100 flex items-center gap-3">
            {title}
            <span className="h-px w-12 sm:w-24 bg-amber-500/50 hidden sm:block"></span>
          </h2>
          {description && <p className="mt-3 text-sm sm:text-base text-neutral-400 max-w-xl">{description}</p>}
        </div>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {items.map((item, index) => (
          <MenuItem key={item.id} {...item} index={index} />
        ))}
      </div>
    </section>
  );
}
