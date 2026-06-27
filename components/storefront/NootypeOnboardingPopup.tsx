"use client";

// components/storefront/NootypeOnboardingPopup.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Dining Style onboarding popup — shown ONCE, PERMANENTLY per guest.
//
// Design: Deep black glassmorphism with dark-amber/gold accent borders and
// hover states. Animated entrance/exit using CSS transitions only (no GSAP).
//
// Persistence model (2026-06-27 — Convex-first):
//   • On mount, reads the guest profile from Convex via useNootypeSession.
//     If `nootype` is already set in the database, the popup NEVER renders.
//   • On card select → calls Convex `updateNootype` mutation (not localStorage)
//     → animates out → unmounts. The guest is never prompted again.
//   • Convex reactivity ensures volooAI.tsx receives the update immediately.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useNootypeSession, Nootype } from "@/hooks/useNootypeSession";

// ── Card Definitions ──────────────────────────────────────────────────────────
interface NootypeCard {
  value: Nootype;
  label: string;
  tagline: string;
  icon: string;
  description: string;
  accentColor: string;
  glowColor: string;
}

const NOOTYPE_CARDS: NootypeCard[] = [
  {
    value: "form",
    label: "Elegance",
    tagline: "Visual & aesthetic",
    icon: "✦",
    description: "",
    accentColor: "#ffffff",
    glowColor: "rgba(255,255,255,0.08)",
  },
  {
    value: "overcoming",
    label: "Bold",
    tagline: "Intense & adventurous",
    icon: "⚡",
    description: "",
    accentColor: "#ffffff",
    glowColor: "rgba(255,255,255,0.08)",
  },
  {
    value: "relaxation",
    label: "Frictionless",
    tagline: "Easy & direct",
    icon: "◎",
    description: "",
    accentColor: "#ffffff",
    glowColor: "rgba(255,255,255,0.08)",
  },
  {
    value: "management",
    label: "Detailed",
    tagline: "Precise & analytical",
    icon: "⊞",
    description: "",
    accentColor: "#ffffff",
    glowColor: "rgba(255,255,255,0.08)",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export function NootypeOnboardingPopup() {
  // sessionId = the guestId stored in localStorage.
  // nootype + setNootype are now backed by Convex — no localStorage read/write.
  // isLoading = true while the Convex query is in-flight; during this window
  //             we must NOT render so we don't block the entire UI.
  const { hasOnboarded, setNootype, sessionId, isLoading } = useNootypeSession();

  // SSR guard — never render until after client mount
  const [mounted, setMounted]       = useState(false);
  // Controls the CSS exit animation before unmounting
  const [isExiting, setIsExiting]   = useState(false);
  // Which card the user hovered (for hover glow)
  const [hoveredCard, setHoveredCard] = useState<Nootype | null>(null);
  // Which card was selected (briefly shown as "selected" before exit)
  const [selectedCard, setSelectedCard] = useState<Nootype | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelect = useCallback(
    (value: Nootype) => {
      if (selectedCard) return; // Prevent double-tap
      setSelectedCard(value);

      // Brief "selected" glow, then animate out
      setTimeout(() => {
        setNootype(value);
        setIsExiting(true);
      }, 380);
    },
    [selectedCard, setNootype],
  );

  // Don't render:
  //   1. On the server (SSR guard via `mounted`).
  //   2. While Convex is loading — prevents full-screen backdrop blocking UI.
  //   3. Once the guest has already onboarded.
  if (!mounted || isLoading || hasOnboarded) return null;

  return (
    <>
      {/* ── Global keyframe animations ── */}
      <style>{`
        @keyframes nootype-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes nootype-panel-in {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes nootype-card-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes nootype-exit {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(0.96); }
        }
        @keyframes nootype-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .nootype-card-0 { animation: nootype-card-in 0.5s cubic-bezier(0.22,1,0.36,1) 0.25s both; }
        .nootype-card-1 { animation: nootype-card-in 0.5s cubic-bezier(0.22,1,0.36,1) 0.33s both; }
        .nootype-card-2 { animation: nootype-card-in 0.5s cubic-bezier(0.22,1,0.36,1) 0.41s both; }
        .nootype-card-3 { animation: nootype-card-in 0.5s cubic-bezier(0.22,1,0.36,1) 0.49s both; }
      `}</style>

      {/* ── Backdrop ── */}
      <div
        aria-modal="true"
        role="dialog"
        aria-label="Select your dining style"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          backgroundColor: "rgba(0,0,0,0.88)",
          backdropFilter: "blur(18px) saturate(140%)",
          WebkitBackdropFilter: "blur(18px) saturate(140%)",
          animation: isExiting
            ? "nootype-exit 0.45s cubic-bezier(0.32,0,0.67,0) forwards"
            : "nootype-backdrop-in 0.4s ease forwards",
        }}
      >
        {/* ── Panel ── */}
        <div
          style={{
            width: "100%",
            maxWidth: "720px",
            maxHeight: "90dvh",
            overflowY: "auto",
            background:
              "linear-gradient(160deg, rgba(18,18,18,0.98) 0%, rgba(10,10,10,0.99) 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            boxShadow:
              "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04) inset",
            padding: "clamp(24px, 5vw, 40px)",
            animation: isExiting
              ? "none"
              : "nootype-panel-in 0.55s cubic-bezier(0.22,1,0.36,1) 0.05s both",
            scrollbarWidth: "none",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1
              style={{
                fontSize: "clamp(22px, 5vw, 30px)",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                color: "#f4f4f5",
                lineHeight: 1.15,
                margin: "0 0 10px",
              }}
            >
              How would you like to experience
              <br />
              <span
                style={{
                  color: "#ffffff",
                }}
              >
                our menu today?
              </span>
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "rgba(161,161,170,0.75)",
                lineHeight: 1.6,
                maxWidth: "420px",
                margin: "0 auto",
              }}
            >
              Your choice shapes how our AI concierge guides you. You can
              always update this in preferences.
            </p>
          </div>

          {/* Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "12px",
            }}
          >
            {NOOTYPE_CARDS.map((card, idx) => {
              const isHovered  = hoveredCard  === card.value;
              const isSelected = selectedCard === card.value;

              return (
                <button
                  key={card.value}
                  id={`nootype-card-${card.value}`}
                  className={`nootype-card-${idx}`}
                  onClick={() => handleSelect(card.value)}
                  onMouseEnter={() => setHoveredCard(card.value)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    all: "unset",
                    display: "block",
                    cursor: "pointer",
                    padding: "20px",
                    borderRadius: "14px",
                    border: `1px solid ${
                      isSelected
                        ? card.accentColor
                        : isHovered
                        ? `${card.accentColor}66`
                        : "rgba(255,255,255,0.07)"
                    }`,
                    background: isSelected
                      ? `linear-gradient(135deg, ${card.glowColor}, rgba(10,10,10,0.8))`
                      : isHovered
                      ? `linear-gradient(135deg, ${card.glowColor.replace("0.25", "0.12")}, rgba(10,10,10,0.9))`
                      : "rgba(255,255,255,0.025)",
                    boxShadow: isSelected
                      ? `0 0 0 1px ${card.accentColor}55, 0 12px 40px ${card.glowColor}`
                      : isHovered
                      ? `0 8px 28px ${card.glowColor}`
                      : "none",
                    transform: isSelected
                      ? "scale(1.02)"
                      : isHovered
                      ? "translateY(-2px)"
                      : "translateY(0)",
                    transition:
                      "border 0.2s ease, background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
                    textAlign: "left",
                  }}
                >
                  {/* Icon + label row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      marginBottom: "10px",
                    }}
                  >
                    {/* Icon badge */}
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        minWidth: "40px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        border: `1px solid ${card.accentColor}44`,
                        background: `${card.glowColor}`,
                        transition: "transform 0.2s ease",
                        transform: isHovered || isSelected ? "scale(1.08)" : "scale(1)",
                      }}
                    >
                      {card.icon}
                    </div>

                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: 800,
                          color: isHovered || isSelected ? "#f4f4f5" : "#d4d4d8",
                          letterSpacing: "-0.02em",
                          lineHeight: 1.2,
                          margin: "0 0 3px",
                          transition: "color 0.2s ease",
                        }}
                      >
                        {card.label}
                      </p>
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: card.accentColor,
                          opacity: isHovered || isSelected ? 1 : 0.7,
                          margin: 0,
                          transition: "opacity 0.2s ease",
                        }}
                      >
                        {card.tagline}
                      </p>
                    </div>

                    {/* Selection indicator */}
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        minWidth: "18px",
                        borderRadius: "50%",
                        border: `1.5px solid ${
                          isSelected ? card.accentColor : "rgba(255,255,255,0.15)"
                        }`,
                        background: isSelected ? card.accentColor : "transparent",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isSelected && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path
                            d="M1 3.5L3.5 6L8 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Description removed for cleaner UI */}
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <p
            style={{
              textAlign: "center",
              fontSize: "10px",
              color: "rgba(113,113,122,0.6)",
              marginTop: "24px",
              letterSpacing: "0.04em",
            }}
          >
            Guest:{" "}
            <code style={{ fontFamily: "monospace", opacity: 0.5 }}>
              {sessionId ? sessionId.slice(0, 8) + "…" : "—"}
            </code>
            &nbsp;·&nbsp;Preference synced to your device · No account required
          </p>
        </div>
      </div>
    </>
  );
}
