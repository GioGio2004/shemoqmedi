import type { ImageLoaderProps } from "next/image";

/** True for files on our ImageKit account (new uploads). */
export function isImageKit(src: unknown): src is string {
  return typeof src === "string" && src.startsWith("https://ik.imagekit.io/");
}

/**
 * Who resizes ImageKit files. Default: Next's optimiser, so Vercel's image
 * cache sits in front of ImageKit and ImageKit is only fetched on a cache
 * miss (once per size per month, see images.minimumCacheTTL in
 * next.config.ts), which keeps ImageKit's free bandwidth for uploads.
 * NEXT_PUBLIC_IMAGE_CDN=imagekit switches to ImageKit's own resizing: no
 * Vercel image transformations, but every view is served by ImageKit.
 */
export const imageKitResizes = process.env.NEXT_PUBLIC_IMAGE_CDN === "imagekit";

/**
 * next/image loader for ImageKit files: ImageKit's CDN resizes and
 * re-encodes at the exact width the page asks for (f-auto = AVIF or WebP,
 * whichever the browser takes). Opt-in only (imageKitResizes), applied per
 * image by components/site/MediaImage.tsx; a global custom loader would
 * switch Next's optimiser off for every other image.
 */
export function imagekitLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src);
  url.searchParams.set("tr", `w-${width},q-${quality ?? 80},f-auto`);
  return url.toString();
}

/**
 * Resized image URL for places next/image cannot render, such as a
 * <video poster>. Goes through the same path as MediaImage (cached optimiser
 * by default, ImageKit with imageKitResizes). `width` must be one of
 * images.deviceSizes or images.imageSizes and `quality` one of
 * images.qualities in next.config.ts, or /_next/image answers 400.
 */
export function optimizedImageUrl(src: string, width: number, quality = 75) {
  if (imageKitResizes && isImageKit(src)) return imagekitLoader({ src, width, quality });
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}
