import Image from "next/image";
import { NavCrow } from "./NavCrow";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Server-only building blocks in the Kencho style: uppercase pill buttons,
// the round arrow badge, the stacked wordmark.

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className={cn("size-[18px]", className)}
    >
      <path
        d="M5 15 15 5M5 5h10v10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const pillBase =
  "group inline-flex min-h-[46px] items-center justify-between gap-3.5 rounded-full py-1 pr-1.5 pl-5 text-[11.5px] font-semibold tracking-[0.05em] uppercase transition-[transform,background-color,color] duration-200 active:scale-[0.98]";

/** Kencho's signature pill: label + round arrow badge. */
export function PillLink({
  href,
  variant = "solid",
  external,
  rel = "noopener",
  className,
  children,
}: {
  href: string;
  variant?: "solid" | "outline";
  external?: boolean;
  /** External links only; pass "nofollow noopener" for unclaimed listings. */
  rel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const classes = cn(
    pillBase,
    variant === "solid"
      ? "bg-black text-white hover:-translate-y-px"
      : "border border-black/12 bg-white text-black hover:border-black",
    className,
  );
  const badge = (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
        variant === "solid" ? "bg-white text-black" : "bg-black text-white",
      )}
    >
      <ArrowIcon />
    </span>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel={rel} className={classes}>
        <span>{children}</span>
        {badge}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      <span>{children}</span>
      {badge}
    </Link>
  );
}

/**
 * Stacked wordmark, Kencho-style. `live` (the site header only) turns the
 * crow mark into the live crow (NavCrow). When the crow flies off, the name
 * slides over into its spot; just before it comes back, the name slides
 * aside again to make room. Elsewhere (sign-in, 404) the mark stays still.
 */
export function Wordmark({ className, live = false }: { className?: string; live?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="shemoqmedi, home"
      data-crow={live ? "home" : undefined}
      className={cn("flex items-center gap-3 text-black [--crow-slot:50px] min-[360px]:[--crow-slot:68px]", className)}
    >
      {live ? (
        <NavCrow />
      ) : (
        <Image src="/brand/crow.png" alt="" width={34} height={38} sizes="34px" loading="eager" className="h-auto w-[34px]" />
      )}
      <span
        className={cn(
          "crow-name flex flex-col leading-none",
          live &&
            "transition-transform duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)] [[data-crow=away]>&]:translate-x-[calc(-1*var(--crow-slot)-0.75rem)]",
        )}
      >
        <span className="text-[18px] font-bold tracking-[-0.055em] uppercase">Shemoqmedi</span>
        <span className="mt-[5px] text-[9px] font-semibold tracking-[0.27em] uppercase">Space</span>
      </span>
    </Link>
  );
}

/** Small rounded tag, used for categories and technologies. */
export function Tag({
  href,
  active,
  children,
}: {
  href?: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  const classes = cn(
    "inline-flex h-8 items-center rounded-full border px-3.5 text-[11px] font-medium tracking-[0.04em] uppercase transition-colors",
    active
      ? "border-black bg-black text-white"
      : "border-black/12 text-black hover:border-black",
  );
  return href ? (
    <Link href={href} className={classes} aria-current={active ? "page" : undefined}>
      {children}
    </Link>
  ) : (
    <span className={classes}>{children}</span>
  );
}
