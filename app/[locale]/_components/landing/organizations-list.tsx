"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Store } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "@/convex-helpers-api";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";

export function OrganizationsList() {
    const t = useTranslations("Landing.Creations");
    const locale = useLocale();
    const organizations = useQuery(api.publicMenu.listOrganizations);

    return (
        <section id="organizations" className="relative py-20 md:py-32 px-6 bg-zinc-50 border-b border-zinc-200">
            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 md:mb-20 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Store className="w-5 h-5 text-indigo-500" />
                            <span className="text-zinc-500 font-bold text-sm uppercase tracking-[0.2em]">Our Active Menus</span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter mb-2">
                            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-600">Live Stores</span>
                        </h2>
                    </div>
                    <p className="text-zinc-500 font-medium max-w-sm text-right hidden md:block leading-relaxed">
                        Discover the diverse range of cafes and restaurants powered by Shemoqmedi's digital platform.
                    </p>
                </div>

                {/* Loading State */}
                {organizations === undefined && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-[380px] rounded-[2rem] bg-zinc-200 animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {organizations !== undefined && organizations.length === 0 && (
                    <div className="text-center py-20 text-zinc-500 font-medium">
                        No active organizations found at the moment.
                    </div>
                )}

                {/* Grid */}
                {organizations !== undefined && organizations.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                        {organizations.map((org: { _id: string; slug: string; imageUrl: string | null; name: string }) => (
                            <Link
                                key={org._id}
                                href={`/${locale}/custom-ui-test/${org.slug}`}
                                className="group relative h-[380px] rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-white border border-zinc-100 block"
                            >
                                <div className="absolute inset-0 z-0">
                                    <Image
                                        src={org.imageUrl || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600"}
                                        alt={org.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/20 to-transparent" />
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col justify-end h-full">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-wider mb-2 text-indigo-600 bg-white/90 backdrop-blur px-2 py-1 rounded inline-block">
                                                Digital Menu
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-200 transition-colors">
                                                {org.name}
                                            </h3>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                            <ArrowUpRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
