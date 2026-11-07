import type { ImageLoaderProps } from "next/image";

/** True for files on our ImageKit account (new uploads). */
export function isImageKit(src: unknown): src is string {
  return typeof src === "string" && src.startsWith("https://ik.imagekit.io/");
}

/**
 * next/image loader for ImageKit files: ImageKit's CDN resizes and
 * re-encodes at the exact width the page asks for (f-auto = AVIF or WebP,
 * whichever the browser takes), so these cost no Vercel image optimisation.
 * Used through components/site/MediaImage.tsx; other images keep Next's own
 * optimiser (a global custom loader would switch that route off).
 */
export function imagekitLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src);
  url.searchParams.set("tr", `w-${width},q-${quality ?? 80},f-auto`);
  return url.toString();
}
