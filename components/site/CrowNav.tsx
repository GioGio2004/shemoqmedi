"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MENU_ITEMS, isActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** Scroll distance after which the header is gone and the crow floats. */
const FLOAT_AFTER = 64;

/**
 * The crow logo. It is fixed to the viewport at the exact spot it occupies in
 * the header, so when the page scrolls the header leaves and the crow stays.
 * At the top it is the home link; once floating it sits on a small white disc
 * and opens the navigation.
 */
export function CrowNav() {
  const pathname = usePathname() ?? "/";
  const [floating, setFloating] = useState(false);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  // Float state from scroll position (rAF-throttled, passive).
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const next = window.scrollY > FLOAT_AFTER;
      setFloating(next);
      if (!next) setOpen(false);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Close on navigation.
  useEffect(() => {
    setOpen(false); // eslint-disable-line react-hooks/set-state-in-effect -- reset on route change
  }, [pathname]);

  // Close on outside click and Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const crow = (
    <Image
      src="/brand/crow.png"
      alt=""
      width={179}
      height={200}
      priority
      className={cn(
        "h-auto transition-[width] duration-300 ease-out",
        floating ? "w-[30px]" : "w-[38px] md:w-[42px]",
      )}
    />
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60]">
      <div className="container-site flex h-20 items-center md:h-[88px]">
        <div ref={root} className="pointer-events-auto relative">
          {floating ? (
            <button
              ref={button}
              type="button"
              aria-expanded={open}
              aria-controls="crow-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className={cn(
                "group grid size-14 place-items-center rounded-full border bg-white/90 backdrop-blur-md transition-colors duration-300",
                open ? "border-black" : "border-black/10 hover:border-black",
              )}
            >
              {crow}
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute top-1/2 left-[calc(100%+10px)] -translate-y-1/2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[10.5px] font-semibold tracking-[0.06em] whitespace-nowrap uppercase transition-opacity duration-200",
                  open ? "opacity-0" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
                )}
              >
                Menu
              </span>
            </button>
          ) : (
            <Link href="/" aria-label="shemoqmedi, home" className="grid size-14 place-items-center">
              {crow}
            </Link>
          )}

          {floating && open && (
            <nav
              id="crow-menu"
              aria-label="Main"
              className="absolute top-[calc(100%+10px)] left-0 w-[min(86vw,320px)] rounded-3xl border border-black/10 bg-white p-2"
            >
              <ul>
                {MENU_ITEMS.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between rounded-2xl px-4 py-3 text-xl font-semibold tracking-[-0.035em]",
                          active ? "bg-black text-white" : "hover:bg-black hover:text-white",
                        )}
                      >
                        {item.label}
                        <span aria-hidden="true" className="text-sm">↗</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
