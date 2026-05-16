"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const BG = "https://plus.unsplash.com/premium_photo-1675435644687-562e8042b9db?q=80&w=749&auto=format&fit=crop";

const ICON_LOTTIE: Record<string, string> = {
    Menu:      "/animations/Notebook.lottie",
    Instagram: "/animations/Instagram Logo.lottie",
    TikTok:    "/animations/tiktok icon.lottie",
    Facebook:  "/animations/Facebook Logo Effect.lottie",
};

export interface CafeHubProps {
    businessName?: string;
    menuUrl?: string;
    instagramUrl?: string;
    tiktokUrl?: string;
    facebookUrl?: string;
    backgroundImageUrl?: string;
    visible: boolean;
    onLink: (url: string) => void;
}

// ─── Glass token: near-zero fill so the backdrop-blur is the ONLY visible effect ─
// rgba(255,255,255,0.01) is invisible to the eye but activates the browser's
// compositing layer, which is what makes backdrop-filter render at all.
const GLASS: React.CSSProperties = {
    background: "rgba(255,255,255,0.01)",
    backdropFilter: "blur(8px) saturate(120%)",
    WebkitBackdropFilter: "blur(8px) saturate(120%)",
    boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.22), 0 2px 16px rgba(0,0,0,0.08)",
    border: "none",
};

export default function DarkTheme({
    businessName, menuUrl, instagramUrl, tiktokUrl, facebookUrl,
    backgroundImageUrl, visible, onLink,
}: CafeHubProps) {
    const bg = backgroundImageUrl || BG;

    const links = [
        menuUrl      ? { label: "Menu",      url: menuUrl      } : null,
        instagramUrl ? { label: "Instagram", url: instagramUrl } : null,
        tiktokUrl    ? { label: "TikTok",    url: tiktokUrl    } : null,
        facebookUrl  ? { label: "Facebook",  url: facebookUrl  } : null,
    ].filter(Boolean) as { label: string; url: string }[];

    return (
        <div className={`absolute inset-0 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>

            <img src={bg} alt="" aria-hidden
                className="absolute inset-0 w-full h-full object-cover scale-105"
                style={{ filter: "brightness(0.55) saturate(1.1)" }} />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />

            <div className={`relative z-20 flex flex-col items-center justify-end h-full pb-16 px-6
                transition-all duration-700 delay-100 ease-[cubic-bezier(0.16,1,0.3,1)]
                ${visible ? "translate-y-0" : "translate-y-10"}`}>

                {/* Badge */}
                <div className="mb-4 px-4 py-1.5 rounded-full text-[9px] uppercase tracking-[0.3em] font-bold text-white/40"
                    style={GLASS}>
                    Voloo Magic
                </div>

                <h1 className="text-[2.4rem] font-black text-white tracking-[-0.03em] text-center leading-[1.05] mb-3 drop-shadow-2xl">
                    {businessName || "Welcome"}
                </h1>

                <p className="text-[11px] text-white/35 uppercase tracking-[0.22em] font-medium mb-9">
                    Find us here
                </p>

                {/* Purely blurred glass pill buttons — zero color fill */}
                <div className="w-full max-w-[340px] space-y-[10px]">
                    {links.length === 0 ? (
                        <p className="text-center text-white/25 text-sm">No links configured yet.</p>
                    ) : (
                        links.map(({ label, url }) => (
                            <button
                                key={label}
                                onClick={() => onLink(url)}
                                style={GLASS}
                                className="w-full flex items-center justify-between px-6 rounded-[22px] h-[72px]
                                    text-white transition-all duration-200 active:scale-[0.97]"
                            >
                                <span className="text-[17px] font-semibold tracking-[-0.01em] text-white/90">
                                    {label}
                                </span>
                                <div className="w-16 h-16 flex-shrink-0 -mr-1">
                                    <DotLottieReact src={ICON_LOTTIE[label]} autoplay loop
                                        style={{ width: 64, height: 64 }} />
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <p className="mt-8 text-[9px] uppercase tracking-[0.3em] text-white/15 font-medium">
                    Powered by Voloo Magic
                </p>
            </div>
        </div>
    );
}
