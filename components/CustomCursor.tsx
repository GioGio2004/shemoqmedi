"use client";

// components/CustomCursor.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Site-wide custom cursor: a small dot that tracks the pointer instantly, and
// a lagging ring (spring physics) that expands over anything clickable. Mount
// once in the root layout — desktop / mouse-and-trackpad only (checks
// `pointer: fine`), so touch devices are completely unaffected.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState("");

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { damping: 28, stiffness: 320, mass: 0.5 });
  const ringY = useSpring(y, { damping: 28, stiffness: 320, mass: 0.5 });

  // Only activate for fine-pointer devices (mouse/trackpad), and react live
  // if the user switches input modes (e.g. docking a tablet).
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);

      const target = e.target as HTMLElement | null;
      const tagged = target?.closest<HTMLElement>("[data-cursor]");
      const interactive = target?.closest("a, button, select, [role='button'], input[type='submit']");

      if (tagged) {
        setHovering(true);
        setLabel(tagged.dataset.cursor ?? "");
      } else if (interactive) {
        setHovering(true);
        setLabel("");
      } else {
        setHovering(false);
        setLabel("");
      }
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.classList.add("has-custom-cursor");
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="cc-dot"
        style={{ left: x, top: y }}
        animate={{ scale: hovering ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        aria-hidden="true"
        className="cc-ring"
        style={{ left: ringX, top: ringY }}
        animate={{ scale: hovering ? 2.4 : 1, opacity: hovering ? 1 : 0.55 }}
        transition={{ type: "spring", damping: 20, stiffness: 260 }}
      >
        {label && (
          <motion.span
            className="cc-label"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 / 2.4 }}
            transition={{ duration: 0.15 }}
          >
            {label}
          </motion.span>
        )}
      </motion.div>
      <style>{CC_CSS}</style>
    </>
  );
}

const CC_CSS = `
.has-custom-cursor a,
.has-custom-cursor button,
.has-custom-cursor [role="button"],
.has-custom-cursor select,
.has-custom-cursor .ml-root{cursor:none}
.cc-dot{position:fixed;top:0;left:0;width:8px;height:8px;margin:-4px;border-radius:999px;background:#fff;pointer-events:none;z-index:11000;mix-blend-mode:difference}
.cc-ring{position:fixed;top:0;left:0;width:40px;height:40px;margin:-20px;border-radius:999px;border:1px solid rgba(255,255,255,.65);pointer-events:none;z-index:11000;display:flex;align-items:center;justify-content:center;mix-blend-mode:difference}
.cc-label{font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:#fff;white-space:nowrap;font-family:ui-monospace,"SF Mono",Menlo,monospace}
`;
