"use client";

// components/landing/sections/Concierge.tsx
// ─────────────────────────────────────────────────────────────────────────────
// 02 — CONCIERGE (spec §4.5). Bone section. Left: "Ask the menu anything." +
// three trilingual mono chips — the chips themselves ARE the i18n feature
// demo, so they are intentionally identical across locales. Right: barista
// image in a crosshair frame with a floating chat-bubble mock that reveals
// 0.3s after the frame. "TRY VOLOO →" opens a live menu (where the VolooAI
// concierge actually lives) — falls back to the waitlist pre-launch.
// ─────────────────────────────────────────────────────────────────────────────

import { useTranslations } from "next-intl";
import { SectionHead, XFrame } from "@/components/motion/DecorLines";
import Reveal from "@/components/motion/Reveal";
import { buildMenuUrl } from "@/lib/routes";
import type { LandingVenue } from "../MotionLanding";
import { IMG, Roll, UImg } from "./shared";

// The trilingual demo chips (hard rule: identical in every locale).
const CHIPS = ['"WHAT’S VEGAN?"', '"დამალიე ლაქტოზა"', '"ЧТО ВЗЯТЬ К ВИНУ?"'];

export default function Concierge({
  venues,
  locale,
}: {
  venues: LandingVenue[];
  locale: string;
}) {
  const t = useTranslations("LandingRuled.concierge");
  const tryHref = venues.length
    ? buildMenuUrl(locale, venues[0].slug)
    : "#waitlist";

  return (
    <section className="ml-sec" id="concierge" data-flip="bone">
      <div className="ml-wrap">
        <SectionHead index="02" label={t("label")} meta="( VOLOO AI )" headingClassName="" />

        <div className="ml-conc">
          <div>
            <Reveal as="h2" type="lines" className="v-t-h2 ml-conc-h">
              {t("heading")}
            </Reveal>
            <Reveal as="p" type="lines" className="v-t-lead ml-conc-sub">
              {t("sub")}
            </Reveal>

            <div className="ml-chips">
              {CHIPS.map((c, i) => (
                <Reveal
                  key={c}
                  as="span"
                  type="fade"
                  delay={i * 0.06}
                  duration={0.6}
                  className="ml-chip v-press"
                >
                  {c}
                </Reveal>
              ))}
            </div>

            <a href={tryHref} className="ml-conc-try ml-rollhost" data-cursor="AI">
              <Roll>{t("try")}</Roll>
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="ml-conc-visual">
            <XFrame bare>
              <Reveal type="frame" className="v-xframe-in ml-conc-img">
                <UImg
                  src={IMG.concierge}
                  alt="Barista pouring coffee in a dark room"
                  sizes="(max-width: 1023px) 100vw, 40vw"
                />
              </Reveal>
            </XFrame>
            <Reveal type="fade" delay={0.3} duration={0.7} className="ml-conc-bubble">
              <span className="ml-conc-bubble-tag">VOLOO AI</span>
              <p className="ml-conc-bubble-q">{CHIPS[0]}</p>
              <p className="ml-conc-bubble-a">{t("bubble_a")}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
