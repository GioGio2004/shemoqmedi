"use client";

import Image from "next/image";
import { Clock, MapPin, ArrowUpRight } from "lucide-react";
import { useLocale } from "next-intl";

import type { StorefrontConfig } from "./hero-section";

const DEFAULT_HOURS = [
  { day: "Mon - Fri", hours: "07:00 - 19:00" },
  { day: "Saturday", hours: "08:00 - 18:00" },
  { day: "Sunday", hours: "09:00 - 16:00" },
];

interface InfoSectionProps {
  operatingHours?: { day: string; hours: string }[];
  storefrontConfig?: StorefrontConfig | null;
}

export function InfoSection({ operatingHours, storefrontConfig }: InfoSectionProps) {
  const locale = useLocale();
  const displayHours = operatingHours && operatingHours.length > 0 ? operatingHours : DEFAULT_HOURS;

  const getStr = (val: any) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    return val[locale] || val["en"] || Object.values(val)[0] || "";
  };

  return (
    <section id="visit" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-14">
          <span className="text-xs font-medium tracking-[0.25em] uppercase text-primary mb-3 block">
            Come Say Hello
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-foreground text-balance">
            Find us in your
            <span className="italic text-primary"> neighborhood</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Schedule Card */}
          <div className="p-8 md:p-10 rounded-2xl bg-card border border-border flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-serif text-foreground mb-1">Opening Hours</h3>
              <p className="text-sm text-muted-foreground tracking-wide uppercase mb-8">
                Visit us any day of the week
              </p>
            </div>
            <ul className="space-y-4">
              {displayHours.map((item, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center text-base pb-3 border-b border-border last:border-b-0 last:pb-0"
                >
                  <span className="font-medium text-foreground">{item.day}</span>
                  <span className="text-primary font-medium tabular-nums">{item.hours}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Location Card */}
          <div className="relative p-8 md:p-10 rounded-2xl bg-primary text-primary-foreground flex flex-col justify-between min-h-[380px] overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/15 flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-serif text-primary-foreground mb-1">Our Location</h3>
              <div className="mt-6">
                <p className="text-xl font-medium text-primary-foreground">
                  {getStr(storefrontConfig?.address) || "42 Bean Street"}
                </p>
                <p className="text-lg text-primary-foreground/70">
                  {getStr(storefrontConfig?.cityStateZip) || "Portland, OR 97201"}
                </p>
              </div>
            </div>

            <div className="relative z-10">
              <button
                type="button"
                className="flex items-center gap-2 px-6 py-3 bg-primary-foreground text-primary font-medium hover:opacity-90 transition-all"
                style={{ borderRadius: 'var(--radius, 9999px)' }}
              >
                Get Directions
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Background Map Effect */}
            <div className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity duration-500">
              <Image
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1748"
                alt="Map background"
                fill
                className="object-cover grayscale"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
