import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import LandingExperiment from "@/components/LandingExperiment";
import VenueLandingSection from "@/components/venues/VenueLandingSection";
import Link from "next/link";
import {
  SmartphoneNfc,
  MessageCircle,
  LineChart,
  ShieldAlert,
} from "lucide-react";
import InkLanding from "@/components/LandingExperiment";

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://shemoqmedi.space";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Shemoqmedi — AI-Powered Digital Menus for Hospitality",
    description:
      "Voloo turns your café or restaurant into an AI-powered venue. NFC menus, smart ordering, and live customer insights — built for hospitality businesses in Georgia.",
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        en: `${BASE_URL}/en`,
        ka: `${BASE_URL}/ka`,
      },
    },
    openGraph: {
      title: "Shemoqmedi — AI-Powered Digital Menus",
      description:
        "NFC menus, smart ordering, and live AI insights for hospitality businesses in Tbilisi.",
      url: `${BASE_URL}/${locale}`,
      type: "website",
      siteName: "Shemoqmedi",
    },
  };
}

export default function Home() {
  return (
    <main className="relative w-full bg-black text-white selection:bg-gray-600 font-sans">
      {/* Navbar — fixed z-50 */}
      <Navbar />

      {/* ── Hero — LandingExperiment as full-viewport background ───────── */}
      <InkLanding />
      {/* ── Value props strip ─────────────────────────────────────────── */}
      <div className="relative z-10 w-full border-t border-white/[0.05] bg-black">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-8">
          {[
            {
              label: "NFC Tap Menus",
              detail:
                "One tap from the table to the full interactive menu. No app, no download.",
              icon: SmartphoneNfc,
            },
            {
              label: "AI Chat Layer",
              detail:
                "Guests ask questions, get recommendations, and reorder — all in natural language.",
              icon: MessageCircle,
            },
            {
              label: "Live Insights",
              detail:
                "Real-time analytics, order patterns, and guest signals — all in your dashboard.",
              icon: LineChart,
            },
            {
              label: "Dietary Personalization",
              detail:
                "Smart filtering for allergies and dietary preferences so guests order with confidence.",
              icon: ShieldAlert,
            },
          ].map(({ label, detail, icon: Icon }) => (
            <div key={label} className="flex flex-col gap-3 group">
              <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mb-2 group-hover:border-white/20 group-hover:bg-white/[0.05] transition-colors">
                <Icon className="w-4 h-4 text-white/70" />
              </div>
              <p className="text-white text-base font-semibold tracking-tight">
                {label}
              </p>
              <p className="text-white/60 text-sm font-light leading-relaxed">
                {detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Venue section with popup cards ───────────────────────────── */}
      <div className="relative z-10 w-full bg-black">
        <VenueLandingSection />

        {/* ── Contact footer ────────────────────────────────────────── */}
        <footer
          id="contact"
          className="relative flex flex-col items-center justify-center
                     w-full px-6 pt-16 pb-24 border-t border-white/[0.05]"
        >
          <p className="text-[10px] tracking-[0.35em] uppercase text-white/25 mb-6 font-light">
            Get in touch
          </p>
          <h2 className="text-3xl md:text-4xl font-extralight text-white mb-4 text-center leading-[1.2]">
            Ready to elevate your venue?
          </h2>
          <div className="w-12 h-px bg-white/15 mb-6" />
          <p className="text-white/40 text-base font-light text-center max-w-md mb-10">
            We work exclusively with hospitality businesses who demand the
            highest standard of craft and technology.
          </p>
          <a
            href="mailto:hello@shemoqmedi.space"
            className="px-8 py-3 text-sm font-light
                       bg-white/[0.06] border border-white/15 rounded-full
                       text-white/70 transition-all duration-300
                       hover:bg-white/15 hover:text-white hover:border-white/25
                       hover:shadow-lg hover:shadow-white/[0.05]"
          >
            hello@shemoqmedi.space
          </a>
          <div className="absolute bottom-8 w-full flex flex-col sm:flex-row items-center justify-between px-8 text-center sm:text-left gap-4">
            <p className="text-[9px] tracking-[0.3em] uppercase text-white/20 font-light">
              © {new Date().getFullYear()} Voloo Ecosystem — Shemoqmedi.space
            </p>
            <div className="flex items-center gap-4 text-[9px] tracking-[0.2em] uppercase text-white/20 font-light">
              <Link
                href="/privacy"
                className="hover:text-white/40 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-white/40 transition-colors"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
