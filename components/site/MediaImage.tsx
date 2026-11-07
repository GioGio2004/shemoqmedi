"use client";

import Image, { type ImageProps } from "next/image";
import { imageKitResizes, imagekitLoader, isImageKit } from "@/lib/imageLoader";

/**
 * next/image for listing media. Every file, ImageKit uploads included, goes
 * through Next's optimiser, so Vercel's image cache answers repeat views and
 * ImageKit is only fetched on a cache miss. With NEXT_PUBLIC_IMAGE_CDN=imagekit,
 * ImageKit files are resized by ImageKit instead (lib/imageLoader.ts). A client
 * component so server pages can use it (a loader function cannot be passed
 * from the server).
 */
export function MediaImage(props: ImageProps) {
  const { alt, ...rest } = props;
  const loader = imageKitResizes && isImageKit(rest.src) ? imagekitLoader : rest.loader;
  return <Image {...rest} alt={alt} loader={loader} />;
}
