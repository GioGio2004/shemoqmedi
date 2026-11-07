import Image from "next/image";
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
  className,
  children,
}: {
  href: string;
  variant?: "solid" | "outline";
  external?: boolean;
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
      <a href={href} target="_blank" rel="noopener" className={classes}>
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

/** Stacked wordmark, Kencho-style. Placeholder until the real mark exists. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="shemoqmedi, home"
      className={cn("flex items-center gap-3 text-black", className)}
    >
      <Image src="/brand/crow.png" alt="" width={179} height={200} className="h-auto w-[34px]" />
      <span className="flex flex-col leading-none">
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
