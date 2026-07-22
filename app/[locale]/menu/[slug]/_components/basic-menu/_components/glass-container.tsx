import React, { ElementType, ComponentPropsWithoutRef } from "react";

type GlassContainerProps<T extends ElementType> = {
  /** 
   * The HTML element or React component to render as. 
   * Defaults to "div". 
   */
  as?: T;
  children: React.ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<T>;

/**
 * GlassContainer
 * 
 * A reusable, mobile-optimized component that implements a premium dark-themed 
 * glassmorphic aesthetic based on exact Figma specifications.
 * 
 * Features:
 * - Touch-friendly base dimensions (min-h-[55px]) and soft rounded corners.
 * - Deep frosted glass blur (20px).
 * - Subtle inner borders using a pseudo-element trick for seamless shining.
 * - Custom Figma-defined drop shadow.
 * - Smooth active/press state scaling and highlight transitions.
 */
export const GlassContainer = <T extends ElementType = "div">({
  as,
  children,
  className = "",
  ...props
}: GlassContainerProps<T>) => {
  const Component = (as || "div") as "div";

  // Base classes implementing the requested specifications
  const baseClasses = 
    "relative " +
    "overflow-hidden " +
    "min-h-[55px] " +
    "rounded-[27.5px] " +
    "backdrop-blur-[20px] " +
    "bg-gradient-to-b from-white/10 to-white/5 " +
    "shadow-[0_20px_40px_rgba(0,0,0,0.1)] " +
    "transition-all duration-300 " +
    "active:scale-95 active:bg-white/20 " +
    "before:absolute before:inset-0 before:rounded-[27.5px] " +
    "before:border before:border-white/20 before:pointer-events-none";

  return (
    <Component
      className={`${baseClasses} ${className}`.trim()}
      {...(props as object)}
    >
      {children}
    </Component>
  );
};
