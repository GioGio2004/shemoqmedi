import { JURY_CATEGORIES, type JuryCategory } from "@/lib/taxonomy";

/** Only http(s) links are rendered; anything else (javascript:, data:) is dropped. */
export function safeUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** "Design & UI"; jurors without a panel are just "Jury". */
export function panelName(category: JuryCategory | null) {
  return JURY_CATEGORIES.find((c) => c.slug === category)?.name ?? "Jury";
}
