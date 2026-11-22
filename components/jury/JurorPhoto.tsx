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
 * panel of mixed photos reads as one set. No photo: their initials on grey.
 */
export function JurorPhoto({
  url,
  name,
  width,
  height,
  mono = true,
  priority,
  className,
}: {
  url: string | null;
  name: string;
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
          alt=""
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          className={cn(
            "absolute inset-0 size-full object-cover transition-[filter,transform] duration-500",
            mono && "grayscale group-hover:grayscale-0",
          )}
        />
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
