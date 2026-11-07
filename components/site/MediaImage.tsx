"use client";

import Image, { type ImageProps } from "next/image";
import { imagekitLoader, isImageKit } from "@/lib/imageLoader";

/**
 * next/image for listing media. ImageKit files are resized by ImageKit's CDN
 * (lib/imageLoader.ts); older Convex files and everything else go through
 * Next's optimiser as usual. A client component so server pages can use it
 * (a loader function cannot be passed from the server).
 */
export function MediaImage(props: ImageProps) {
  const { alt, ...rest } = props;
  return <Image {...rest} alt={alt} loader={isImageKit(rest.src) ? imagekitLoader : rest.loader} />;
}
