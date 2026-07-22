"use client";

// Route error boundary. Without this file Next dev falls back to
// "missing required error components, refreshing..." and HARD-RELOADS the
// page on any runtime error — which read as "the app reloads itself".
// Styled with the RULED tokens from globals.css.

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        background: "var(--v-bg, #0A0A0A)",
        color: "var(--v-ink, #F4F3F0)",
        fontFamily: "var(--v-font-mono, monospace)",
        letterSpacing: ".06em",
        textTransform: "uppercase",
        textAlign: "center",
        padding: 24,
      }}
    >
      <span style={{ fontSize: 12, opacity: 0.5 }}>( ERROR )</span>
      <h1 style={{ fontSize: 18, fontWeight: 500 }}>Something broke.</h1>
      <button
        type="button"
        onClick={reset}
        style={{
          cursor: "pointer",
          background: "var(--v-accent, #D8FF3A)",
          color: "var(--v-accent-ink, #0A0A0A)",
          border: 0,
          padding: "12px 20px",
          fontFamily: "inherit",
          letterSpacing: "inherit",
          textTransform: "inherit",
          fontSize: 12,
        }}
      >
        Try again
      </button>
    </main>
  );
}
