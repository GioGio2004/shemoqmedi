"use client";

// Root-layout error boundary (catches errors thrown by the locale layout
// itself). Must render its own <html>/<body>.

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          background: "#0A0A0A",
          color: "#F4F3F0",
          fontFamily: "monospace",
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
            background: "#D8FF3A",
            color: "#0A0A0A",
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
      </body>
    </html>
  );
}
