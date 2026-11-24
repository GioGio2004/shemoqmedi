"use client";

import Link from "next/link";
import { toggleSaved, useSaved } from "@/lib/saved";
import { cn } from "@/lib/utils";

function Heart({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M12 20.5s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.8c0 5.5-7.5 10.1-7.5 10.1Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Round heart on a card's screenshot (top right). */
export function SaveIcon({ slug, title, className }: { slug: string; title: string; className?: string }) {
  const saved = useSaved().includes(slug);
  return (
    <button
      type="button"
      onClick={() => toggleSaved(slug)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved sites` : `Save ${title}`}
      title={saved ? "Saved" : "Save for later"}
      className={cn(
        "grid size-9 place-items-center rounded-full bg-white/90 text-black backdrop-blur transition-[opacity,transform] duration-200 hover:scale-105",
        // Saved hearts always show; empty ones appear on hover or focus (always on touch screens).
        saved ? "text-[#FF4D00] opacity-100" : "opacity-100 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 focus-visible:opacity-100",
        className,
      )}
    >
      <Heart filled={saved} className="size-[18px]" />
    </button>
  );
}

/** Pill on a listing page, beside "Visit live site"; once saved it links to the list. */
export function SavePill({ slug, title }: { slug: string; title: string }) {
  const saved = useSaved().includes(slug);
  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => toggleSaved(slug)}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${title} from saved sites` : `Save ${title} for later`}
        className={cn(
          "inline-flex min-h-[46px] items-center gap-2.5 rounded-full border px-5 text-[11.5px] font-semibold tracking-[0.05em] uppercase transition-colors",
          saved ? "border-black bg-black text-white" : "border-black/15 bg-white text-black hover:border-black",
        )}
      >
        <Heart filled={saved} className={cn("size-4", saved && "text-[#FF4D00]")} />
        {saved ? "Saved" : "Save for later"}
      </button>
      {saved && (
        <Link href="/saved" className="text-sm underline decoration-black/25 underline-offset-4 hover:decoration-black">
          Your saved sites
        </Link>
      )}
    </span>
  );
}
