import { cn } from "@/lib/utils";

/**
 * An ImageKit photo resized and cropped by ImageKit to `px` square (preset
 * juror photos are full-size uploads: one was 838 KB for a 48 px circle,
 * audit F-04). Other hosts (Clerk) are returned as they are.
 */
export function sizedAvatarUrl(url: string, px: number) {
  try {
    const u = new URL(url);
    if (u.hostname !== "ik.imagekit.io" || u.searchParams.has("tr")) return url;
    u.searchParams.set("tr", `w-${px},h-${px},fo-auto`);
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * A juror's profile photo (Clerk, or a preset uploaded to ImageKit), or a
 * grey placeholder when they have none. Plain <img>: both hosts resize it.
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
      // eslint-disable-next-line @next/next/no-img-element -- Clerk/ImageKit resize it themselves
      <img
        src={sizedAvatarUrl(url, size * 2)}
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
