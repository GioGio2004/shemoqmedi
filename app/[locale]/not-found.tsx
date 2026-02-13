"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { MoveLeft } from "lucide-react";

export default function NotFound() {
    const t = useTranslations("NotFound");

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-50 relative overflow-hidden">
            {/* Background Blobs (Similar to Hero for consistency) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-purple-300 rounded-full blur-[100px] mix-blend-multiply animate-pulse" />
                <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-orange-200 rounded-full blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            <div className="z-10 text-center px-6">
                {/* Large 404 Text */}
                <h1 className="text-[8rem] sm:text-[12rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 mb-4 select-none">
                    404
                </h1>

                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
                    {t("title")}
                </h2>

                <p className="text-zinc-500 max-w-md mx-auto mb-10 text-base sm:text-lg">
                    {t("description")}
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full font-bold transition-all hover:scale-105 shadow-lg group"
                >
                    <MoveLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {t("button")}
                </Link>
            </div>
        </div>
    );
}
