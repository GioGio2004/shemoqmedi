import { cn } from "@/lib/utils";

/**
 * A juror's Clerk profile photo, or a grey placeholder when they have none.
 * Plain <img>: Clerk serves the image already sized and cached.
 */
export function JurorAvatar({
  url,
  size = 48,
  className,
}: {
  url: string | null;
  size?: number;
  className?: string;
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Clerk-hosted avatar
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        className={cn("shrink-0 rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cn("grid shrink-0 place-items-center rounded-full bg-black/10 text-black/35", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.5} height={size * 0.5} fill="currentColor">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6z" />
      </svg>
    </span>
  );
}
