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

interface Props {
  message: string | null | undefined;
}

export function StorefrontAlertBanner({ message }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const prevMsg = useRef<string | null>(null);

  // If the server pushes a NEW message, un-dismiss so it shows again
  useEffect(() => {
    if (message && message !== prevMsg.current) {
      setDismissed(false);
    }
    prevMsg.current = message ?? null;
  }, [message]);

  if (!message || dismissed) return null;

  return (
    <>
      {/* ── Backdrop ───────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={() => setDismissed(true)}
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
        {/* Glass card surface */}
        <div
          style={{
            position: "relative",
            borderRadius: "20px",
            padding: "32px 32px 28px",
            background: "rgba(28, 25, 23, 0.92)",
            border: "1px solid rgba(255, 255, 255, 0.10)",
            boxShadow:
              "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          {/* ── Close button ───────────────────────────────────────────────── */}
          <button
            onClick={() => setDismissed(true)}
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
              border: "none",
              background: "rgba(255,255,255,0.07)",
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
                borderRadius: "12px",
                background: "rgba(255,255,255,0.07)",
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
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.35)",
                }}
              >
                Announcement
              </p>
            </div>
          </div>

          {/* ── Divider ────────────────────────────────────────────────────── */}
          <div
            style={{
              height: "1px",
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)",
              marginBottom: "18px",
            }}
          />

          {/* ── Message ────────────────────────────────────────────────────── */}
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
            {message}
          </p>

          {/* ── Dismiss text button ────────────────────────────────────────── */}
          <button
            onClick={() => setDismissed(true)}
            style={{
              marginTop: "22px",
              display: "block",
              width: "100%",
              padding: "11px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.55)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              letterSpacing: "0.02em",
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
