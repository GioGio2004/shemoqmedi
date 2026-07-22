"use client";

// components/landing/sections/Waitlist.tsx
// ─────────────────────────────────────────────────────────────────────────────
// 04 — FOR VENUES (spec §4.7). Dark. The waitlist API contract is untouched:
// POST { email, neighborhood, company } to /api/waitlist, honeypot `company`
// visually hidden, four UI states (idle / loading / success / error).
// RULED skin: boxless rule-inputs (1px bottom hairline, accent on focus),
// filled-accent REQUEST ACCESS submit, mono state feedback — success in
// emerald-400, error in red-400 (the only permitted semantic colors).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { MagneticButton } from "@/components/Magnetic";
import { SectionHead } from "@/components/motion/DecorLines";
import Reveal from "@/components/motion/Reveal";

export default function Waitlist() {
  const t = useTranslations("LandingRuled.waitlist");
  const [email, setEmail] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (status === "loading") return;
      if (honeypot) return; // bots fill every field — humans never see this one
      setStatus("loading");
      setError("");
      try {
        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, neighborhood, company: honeypot }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || t("error_generic"));
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : t("error_generic"));
      }
    },
    [email, neighborhood, honeypot, status, t]
  );

  return (
    <section className="ml-sec" id="waitlist">
      <div className="ml-wrap">
        <SectionHead
          index="04"
          label={t("label")}
          meta={`( ${t("meta")} )`}
          headingClassName=""
        />

        <Reveal as="h2" type="lines" className="v-t-h1 ml-wl-h">
          {t("h_pre")}
          <span className="ml-accent">{t("h_accent")}</span>
        </Reveal>
        <Reveal as="p" type="lines" className="v-t-lead ml-wl-lead">
          {t("lead")}
        </Reveal>

        {status === "success" ? (
          <div className="ml-wl-success" role="status">
            ✓ 05 — {t("success")}
          </div>
        ) : (
          <form className="ml-wl-form" onSubmit={onSubmit}>
            {/* Honeypot — invisible to humans, bots fill every field */}
            <input
              type="text"
              name="company"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="ml-hp"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <div className="ml-wl-row">
              <input
                type="email"
                required
                placeholder={t("email_ph")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ml-in"
                aria-label={t("email_ph")}
              />
              <input
                type="text"
                placeholder={t("hood_ph")}
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="ml-in"
                aria-label={t("hood_ph")}
              />
              <MagneticButton
                type="submit"
                className="ml-cta ml-wl-submit v-press"
                disabled={status === "loading"}
                strength={0.2}
              >
                {status === "loading" ? (
                  <span className="ml-ellipsis" aria-label={t("submit")}>
                    …
                  </span>
                ) : (
                  <>{t("submit")} →</>
                )}
              </MagneticButton>
            </div>
            {status === "error" && <p className="ml-wl-error">{error}</p>}
            <p className="ml-wl-note">{t("note")}</p>
          </form>
        )}
      </div>
    </section>
  );
}
