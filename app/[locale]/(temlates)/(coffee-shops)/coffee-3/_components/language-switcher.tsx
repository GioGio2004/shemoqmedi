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
          className="text-zinc-100 hover:text-orange-500 hover:bg-white/5 transition-colors"
          disabled={isPending}
        >
          <Globe className="h-5 w-5" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 text-zinc-100">
        <DropdownMenuItem
          onClick={() => handleSelect("en")}
          className={`cursor-pointer hover:bg-white/10 hover:text-orange-500 focus:bg-white/10 focus:text-orange-500 ${locale === "en" ? "font-bold text-orange-500" : ""}`}
        >
          🇬🇧 English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSelect("ka")}
          className={`cursor-pointer hover:bg-white/10 hover:text-orange-500 focus:bg-white/10 focus:text-orange-500 ${locale === "ka" ? "font-bold text-orange-500" : ""}`}
        >
          🇬🇪 ქართული
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
