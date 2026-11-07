"use client";

// Root-layout error boundary (errors thrown by app/layout.tsx itself).
// Must render its own <html>/<body>.

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
          gap: 16,
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Something broke.</h1>
        <button type="button" onClick={reset} style={{ padding: "8px 16px" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
