"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { creations, Creation } from "@/lib/creation-list";
import { AnimatePresence, motion } from "framer-motion";

export function Creations() {
    const t = useTranslations("Landing.Creations");
    const [selectedCreation, setSelectedCreation] = useState<Creation | null>(null);

    return (
        <section id="creations" className="relative py-20 md:py-32 px-6 bg-zinc-50 border-b border-zinc-200">

            <div className="relative z-10 max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 md:mb-20 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-indigo-500" />
                            <span className="text-zinc-500 font-bold text-sm uppercase tracking-[0.2em]">{t("title")}</span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter mb-2">
                            {t.rich("subtitle", {
                                span: (chunks) => <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-600">{chunks}</span>
                            })}
                        </h2>
                    </div>
                    <p className="text-zinc-500 font-medium max-w-sm text-right hidden md:block leading-relaxed">
                        {t("description")}
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                    {creations.map((item) => (
                        <motion.div
                            layoutId={`card-${item.id}`}
                            key={item.id}
                            onClick={() => setSelectedCreation(item)}
                            className="group relative h-[380px] rounded-[2rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-white border border-zinc-100"
                        >
                            <div className="absolute inset-0 z-0">
                                <Image
                                    src={item.image}
                                    alt={t(`items.${item.id}.title`)}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/20 to-transparent" />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col justify-end h-full">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${item.color} bg-white/90 backdrop-blur px-2 py-1 rounded inline-block`}>
                                            {t(`items.${item.id}.category`)}
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-200 transition-colors">{t(`items.${item.id}.title`)}</h3>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                        <ArrowUpRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {selectedCreation && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setSelectedCreation(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
                        />
                        <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                layoutId={`card-${selectedCreation.id}`}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="w-full max-w-3xl bg-white rounded-[2rem] overflow-hidden shadow-2xl pointer-events-auto relative max-h-[90vh] flex flex-col md:flex-row"
                            >
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedCreation(null); }}
                                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/10 hover:bg-black/20 text-white backdrop-blur-md transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="relative h-64 md:h-auto md:w-1/2">
                                    <Image
                                        src={selectedCreation.image}
                                        alt={t(`items.${selectedCreation.id}.title`)}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                                </div>

                                <div className="p-8 md:p-10 md:w-1/2 flex flex-col justify-center bg-white">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1, duration: 0.2 }}
                                        className={`text-xs font-bold uppercase tracking-wider mb-3 ${selectedCreation.color} bg-zinc-100 px-3 py-1 rounded-full self-start`}
                                    >
                                        {t(`items.${selectedCreation.id}.category`)}
                                    </motion.div>
                                    <motion.h2
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15, duration: 0.2 }}
                                        className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4"
                                    >
                                        {t(`items.${selectedCreation.id}.title`)}
                                    </motion.h2>
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.2 }}
                                        className="text-zinc-600 leading-relaxed mb-8"
                                    >
                                        {t(`items.${selectedCreation.id}.description`)}
                                    </motion.p>

                                    <div className="space-y-4">
                                        <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-xs border-b border-zinc-100 pb-2">Project Highlights</h4>
                                        <ul className="space-y-2">
                                            <motion.li
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.25, duration: 0.2 }}
                                                className="flex items-center gap-3 text-zinc-600 text-sm"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                {t(`items.${selectedCreation.id}.highlight1`)}
                                            </motion.li>
                                            <motion.li
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3, duration: 0.2 }}
                                                className="flex items-center gap-3 text-zinc-600 text-sm"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                {t(`items.${selectedCreation.id}.highlight2`)}
                                            </motion.li>
                                        </ul>
                                    </div>

                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

        </section>
    );
}
