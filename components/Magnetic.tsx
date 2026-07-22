"use client";

// components/Magnetic.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Magnetic hover buttons — the pointer "pulls" the element toward it within a
// small radius, springs back on leave, and gives a satisfying press animation
// on click. Two concrete exports (anchor / button) keep this fully typed
// instead of a polymorphic `as` prop.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, type MouseEvent, type ReactNode, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const SPRING = { stiffness: 200, damping: 15, mass: 0.4 };

function useMagnetic(strength: number) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);

  const onMouseMove = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };
  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { sx, sy, onMouseMove, onMouseLeave };
}

type MagneticAProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> & {
  children: ReactNode;
  strength?: number;
};

export function MagneticA({ children, strength = 0.3, ...rest }: MagneticAProps) {
  const { sx, sy, onMouseMove, onMouseLeave } = useMagnetic(strength);
  return (
    <motion.a
      style={{ x: sx, y: sy }}
      whileHover={{ scale: 1.045 }}
      whileTap={{ scale: 0.94 }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      {...rest}
    >
      {children}
    </motion.a>
  );
}

type MagneticButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> & {
  children: ReactNode;
  strength?: number;
};

export function MagneticButton({ children, strength = 0.3, ...rest }: MagneticButtonProps) {
  const { sx, sy, onMouseMove, onMouseLeave } = useMagnetic(strength);
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy }}
      whileHover={{ scale: rest.disabled ? 1 : 1.045 }}
      whileTap={{ scale: rest.disabled ? 1 : 0.94 }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
