"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
  PanInfo,
} from "framer-motion";
import { Zone, MenuItem } from "./menuData";
import Image from "next/image";
import { MenuAIBridge } from "../../basic-menu/_components/menu-ai-bridge";

// ─── Constants ────────────────────────────────────────────────────────────────

const SNAP_THRESHOLD = 0.25; // fraction of viewport to trigger snap
const VELOCITY_THRESHOLD = 300; // px/s — above this, snap in drag direction
const SPRING_CONFIG = { stiffness: 220, damping: 30, mass: 0.8 };
const PARALLAX_FACTOR_BG = 0.08; // background moves slower
const PARALLAX_FACTOR_TITLE = 0.15; // zone title drifts subtly

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1574315042788-75782c5f0a35?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519984388953-d24061a8ebec?q=80&w=800&auto=format&fit=crop",
];

// ─── Types ────────────────────────────────────────────────────────────────────

type GridPos = { col: number; row: number };

// ─── Helper: grid index to x/y canvas offset ──────────────────────────────────

function gridToOffset(col: number, row: number, vw: number, vh: number) {
  return { x: -col * vw, y: -row * vh };
}

function offsetToNearest(
  x: number,
  y: number,
  vw: number,
  vh: number,
  isMobile: boolean,
  numZones: number,
): GridPos {
  const col = Math.round(Math.abs(x) / vw);
  const row = Math.round(Math.abs(y) / vh);
  return {
    col: Math.max(0, Math.min(isMobile ? numZones - 1 : 1, col)),
    row: Math.max(0, Math.min(isMobile ? 0 : Math.ceil(numZones / 2) - 1, row)),
  };
}

function getZoneByGrid(zones: Zone[], col: number, row: number): Zone {
  return zones.find((z) => z.col === col && z.row === row) ?? zones[0];
}

// ─── MenuItem Card (Retro Style) ─────────────────────────────────────────────

// const MenuItemCard = React.memo(
//   ({
//     item,
//     index,
//   }: {
//     item: MenuItem;
//     index: number;
//   }) => {
//     // Cycle through the 3 background images and placeholder images
//     const bgIndex = (index % 3) + 1;
//     const imageSrc = PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];

//     return (
//       <motion.article
//         initial={{ opacity: 0, y: 22 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{
//           duration: 0.45,
//           delay: 0.08 + index * 0.055,
//           ease: [0.22, 1, 0.36, 1],
//         }}
//         className="relative flex flex-col rounded-[25px] overflow-hidden shadow-xl aspect-[283/312] group"
//         style={{ willChange: "transform, opacity" }}
//       >
//         {/* The full card background image (from retro) */}
//         <img
//           src={`/retro-backgrounds/retrobg-${bgIndex}.jpg`}
//           alt="Retro Background"
//           className="absolute inset-0 w-full h-full object-cover z-0"
//         />

//         {/* Top: The Food Image */}
//         <div className="relative z-10 w-full h-[62%]">
//           <img
//             src={imageSrc}
//             alt={item.name}
//             className="w-full h-full object-cover"
//           />
//         </div>

//         {/* Bottom: Text Content */}
//         <div className="relative z-10 px-3 pt-3 flex flex-col flex-1 justify-start">
//           <div className="flex justify-between items-start gap-1 mb-1">
//             <h3 className="text-sm md:text-[15px] font-bold text-white leading-tight font-display">
//               {item.name}
//             </h3>
//             <span className="text-base md:text-lg font-medium text-white whitespace-nowrap font-display">
//               {item.price}
//             </span>
//           </div>

//           <p className="text-[10px] md:text-[11px] font-medium text-white/90 leading-tight line-clamp-3 pr-10 font-body">
//             {item.description}
//           </p>
//         </div>

//         {/* Absolute ADD+ Button */}
//         <button className="absolute bottom-0 right-0 z-20 w-[86px] h-[37px] bg-[#E8CE91] text-[#6A2B2B] font-bold text-sm rounded-tl-[18.5px] rounded-br-[25px] hover:bg-[#d8be81] transition-colors flex items-center justify-center font-body shadow-md active:scale-95">
//           ADD+
//         </button>
//       </motion.article>
//     );
//   },
// );
// MenuItemCard.displayName = "MenuItemCard";
// ─── MenuItem Card (Retro Style) ─────────────────────────────────────────────

const MenuItemCard = React.memo(
  ({
    item,
    index,
    zoneIndex,
  }: {
    item: MenuItem;
    index: number;
    zoneIndex: number;
  }) => {
    // Keep the retro background cycling
    const bgIndex = (index % 3) + 1;
    // Load Espresso Bar (zoneIndex === 0) first 4 items instantly above the fold
    const isPriority = zoneIndex === 0 && index < 4;

    return (
      <motion.article
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.45,
          delay: 0.08 + index * 0.055,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative flex flex-col rounded-[25px] overflow-hidden shadow-xl aspect-[283/312] group"
        style={{ willChange: "transform, opacity" }}
      >
        {/* The full card background image (from retro) */}
        <Image
          src={`/retro-backgrounds/retrobg-${bgIndex}.jpg`}
          alt="Retro Background"
          fill
          className="object-cover z-0"
          sizes="(max-width: 768px) 50vw, 25vw"
          priority={isPriority}
        />

        {/* Top: The Food Image - NOW PULLING DIRECTLY FROM DATA */}
        <div className="relative z-10 w-full h-[62%] bg-black/20">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
            priority={isPriority}
          />
        </div>

        {/* Bottom: Text Content */}
        <div className="relative z-10 px-3 pt-3 pb-10 flex flex-col flex-1 justify-start">
          <div className="flex justify-between items-start gap-1 mb-1">
            <h3 className="text-sm md:text-[15px] font-bold text-white leading-tight font-display line-clamp-1">
              {item.name}
            </h3>
            <span className="text-base md:text-lg font-medium text-white whitespace-nowrap font-display">
              {item.price}
            </span>
          </div>

          <p className="text-[10px] md:text-[11px] font-medium text-white/90 leading-tight line-clamp-2 md:line-clamp-3 pr-10 font-body">
            {item.description}
          </p>
        </div>

        {/* Absolute ADD+ Button */}
        <button className="absolute bottom-0 right-0 z-20 w-[86px] h-[37px] bg-[#E8CE91] text-[#6A2B2B] font-bold text-sm rounded-tl-[18.5px] rounded-br-[25px] hover:bg-[#d8be81] transition-colors flex items-center justify-center font-body shadow-md active:scale-95">
          ADD+
        </button>
      </motion.article>
    );
  },
);
MenuItemCard.displayName = "MenuItemCard";
// ─── Zone Panel ───────────────────────────────────────────────────────────────

const ZonePanel = React.memo(
  ({
    zone,
    isActive,
    canvasX,
    canvasY,
    vw,
    vh,
  }: {
    zone: Zone;
    isActive: boolean;
    canvasX: ReturnType<typeof useMotionValue<number>>;
    canvasY: ReturnType<typeof useMotionValue<number>>;
    vw: number;
    vh: number;
  }) => {
    const zoneOriginX = zone.col * vw;
    const zoneOriginY = zone.row * vh;

    // Title drifts at a slightly different rate
    const titleParallaxX = useTransform(
      canvasX,
      (x) => (x + zoneOriginX) * PARALLAX_FACTOR_TITLE,
    );
    const titleParallaxY = useTransform(
      canvasY,
      (y) => (y + zoneOriginY) * PARALLAX_FACTOR_TITLE,
    );

    return (
      <div
        className="absolute"
        style={{
          left: zone.col * vw,
          top: zone.row * vh,
          width: vw,
          height: vh,
          background: "transparent",
        }}
      >
        {/* Grid partition lines */}
        {zone.col === 0 && (
          <div
            className="absolute right-0 top-[10%] bottom-[10%] w-px pointer-events-none"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
        )}
        {zone.row === 0 && (
          <div
            className="absolute bottom-0 left-[10%] right-[10%] h-px pointer-events-none"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
        )}

        {/* Zone content */}
        <div className="relative h-full flex flex-col pt-[5%]">
          {/* Header — parallax title */}
          <motion.div
            className="shrink-0 pt-12 pb-6 px-8 drop-shadow-lg"
            style={{ x: titleParallaxX, y: titleParallaxY }}
          >
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="font-body text-xs md:text-sm uppercase tracking-[0.25em] mb-2"
              style={{
                color: zone.accentColor,
                textShadow: "0px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              {String(zone.index + 1).padStart(2, "0")} — {zone.subtitle}
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={
                isActive ? { opacity: 1, y: 0 } : { opacity: 0.25, y: 0 }
              }
              transition={{
                duration: 0.55,
                delay: 0.18,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="font-display font-medium drop-shadow-md"
              style={{
                fontSize: "clamp(36px, 6vw, 64px)",
                color: "#F5F5DC",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {zone.title}
            </motion.h2>
          </motion.div>

          {/* Scrollable items — ISOLATED from canvas drag via touchAction */}
          <div
            className="scrollable-zone flex-1 px-8 pb-12 overflow-y-auto hide-scrollbar"
            style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
          >
            {isActive ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
                {zone.items.map((item, i) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    index={i}
                    zoneIndex={zone.index}
                  />
                ))}
              </div>
            ) : (
              // Pre-render items hidden so they're ready when snapping in
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 opacity-0 pointer-events-none">
                {zone.items.map((item) => (
                  <div
                    key={item.id}
                    className="aspect-[283/312] rounded-[25px] bg-white/5"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
ZonePanel.displayName = "ZonePanel";

// ─── Navigation Compass ───────────────────────────────────────────────────────

const NavCompass = ({
  activePos,
  onNavigate,
  layoutZones,
  isMobile,
}: {
  activePos: GridPos;
  onNavigate: (col: number, row: number) => void;
  layoutZones: Zone[];
  isMobile: boolean;
}) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
      {/* Dot indicators */}
      <div className={isMobile ? "flex gap-2" : "grid grid-cols-2 gap-2"}>
        {layoutZones.map((zone) => {
          const isActive =
            zone.col === activePos.col && zone.row === activePos.row;
          return (
            <button
              key={zone.id}
              onClick={() => onNavigate(zone.col, zone.row)}
              className="nav-dot rounded-full border transition-all duration-300 shadow-md"
              style={{
                width: isActive ? 20 : 10,
                height: isActive ? 8 : 8,
                borderRadius: isActive ? 4 : 50,
                background: isActive
                  ? zone.accentColor
                  : "rgba(245,245,220,0.6)",
                border: isActive
                  ? `1px solid ${zone.accentColor}`
                  : "1px solid rgba(245,245,220,0.4)",
              }}
              aria-label={`Navigate to ${zone.title}`}
            />
          );
        })}
      </div>

      {/* Current zone label */}
      <motion.p
        key={`${activePos.col}-${activePos.row}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.3 }}
        className="font-body text-[10px] uppercase tracking-[0.2em] mt-1"
        style={{
          color: "rgba(245,245,220,0.8)",
          textShadow: "0 1px 2px rgba(0,0,0,0.8)",
        }}
      >
        {getZoneByGrid(layoutZones, activePos.col, activePos.row).title}
      </motion.p>
    </div>
  );
};

// ─── Zone Labels (edge hints) ─────────────────────────────────────────────────

const EdgeHints = ({
  activePos,
  layoutZones,
  isMobile,
}: {
  activePos: GridPos;
  layoutZones: Zone[];
  isMobile: boolean;
}) => {
  const hints = {
    right:
      activePos.col < (isMobile ? 3 : 1)
        ? getZoneByGrid(layoutZones, activePos.col + 1, activePos.row)
        : null,
    left:
      activePos.col > 0
        ? getZoneByGrid(layoutZones, activePos.col - 1, activePos.row)
        : null,
    down:
      !isMobile && activePos.row === 0
        ? getZoneByGrid(layoutZones, activePos.col, 1)
        : null,
    up:
      !isMobile && activePos.row === 1
        ? getZoneByGrid(layoutZones, activePos.col, 0)
        : null,
  };

  return (
    <>
      {hints.right && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 pointer-events-none drop-shadow-md">
          <div className="flex items-center gap-2">
            <span
              className="font-body text-[10px] uppercase tracking-[0.15em]"
              style={{ color: hints.right.accentColor, opacity: 0.9 }}
            >
              {hints.right.title}
            </span>
            <span style={{ color: hints.right.accentColor, opacity: 0.9 }}>
              ›
            </span>
          </div>
        </div>
      )}
      {hints.left && (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 pointer-events-none drop-shadow-md">
          <div className="flex items-center gap-2">
            <span style={{ color: hints.left.accentColor, opacity: 0.9 }}>
              ‹
            </span>
            <span
              className="font-body text-[10px] uppercase tracking-[0.15em]"
              style={{ color: hints.left.accentColor, opacity: 0.9 }}
            >
              {hints.left.title}
            </span>
          </div>
        </div>
      )}
      {hints.down && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none drop-shadow-md">
          <div className="flex flex-col items-center gap-1">
            <span style={{ color: hints.down.accentColor, opacity: 0.9 }}>
              ›
            </span>
            <span
              className="font-body text-[10px] uppercase tracking-[0.15em]"
              style={{
                color: hints.down.accentColor,
                opacity: 0.9,
                writingMode: "horizontal-tb",
              }}
            >
              {hints.down.title}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

// ─── Drag Hint Overlay ────────────────────────────────────────────────────────

const DragHint = ({ visible }: { visible: boolean }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: visible ? 1 : 0 }}
    transition={{ duration: 0.6, delay: 1.2 }}
    className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none"
  >
    <div
      className="flex flex-col items-center gap-3 px-6 py-4 rounded-2xl"
      style={{
        background: "rgba(15,23,42,0.65)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="flex items-center gap-4">
        <span style={{ color: "rgba(245,245,220,0.8)", fontSize: 20 }}>‹</span>
        <motion.div
          animate={{ x: [-8, 8, -8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-10 h-10 rounded-full border flex items-center justify-center"
          style={{
            border: "1px solid rgba(245,245,220,0.5)",
            background: "rgba(245,245,220,0.1)",
          }}
        >
          <span style={{ color: "rgba(245,245,220,0.9)", fontSize: 14 }}>
            ⤢
          </span>
        </motion.div>
        <span style={{ color: "rgba(245,245,220,0.8)", fontSize: 20 }}>›</span>
      </div>
      <p
        className="font-body text-[11px] uppercase tracking-[0.18em]"
        style={{ color: "rgba(245,245,220,0.9)" }}
      >
        Drag to explore
      </p>
    </div>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SpatialSnapGrid({
  data,
  slug,
}: {
  data: any;
  slug: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState(0);
  const [vh, setVh] = useState(0);
  const [activePos, setActivePos] = useState<GridPos>({ col: 0, row: 0 });
  const [showHint, setShowHint] = useState(true);
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const isMobile = vw > 0 && vw < 768;

  // Dynamically position zones based on viewport (1xN for mobile, 2xN/2 for desktop)
  const layoutZones = React.useMemo(() => {
    return data.categories.map((cat: any, i: number) => {
      const colors = ["#E8A343", "#4A5D23", "#8B3A3A", "#008080"];
      const accentColor = cat.accentColor || colors[i % colors.length];

      return {
        id: cat._id,
        index: i,
        col: isMobile ? i : i % 2,
        row: isMobile ? 0 : Math.floor(i / 2),
        title: cat.name["en"] || cat.name["ka"] || "Category",
        subtitle: "Discover",
        accentColor: accentColor,
        items: cat.items.map((item: any) => ({
          id: item._id,
          name: item.name["en"] || item.name["ka"],
          price: (item.price / 100).toFixed(2) + " ₾",
          description:
            item.description?.["en"] || item.description?.["ka"] || "",
          image:
            item.imageUrl ||
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
        })),
      };
    });
  }, [data.categories, isMobile]);

  // Canvas motion values
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Spring-smoothed values for the actual canvas transform
  const springX = useSpring(rawX, SPRING_CONFIG);
  const springY = useSpring(rawY, SPRING_CONFIG);

  // ── Viewport measurement ──────────────────────────────────────────────────
  useEffect(() => {
    const measure = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // ── Navigate to grid position programmatically ────────────────────────────
  const navigateTo = useCallback(
    (col: number, row: number) => {
      if (!vw || !vh) return;
      const { x, y } = gridToOffset(col, row, vw, vh);
      animate(rawX, x, {
        type: "spring",
        ...SPRING_CONFIG,
        velocity: 0,
      });
      if (!isMobile) {
        animate(rawY, y, {
          type: "spring",
          ...SPRING_CONFIG,
          velocity: 0,
        });
      } else {
        rawY.set(0);
      }
      setActivePos({ col, row });
      setShowHint(false);
    },
    [vw, vh, rawX, rawY, isMobile],
  );

  // ── Ensure activePos is valid on resize ───────────────────────────────────
  useEffect(() => {
    if (!vw || !vh) return;
    const isValid = layoutZones.some(
      (z: { col: number; row: number }) =>
        z.col === activePos.col && z.row === activePos.row,
    );
    if (!isValid) {
      navigateTo(0, 0);
    }
  }, [isMobile, layoutZones, activePos, navigateTo, vw, vh]);

  // ── Snap logic after pan ends ─────────────────────────────────────────────
  const snapToNearest = useCallback(
    (currentX: number, currentY: number, velX: number, velY: number) => {
      if (!vw || !vh) return;

      let targetCol = activePos.col;
      let targetRow = activePos.row;

      const absVelX = Math.abs(velX);
      const absVelY = Math.abs(velY);

      // Velocity-based snap: fast swipe overrides position-based snap
      if (
        absVelX > VELOCITY_THRESHOLD ||
        (!isMobile && absVelY > VELOCITY_THRESHOLD)
      ) {
        if (absVelX > absVelY || isMobile) {
          // Horizontal dominant
          const maxCol = isMobile ? layoutZones.length - 1 : 1;
          targetCol =
            velX < 0
              ? Math.min(maxCol, activePos.col + 1)
              : Math.max(0, activePos.col - 1);
        } else {
          // Vertical dominant (only on desktop)
          const maxRow = Math.ceil(layoutZones.length / 2) - 1;
          targetRow =
            velY < 0
              ? Math.min(maxRow, activePos.row + 1)
              : Math.max(0, activePos.row - 1);
        }
      } else {
        // Position-based snap
        const nearest = offsetToNearest(
          currentX,
          currentY,
          vw,
          vh,
          isMobile,
          layoutZones.length,
        );
        targetCol = nearest.col;
        targetRow = nearest.row;
      }

      navigateTo(targetCol, targetRow);
    },
    [activePos, vw, vh, navigateTo, isMobile, layoutZones.length],
  );

  // ── Pan handlers ──────────────────────────────────────────────────────────
  const handlePanStart = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      isDragging.current = true;
      dragStartPos.current = { x: rawX.get(), y: rawY.get() };
      setShowHint(false);
    },
    [rawX, rawY],
  );

  const handlePan = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      if (!isDragging.current || !vw || !vh) return;

      // Clamp within the 2×2 canvas bounds with elastic resistance
      const newX = dragStartPos.current.x + info.offset.x;
      const newY = dragStartPos.current.y + info.offset.y;

      const maxX = 0;
      const minX = isMobile ? -vw * (layoutZones.length - 1) : -vw;
      const maxY = 0;
      const minY = isMobile
        ? 0
        : -vh * Math.max(0, Math.ceil(layoutZones.length / 2) - 1);

      // Elastic overshoot: resistance factor when pulling beyond bounds
      const elasticX = (val: number, min: number, max: number) => {
        if (val > max) return max + (val - max) * 0.12;
        if (val < min) return min + (val - min) * 0.12;
        return val;
      };

      rawX.set(elasticX(newX, minX, maxX));
      if (!isMobile) {
        rawY.set(elasticX(newY, minY, maxY));
      }
    },
    [vw, vh, rawX, rawY, isMobile, layoutZones.length],
  );

  const handlePanEnd = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      isDragging.current = false;
      snapToNearest(rawX.get(), rawY.get(), info.velocity.x, info.velocity.y);
    },
    [rawX, rawY, snapToNearest],
  );

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (vw && vh) {
      rawX.set(0);
      rawY.set(0);
    }
  }, [vw, vh, rawX, rawY]);

  if (!vw || !vh) return null;

  const canvasW = isMobile ? vw * layoutZones.length : vw * 2;
  const canvasH = isMobile
    ? vh
    : vh * Math.max(1, Math.ceil(layoutZones.length / 2));

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden"
      style={{
        background: "#000", // Fallback
        cursor: isDragging.current ? "grabbing" : "grab",
        touchAction: isMobile ? "pan-y" : "none",
      }}
    >
      {/* ── Fixed Backgrounds that fade per active zone ── */}
      {layoutZones.map(
        (zone: {
          col: number;
          row: number;
          id: any;
          index: number;
          title: string | undefined;
        }) => {
          const isBgActive =
            activePos.col === zone.col && activePos.row === zone.row;
          return (
            <img
              key={`bg-${zone.id}`}
              src={`/dragable-menu/snap-bg-${zone.index + 1}.jpg`}
              alt={zone.title}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none z-0"
              style={{
                opacity: isBgActive ? 1 : 0,
              }}
            />
          );
        },
      )}

      {/* Dark overlay to ensure text contrast */}
      <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />

      {/* ── Background grid glow ── */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* ── The 2×2 canvas ── */}
      <motion.div
        className="absolute no-select z-10"
        style={{
          width: canvasW,
          height: canvasH,
          x: springX,
          y: springY,
          willChange: "transform",
        }}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
      >
        {layoutZones.map((zone: Zone) => (
          <ZonePanel
            key={zone.id}
            zone={zone}
            isActive={zone.col === activePos.col && zone.row === activePos.row}
            canvasX={springX}
            canvasY={springY}
            vw={vw}
            vh={vh}
          />
        ))}
      </motion.div>

      {/* ── Fixed UI chrome ── */}

      {/* Top brand bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
          pointerEvents: "none",
        }}
      >
        <div>
          <p
            className="font-display font-medium tracking-[0.04em] drop-shadow-md"
            style={{ color: "#F5F5DC", fontSize: 16, letterSpacing: "0.08em" }}
          >
            {data.organization.name}
            <span style={{ color: "rgba(245,245,220,0.5)", margin: "0 6px" }}>
              ·
            </span>
            <span
              style={{
                color: "rgba(245,245,220,0.7)",
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
                fontWeight: 300,
                letterSpacing: "0.06em",
              }}
            >
              cafe & spirits
            </span>
          </p>
        </div>
        <div className="text-right">
          <p
            className="font-body text-[10px] uppercase tracking-[0.2em] drop-shadow-md"
            style={{ color: "rgba(245,245,220,0.8)" }}
          >
            Menu 2025
          </p>
        </div>
      </div>

      {/* Edge navigation hints */}
      <EdgeHints
        activePos={activePos}
        layoutZones={layoutZones}
        isMobile={isMobile}
      />

      {/* Navigation compass */}
      <NavCompass
        activePos={activePos}
        onNavigate={navigateTo}
        layoutZones={layoutZones}
        isMobile={isMobile}
      />

      {/* Drag hint on first load */}
      <DragHint visible={showHint} />

      {/* Vignette edges */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          boxShadow: "inset 0 0 100px rgba(0,0,0,0.8)",
        }}
      />

      {/* ── VolooAI Widget ── */}
      {data.organization.features?.hasAiManager !== false && (
        <div className="relative z-50">
          <MenuAIBridge
            organizationName={data.organization.name}
            slug={slug}
            categories={data.categories}
            themeSettings={data.organization.themeSettings ?? null}
            currency={data.organization.currency}
          />
        </div>
      )}
    </div>
  );
}
