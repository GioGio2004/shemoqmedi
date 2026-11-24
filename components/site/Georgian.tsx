import { Noto_Sans_Georgian } from "next/font/google";

// Inter has no Georgian glyphs: Latin text (site titles, names) stays in Inter
// and Georgian falls through to Noto Sans Georgian.
const georgian = Noto_Sans_Georgian({
  subsets: ["georgian"],
  weight: "variable",
  display: "swap",
  variable: "--font-georgian",
});

/** Wraps a Georgian page: lang="ka" (the root <html> stays "en") and the Georgian font. */
export function GeorgianRoot({ children }: { children: React.ReactNode }) {
  return (
    <div
      lang="ka"
      className={georgian.variable}
      style={{ fontFamily: "var(--font-inter), var(--font-georgian), ui-sans-serif, system-ui, sans-serif" }}
    >
      {children}
    </div>
  );
}
