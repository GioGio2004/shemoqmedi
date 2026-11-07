import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Wordmark. Gold is reserved for the logo and used nowhere else.
 * Placeholder typography until the real mark is designed.
 */
export function Logo({
  locale,
  className,
}: {
  locale: string;
  className?: string;
}) {
  return (
    <Link
      href={`/${locale}`}
      aria-label="shemoqmedi, home"
      className={cn(
        "text-xl font-semibold tracking-[-0.04em] text-gold lowercase",
        className,
      )}
    >
      shemoqmedi
    </Link>
  );
}
