"use client";

import { useEffect, type RefObject } from "react";

/**
 * Lets a mouse drag a horizontally scrolling strip sideways (scrollbars are
 * hidden site-wide, so without this a mouse can only reach overflow with
 * Shift+wheel). Touch and trackpads keep their own scrolling. A drag never
 * counts as a click on the button or link it started on.
 */
export function useDragScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start: { x: number; left: number } | null = null;
    let dragged = false;

    const onDown = (e: PointerEvent) => {
      dragged = false;
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      if (el.scrollWidth <= el.clientWidth) return;
      start = { x: e.clientX, left: el.scrollLeft };
    };
    const onMove = (e: PointerEvent) => {
      if (!start) return;
      const dx = e.clientX - start.x;
      if (!dragged) {
        if (Math.abs(dx) < 6) return;
        dragged = true;
        el.style.cursor = "grabbing";
        el.style.userSelect = "none";
      }
      el.scrollLeft = start.left - dx;
    };
    const onUp = () => {
      if (!start) return;
      start = null;
      el.style.cursor = "";
      el.style.userSelect = "";
      // The click that follows this pointerup is dispatched in the same task.
      // If the drag ended outside the strip, that click never reaches it, so
      // clear the flag afterwards or the next keyboard/touch press is eaten.
      if (dragged) setTimeout(() => (dragged = false), 0);
    };
    const onClick = (e: MouseEvent) => {
      // Keyboard and screen-reader activations (detail 0) are never a drag.
      if (!dragged || e.detail === 0) return;
      e.preventDefault();
      e.stopPropagation();
      dragged = false;
    };
    const onDragStart = (e: DragEvent) => e.preventDefault();

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClick, true);
    el.addEventListener("dragstart", onDragStart);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("dragstart", onDragStart);
    };
  }, [ref]);
}
