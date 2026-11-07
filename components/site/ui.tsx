import Link from "next/link";
import { cn } from "@/lib/utils";

// Small server-only building blocks shared by the landing sections.

const buttonBase =
  "inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

export function ButtonLink({
  href,
  variant = "solid",
  className,
  children,
}: {
  href: string;
  variant?: "solid" | "outline";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        buttonBase,
        variant === "solid"
          ? "bg-beige-deep text-ink hover:bg-line"
          : "border border-line bg-paper text-ink hover:bg-beige",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function SectionHeader({
  id,
  label,
  title,
  action,
}: {
  id?: string;
  label: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-t border-line pt-6 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-3">
        <p className="label">{label}</p>
        <h2
          id={id}
          className="text-3xl font-semibold tracking-[-0.035em] md:text-5xl"
        >
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function ArrowLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 text-sm font-medium underline decoration-line underline-offset-4 hover:decoration-ink"
    >
      {children}
      <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}
