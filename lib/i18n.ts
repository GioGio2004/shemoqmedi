export const LOCALES = ["ka", "en", "ru"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ka";

export const LOCALE_LABELS: Record<Locale, string> = {
  ka: "ქარ",
  en: "Eng",
  ru: "Рус",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
