import { defaultAvatarUrl } from "@/lib/defaultAvatar";
import { cn } from "@/lib/utils";

/** An ImageKit photo cropped by ImageKit to w×h around the face; other hosts as they are. */
function sizedPhotoUrl(url: string, w: number, h: number) {
  try {
    const u = new URL(url);
    if (u.hostname !== "ik.imagekit.io" || u.searchParams.has("tr")) return url;
    u.searchParams.set("tr", `w-${w},h-${h},fo-face`);
    return u.toString();
  } catch {
    return url;
  }
}

/** "Beka Shengelia" → "BS". */
function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/**
 * A juror's portrait for the directory and profile pages: fills its box
 * (set the aspect ratio with className), black and white until hovered so a
 * panel of mixed photos reads as one set. No photo: their initials on grey,
 * or, with `fallbackKey`, their default avatar with the initials in a corner.
 */
export function JurorPhoto({
  url,
  name,
  alt = "",
  width,
  height,
  mono = true,
  priority,
  fallbackKey,
  fallbackAvatar,
  fallbackInitials = true,
  className,
}: {
  url: string | null;
  name: string;
  /** No photo: show the default avatar picked from this stable key (a creator's slug). */
  fallbackKey?: string;
  /** The avatar they picked ("01"…"24"), used instead of the one picked from the key. */
  fallbackAvatar?: string | null;
  /** The initials chip over the default avatar. Turn off where the box is small. */
  fallbackInitials?: boolean;
  /** Empty (decorative) where the name is printed beside the photo. */
  alt?: string;
  /** Rendered size in CSS px; the image is fetched at twice that. */
  width: number;
  height: number;
  /** Greyscale, with colour on hover of the nearest `group`. */
  mono?: boolean;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-black/[0.06]", className)}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- Clerk/ImageKit resize it themselves
        <img
          src={sizedPhotoUrl(url, width * 2, height * 2)}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          className={cn(
            "absolute inset-0 size-full object-cover transition-[filter,transform] duration-500",
            mono && "grayscale group-hover:grayscale-0",
          )}
        />
      ) : fallbackKey ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- a 1 KB SVG from /public */}
          <img
            src={defaultAvatarUrl(fallbackKey, fallbackAvatar)}
            alt=""
            width={width}
            height={height}
            loading={priority ? "eager" : "lazy"}
            className="absolute inset-0 size-full object-cover"
          />
          {fallbackInitials && (
            <span
              aria-hidden="true"
              className="absolute bottom-3 left-3 rounded-md bg-black/75 px-2 py-1 text-xs leading-none font-semibold tracking-[0.04em] text-white"
            >
              {initials(name)}
            </span>
          )}
        </>
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center text-[clamp(1.5rem,5vw,3.5rem)] font-semibold tracking-[-0.06em] text-black/25"
        >
          {initials(name)}
        </span>
      )}
    </div>
  );
}
