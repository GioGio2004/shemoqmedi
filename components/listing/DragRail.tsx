"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowIcon } from "@/components/site/ui";
import { cn } from "@/lib/utils";

/**
 * Horizontal scroll-snap rail you can grab and drag with the mouse (no
 * Shift+wheel needed), plus round prev / next buttons that slide one card at
 * a time. Touch keeps the browser's own swipe. A drag never opens the link
 * under the pointer; a plain click still does.
 */
export function DragRail({
  label,
  className,
  controlsClassName,
  children,
}: {
  label: string;
  className?: string;
  /** Extra classes for the arrow-button row (e.g. the rail's side padding). */
  controlsClassName?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const drag = useRef<{ x: number; left: number; start: number; lastX: number; lastT: number; v: number } | null>(null);
  const moved = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: true });

  /** Scroll positions where each card snaps (its left edge minus the scroll padding). */
  const stops = () => {
    const el = ref.current;
    if (!el) return [0];
    const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
    const max = el.scrollWidth - el.clientWidth;
    return [...el.children].map((li) =>
      Math.min(max, Math.max(0, (li as HTMLElement).offsetLeft - pad)),
    );
  };

  const nearest = (left: number) => {
    const list = stops();
    let best = 0;
    list.forEach((s, i) => {
      if (Math.abs(s - left) < Math.abs(list[best] - left)) best = i;
    });
    return best;
  };

  /** Smooth-scroll to a card, with snapping off until the scroll settles. */
  const goTo = (index: number) => {
    const el = ref.current;
    if (!el) return;
    const list = stops();
    const target = list[Math.max(0, Math.min(list.length - 1, index))];
    el.style.scrollSnapType = "none";
    const restore = () => {
      el.style.scrollSnapType = "";
      el.removeEventListener("scrollend", restore);
    };
    el.addEventListener("scrollend", restore);
    window.setTimeout(restore, 900); // browsers without scrollend
    el.scrollTo({ left: target, behavior: "smooth" });
  };

  const by = (delta: number) => {
    const el = ref.current;
    if (el) goTo(nearest(el.scrollLeft) + delta);
  };

  // Hide a button when there is nothing more on that side.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdges({ start: el.scrollLeft <= 2, end: el.scrollLeft >= max - 2 });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || e.button !== 0) return;
    moved.current = false;
    drag.current = { x: e.clientX, left: el.scrollLeft, start: nearest(el.scrollLeft), lastX: e.clientX, lastT: e.timeStamp, v: 0 };

    const move = (ev: PointerEvent) => {
      const g = drag.current;
      if (!g) return;
      const dx = ev.clientX - g.x;
      if (!moved.current) {
        if (Math.abs(dx) < 6) return;
        moved.current = true;
        el.style.scrollSnapType = "none";
        el.style.scrollBehavior = "auto";
        setDragging(true);
      }
      const now = ev.timeStamp;
      g.v = g.v * 0.6 + ((ev.clientX - g.lastX) / Math.max(1, now - g.lastT)) * 0.4; // px per ms
      g.lastX = ev.clientX;
      g.lastT = now;
      el.scrollLeft = g.left - dx;
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      const g = drag.current;
      drag.current = null;
      setDragging(false);
      el.style.scrollBehavior = "";
      if (!g || !moved.current) return;
      if (performance.now() - g.lastT > 90) g.v = 0; // held still before letting go: no flick
      let index = nearest(el.scrollLeft);
      // A flick, or a drag that did not get past half a card, still moves one
      // card in the direction of the drag (dragging left = next card).
      const travelled = el.scrollLeft - g.left;
      const dir = g.v !== 0 ? -Math.sign(g.v) : Math.sign(travelled);
      if (index === g.start && (Math.abs(g.v) > 0.3 || Math.abs(travelled) > 40)) index = g.start + dir;
      goTo(index);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  return (
    <div className="relative">
      <ul
        ref={ref}
        aria-label={label}
        onPointerDown={onPointerDown}
        // After a drag, swallow the click so the card's link does not open.
        onClickCapture={(e) => {
          if (moved.current) {
            e.preventDefault();
            e.stopPropagation();
            moved.current = false;
          }
        }}
        onDragStart={(e) => e.preventDefault()}
        className={cn(
          "relative select-none pointer-fine:cursor-grab",
          dragging && "pointer-fine:cursor-grabbing [&_a]:pointer-events-none",
          className,
        )}
      >
        {children}
      </ul>

      {!(edges.start && edges.end) && (
        <div className={cn("mt-4 flex justify-end gap-2", controlsClassName)}>
          {[-1, 1].map((delta) => {
            const disabled = delta < 0 ? edges.start : edges.end;
            return (
              <button
                key={delta}
                type="button"
                onClick={() => by(delta)}
                disabled={disabled}
                aria-label={delta < 0 ? "Previous" : "Next"}
                className="grid size-12 place-items-center rounded-full bg-black text-white transition-[transform,opacity] hover:scale-105 disabled:pointer-events-none disabled:opacity-20"
              >
                <ArrowIcon className={delta < 0 ? "-rotate-[135deg]" : "rotate-45"} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
