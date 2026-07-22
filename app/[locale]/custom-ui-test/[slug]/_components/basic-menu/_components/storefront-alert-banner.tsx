"use client";

/**
 * StorefrontAlertBanner
 * ──────────────────────────────────────────────────────────────────────────────
 * Centered modal popup driven by `organization.storefrontAlert` from Convex.
 * Appears automatically when the field is set, disappears when cleared server-
 * side or when the customer manually dismisses it with the ✕ button.
 *
 * Design: friendly warm-neutral glass card with subtle backdrop blur.
 * No aggressive yellow — calm, premium, informational.
 */

import { useEffect, useRef, useState } from "react";

interface Announcement {
  id: string;
  message: string;
  isActive: boolean;
}

interface Props {
  announcements?: Announcement[];
  legacyMessage?: string | null;
}

export function StorefrontAlertBanner({ announcements, legacyMessage }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const prevSignature = useRef<string>("");

  // Determine active announcements
  let activeMessages: string[] = [];
  if (announcements && announcements.length > 0) {
    activeMessages = announcements.filter(a => a.isActive).map(a => a.message);
  } else if (legacyMessage) {
    activeMessages = [legacyMessage];
  }

  const currentSignature = activeMessages.join("|||");

  // If the server pushes a NEW set of messages, un-dismiss so they show again
  useEffect(() => {
    if (currentSignature && currentSignature !== prevSignature.current) {
      setDismissed(false);
    }
    prevSignature.current = currentSignature;
  }, [currentSignature]);

  if (activeMessages.length === 0 || dismissed) return null;

  return (
    <>
      {/* ── Backdrop ───────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={(e) => {
          e.stopPropagation();
          setDismissed(true);
        }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          animation: "alertFadeIn 0.25s ease both",
        }}
      />

      {/* ── Modal card ─────────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Restaurant announcement"
        aria-live="polite"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          width: "min(480px, calc(100vw - 40px))",
          animation: "alertScaleIn 0.32s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        {/* RULED card surface — raised dark, 1px hairline, 2px radius */}
        <div
          style={{
            position: "relative",
            borderRadius: "2px",
            padding: "32px 32px 28px",
            background: "rgba(17, 17, 16, 0.97)",
            border: "1px solid rgba(244, 243, 240, 0.14)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          }}
        >
          {/* ── Close button ───────────────────────────────────────────────── */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
            }}
            aria-label="Dismiss announcement"
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "1px solid rgba(244,243,240,0.14)",
              background: "transparent",
              color: "rgba(255,255,255,0.45)",
              cursor: "pointer",
              transition: "background 0.2s, color 0.2s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.14)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "rgba(255,255,255,0.85)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.07)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "rgba(255,255,255,0.45)";
            }}
          >
            {/* ✕ icon */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="2" y1="2" x2="12" y2="12" />
              <line x1="12" y1="2" x2="2" y2="12" />
            </svg>
          </button>

          {/* ── Icon + header row ──────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            {/* Soft bell icon */}
            <div
              style={{
                flexShrink: 0,
                width: "40px",
                height: "40px",
                borderRadius: "2px",
                border: "1px solid rgba(244,243,240,0.14)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.70)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>

            <div>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--v-font-mono, ui-monospace, monospace)",
                  fontSize: "10px",
                  fontWeight: 400,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(244,243,240,0.34)",
                }}
              >
                Announcement — Live
              </p>
            </div>
          </div>

          {/* ── Divider — flat 1px hairline ────────────────────────────────── */}
          <div
            style={{
              height: "1px",
              background: "rgba(244,243,240,0.14)",
              marginBottom: "18px",
            }}
          />

          {/* ── Messages — mono-indexed rows with hairline separators ──────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {activeMessages.map((msg, idx) => (
              <div key={idx} style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                paddingBottom: idx !== activeMessages.length - 1 ? "12px" : "0",
                borderBottom: idx !== activeMessages.length - 1 ? "1px solid rgba(244,243,240,0.14)" : "none",
              }}>
                <span style={{
                  fontFamily: "var(--v-font-mono, ui-monospace, monospace)",
                  color: "rgba(244,243,240,0.34)",
                  fontSize: "10px",
                  letterSpacing: "0.08em",
                  marginTop: "5px"
                }}>{String(idx + 1).padStart(2, "0")}</span>
                <p
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    fontWeight: 450,
                    color: "rgba(255,255,255,0.88)",
                    lineHeight: 1.65,
                    letterSpacing: "0.01em",
                  }}
                >
                  {msg}
                </p>
              </div>
            ))}
          </div>

          {/* ── Dismiss text button ────────────────────────────────────────── */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
            }}
            style={{
              marginTop: "22px",
              display: "block",
              width: "100%",
              padding: "11px",
              borderRadius: "2px",
              border: "1px solid rgba(244,243,240,0.14)",
              background: "transparent",
              color: "rgba(255,255,255,0.55)",
              fontFamily: "var(--v-font-mono, ui-monospace, monospace)",
              fontSize: "11px",
              fontWeight: 400,
              cursor: "pointer",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              transition: "background 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.11)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "rgba(255,255,255,0.80)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "rgba(255,255,255,0.55)";
            }}
          >
            Got it
          </button>
        </div>
      </div>

      <style>{`
        @keyframes alertFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes alertScaleIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}
