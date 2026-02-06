"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleSelect = (nextLocale: string) => {
    startTransition(() => {
      // Replaces the first segment of the path (e.g., /en/beauty -> /ka/beauty)
      const segments = pathname.split("/");
      // Handle case where path might start with / or be empty
      if (segments.length > 1) {
        segments[1] = nextLocale;
      } else {
        segments.unshift("", nextLocale);
      }
      const nextUrl = segments.join("/");
      router.replace(nextUrl);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-[#8B5E3C]/10 text-[#2C1A0E] transition-colors"
          disabled={isPending}
        >
          <Globe className="h-5 w-5" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#FAF6F1] border-[#D4C5B2]">
        <DropdownMenuItem
          onClick={() => handleSelect("en")}
          className={`cursor-pointer ${locale === "en" ? "font-bold text-[#8B5E3C]" : "text-[#5C4A3A]"}`}
        >
          🇬🇧 English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSelect("ka")}
          className={`cursor-pointer ${locale === "ka" ? "font-bold text-[#8B5E3C]" : "text-[#5C4A3A]"}`}
        >
          🇬🇪 ქართული
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}