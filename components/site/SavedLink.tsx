"use client";

import Link from "next/link";
import { useSaved } from "@/lib/saved";
import { cn } from "@/lib/utils";

/** Header heart with the saved count; hidden until something is saved. */
export function SavedLink({ className }: { className?: string }) {
  const count = useSaved().length;
  if (count === 0) return null;
  return (
    <Link
      href="/saved"
      aria-label={`Saved sites (${count})`}
      className={cn(
        "relative grid size-11 place-items-center rounded-full border border-black/12 bg-white text-[#FF4D00] transition-colors hover:border-black",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px]">
        <path
          d="M12 20.5s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.8c0 5.5-7.5 10.1-7.5 10.1Z"
          fill="currentColor"
        />
      </svg>
      <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-black px-1 font-mono text-[10px] font-semibold text-white tabular-nums">
        {count}
      </span>
    </Link>
  );
}
