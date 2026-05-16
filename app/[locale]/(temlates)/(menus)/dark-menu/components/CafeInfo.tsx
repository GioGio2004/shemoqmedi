"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Phone, Sparkles } from "lucide-react";

export function CafeInfo() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="mt-16 sm:mt-24 relative overflow-hidden rounded-[2.5rem] bg-neutral-900/40 p-8 sm:p-16 border border-neutral-800/60 backdrop-blur-md group"
    >
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
        <Sparkles className="w-64 h-64 text-amber-500 blur-3xl" />
      </div>
      
      <div className="relative z-10 grid gap-10 md:gap-16 md:grid-cols-3">
        <motion.div variants={itemVariants} className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-2xl bg-neutral-950/80 p-5 text-amber-500 ring-1 ring-neutral-800 shadow-inner shadow-black">
            <Clock className="h-8 w-8 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="mb-2 text-xl font-medium text-neutral-200 tracking-wide">Opening Hours</h3>
            <p className="text-neutral-400 font-light leading-relaxed">
              Mon - Fri <span className="text-amber-500/80 mx-2">•</span> 8am - 8pm<br/>
              Sat - Sun <span className="text-amber-500/80 mx-2">•</span> 9am - 10pm
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-2xl bg-neutral-950/80 p-5 text-amber-500 ring-1 ring-neutral-800 shadow-inner shadow-black">
            <MapPin className="h-8 w-8 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="mb-2 text-xl font-medium text-neutral-200 tracking-wide">Sanctuary</h3>
            <p className="text-neutral-400 font-light leading-relaxed">
              123 Dark Roast Avenue<br/>
              The Obsidian District, NY 10001
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-2xl bg-neutral-950/80 p-5 text-amber-500 ring-1 ring-neutral-800 shadow-inner shadow-black">
            <Phone className="h-8 w-8 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="mb-2 text-xl font-medium text-neutral-200 tracking-wide">Contact</h3>
            <p className="text-neutral-400 font-light leading-relaxed">
              whispers@nocturnecafe.com<br/>
              +1 (555) 000-DARK
            </p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
