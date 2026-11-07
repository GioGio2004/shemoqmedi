"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowIcon } from "@/components/site/ui";
import { cn } from "@/lib/utils";

type Shot = { src: string; alt: string };

const pad = (n: number) => String(n).padStart(2, "0");

/** Lock the page behind the popup while it is open. */
function lockPage(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

/**
 * Listing screenshots: the cover full width, the rest in a two-column grid.
 * Clicking any of them opens it in a popup inside the page (a native
 * <dialog>, so focus, Esc and the top layer come for free) instead of a new
 * tab. The popup shows the whole screenshot: a 16:9 one fits the screen, a
 * full-page one spans the width and scrolls. Arrows / ← → step through,
 * Esc / Close / a click on the white space closes.
 */
export function ScreenshotGallery({ title, shots }: { title: string; shots: Shot[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  // Height ÷ width of the open screenshot once loaded (null until then).
  const [ratio, setRatio] = useState<number | null>(null);
  const tall = ratio !== null && ratio > 0.75;
  const count = shots.length;

  const open = (i: number) => {
    setRatio(null);
    setIndex(i);
    lockPage(true);
    dialogRef.current?.showModal();
  };
  const close = useCallback(() => {
    lockPage(false);
    dialogRef.current?.close();
  }, []);
  const step = useCallback(
    (delta: number) => {
      setRatio(null);
      setIndex((i) => (i === null ? i : (i + delta + count) % count));
    },
    [count],
  );

  // Each screenshot starts at its top; never leave the page locked on unmount.
  useEffect(() => {
    if (index !== null) scrollRef.current?.scrollTo({ top: 0 });
  }, [index]);
  useEffect(() => () => lockPage(false), []);

  if (count === 0) return null;
  const [cover, ...rest] = shots;
  const current = index === null ? null : shots[index];

  return (
    <>
      <button
        type="button"
        onClick={() => open(0)}
        aria-label={`View ${cover.alt}`}
        className="relative block aspect-video w-full cursor-zoom-in overflow-hidden rounded-3xl border border-black/8"
      >
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1100px"
          className="object-cover object-top"
        />
      </button>

      {rest.length > 0 && (
        <ul className="mt-6 grid gap-6 md:grid-cols-2">
          {rest.map((shot, i) => (
            <li key={shot.src}>
              <button
                type="button"
                onClick={() => open(i + 1)}
                aria-label={`View ${shot.alt}`}
                className="relative block aspect-video w-full cursor-zoom-in overflow-hidden rounded-3xl border border-black/8"
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 680px"
                  className="object-cover object-top"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        aria-label={`${title} screenshots`}
        onClose={() => {
          lockPage(false);
          setIndex(null);
        }}
        onKeyDown={(e) => {
          if (count < 2) return;
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-white/95 p-0 text-black backdrop:bg-transparent supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur-xl"
      >
        {current && (
          <div className="flex h-full flex-col">
            <div className="container-site flex h-20 shrink-0 items-center justify-between gap-4">
              <p className="min-w-0 truncate text-sm">
                <span className="mr-3 font-mono text-[11px] tracking-[0.08em] text-black/55">
                  {pad(index! + 1)}/{pad(count)}
                </span>
                <span className="font-semibold">{title}</span>
              </p>
              <button
                type="button"
                onClick={close}
                autoFocus
                className="flex min-h-[46px] items-center gap-4 rounded-full border border-black/12 bg-white py-1 pr-1.5 pl-5 text-[11.5px] font-semibold tracking-[0.05em] uppercase hover:border-black"
              >
                Close
                <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-black text-lg leading-none text-white">
                  ×
                </span>
              </button>
            </div>

            <div
              ref={scrollRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-6 md:px-6"
              onClick={(e) => {
                // Click on the white space around the screenshot closes.
                if (e.target === e.currentTarget) close();
              }}
            >
              {/* 16:9-ish: scaled to fit the screen, whole. Full-page: full width, scroll down it. */}
              <div
                className={cn("relative mx-auto w-full", tall ? "max-w-[1600px]" : "h-full")}
                style={tall ? { aspectRatio: `1 / ${ratio}` } : undefined}
                onClick={(e) => {
                  if (e.target === e.currentTarget) close();
                }}
              >
                <Image
                  key={current.src}
                  src={current.src}
                  alt={current.alt}
                  fill
                  sizes="100vw"
                  quality={90}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalWidth) setRatio(img.naturalHeight / img.naturalWidth);
                  }}
                  className="object-contain"
                />
              </div>
            </div>

            {count > 1 && (
              <div className="pointer-events-none fixed inset-x-0 bottom-6 flex justify-center gap-2">
                {[-1, 1].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => step(delta)}
                    aria-label={delta < 0 ? "Previous screenshot" : "Next screenshot"}
                    className="pointer-events-auto grid size-12 place-items-center rounded-full bg-black text-white transition-transform hover:scale-105"
                  >
                    <ArrowIcon className={delta < 0 ? "-rotate-[135deg]" : "rotate-45"} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
