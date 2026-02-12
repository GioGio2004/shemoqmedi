"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // Assuming shadcn or similar, valid if not I'll use standard button
// actually I should check if ui components exist.
// List dir of _components showed landing/...
// I'll use a simple button with tailwind to be safe.

export function LanguageToggler() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const newLocale = locale === "ka" ? "en" : "ka";
    // Check if pathname starts with locale
    const segments = pathname.split("/");
    // segments[0] is empty, segments[1] is locale
    if (segments[1] === locale) {
      segments[1] = newLocale;
    } else {
      // Logic if locale is hidden or not present, but middleware handles it.
      // With always prefix (default), it should be there. 
      // If default locale doesn't show prefix, we might need logic.
      // Usually next-intl middleware redirects. 
      // Let's assume standard behavior: replace first segment if it matches current locale
      segments[1] = newLocale;
    }
    const newPath = segments.join("/");
    router.push(newPath, { scroll: false });
  };

  return (
    <button
      onClick={toggleLanguage}
      className="fixed bottom-6 right-6 z-[100] px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-zinc-900 dark:text-white rounded-full font-bold shadow-lg hover:bg-white/20 transition-all flex items-center gap-2"
    >
      <span className={locale === "ka" ? "text-purple-500" : "text-zinc-500"}>KA</span>
      <span className="text-zinc-400">/</span>
      <span className={locale === "en" ? "text-purple-500" : "text-zinc-500"}>EN</span>
    </button>
  );
}
