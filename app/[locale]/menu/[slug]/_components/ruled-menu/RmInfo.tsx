"use client";

// ruled-menu/RmInfo.tsx
// Bone visiting-card block — hours as ruled rows, address / phone / map /
// socials as mono roll-hover links. units.gr "all-inclusive" clarity,
// RULED dress code.

import Reveal from "@/components/motion/Reveal";
import { SectionHead } from "@/components/motion/DecorLines";

type InfoLink = { label: string; href: string };

function RollLink({ label, href }: InfoLink) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="rm-link-roll v-t-mono"
      style={{ color: "var(--v-c-ink, var(--v-ink))" }}
    >
      <span>{label} ↗</span>
      <span aria-hidden>{label} ↗</span>
    </a>
  );
}

export default function RmInfo({
  index,
  label,
  heading,
  hoursLabel,
  contactLabel,
  hours,
  address,
  links,
}: {
  index: string;
  label: string;
  heading: string;
  hoursLabel: string;
  contactLabel: string;
  hours: Array<{ day: string; hours: string }>;
  address: string | null;
  links: InfoLink[];
}) {
  return (
    <section className="rm-sec" data-theme="bone" id="info">
      <div className="rm-wrap">
        <SectionHead index={index} label={label} headingClassName="v-t-h2">
          <Reveal as="h2" type="lines" className="v-t-h2">
            {heading}
          </Reveal>
        </SectionHead>

        <div className="rm-info-grid mt-12">
          {/* Hours */}
          {hours.length > 0 && (
            <div>
              <p className="v-t-mono mb-4" style={{ color: "var(--v-c-faint, var(--v-faint))" }}>
                {hoursLabel}
              </p>
              <div>
                {hours.map((h, i) => (
                  <Reveal key={`${h.day}-${i}`} type="fade" delay={i * 0.05} duration={0.6} className="rm-hours-row">
                    <span className="v-t-small" style={{ color: "var(--v-c-mut, var(--v-mut))" }}>
                      {h.day}
                    </span>
                    <span className="v-t-mono tabular-nums" style={{ color: "var(--v-c-ink, var(--v-ink))" }}>
                      {h.hours}
                    </span>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {/* Contact */}
          <div>
            <p className="v-t-mono mb-4" style={{ color: "var(--v-c-faint, var(--v-faint))" }}>
              {contactLabel}
            </p>
            {address && (
              <Reveal
                as="p"
                type="lines"
                className="font-v-display text-[clamp(1.2rem,2.4vw,1.8rem)] font-medium leading-snug tracking-tight mb-6 max-w-md text-balance"
              >
                {address}
              </Reveal>
            )}
            <div className="flex flex-col items-start gap-3">
              {links.map((l, i) => (
                <Reveal key={l.href} type="fade" delay={0.1 + i * 0.06} duration={0.6}>
                  <RollLink {...l} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
