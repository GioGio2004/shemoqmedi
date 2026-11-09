import { createElement } from "react";
import { CROW, GLYPHS, SEAL_ARC } from "@/lib/badgeArt";
import { badgeModel, glyphId, textTransform, type BadgeInput } from "@/lib/badgeSvg";
import { cn } from "@/lib/utils";

// Badges drawn inline (server components), so their parts can animate:
// each part sits in a <g data-part="…"> that app/globals.css moves (see
// ".badge-art"). Wrap one in <BadgeReveal> to play its entrance when it
// scrolls into view. Elsewhere badges are plain images from /badge/<award>.

/**
 * The crow, the seal's arc text and the small-caps letters, once per page:
 * every <BadgeArt> draws them with <use>, which keeps a page of badges
 * small. Render it once, before the badges.
 */
export function BadgeDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" className="pointer-events-none absolute">
      <defs>
        <path id="badge-crow" d={CROW} />
        <path id="badge-arc" d={SEAL_ARC} />
        {Object.entries(GLYPHS).map(([char, [, d]]) => (d ? <path key={char} id={`badge-${glyphId(char)}`} d={d} /> : null))}
      </defs>
    </svg>
  );
}

/** "stroke-width" → "strokeWidth". */
const jsxName = (name: string) => name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

/** One badge as inline SVG. Needs <BadgeDefs /> on the page. */
export function BadgeArt({ className, ...input }: BadgeInput & { className?: string }) {
  const model = badgeModel(input);
  return (
    <svg
      viewBox={`0 0 ${model.width} ${model.height}`}
      role="img"
      aria-label={`${model.label} badge`}
      data-shape={model.shape}
      className={cn("badge-art", className)}
    >
      {model.parts.map(({ part, tag, use, text, attrs }) => {
        const { d, ...rest } = attrs;
        const props = Object.fromEntries(Object.entries(rest).map(([k, v]) => [jsxName(k), v]));
        let shape: React.ReactNode;
        if (text) {
          shape = (
            <g transform={textTransform(text)} {...props}>
              {text.glyphs.map((g, i) => (
                <use key={i} href={`#badge-${glyphId(g.char)}`} x={g.at} />
              ))}
            </g>
          );
        } else if (use) {
          shape = <use href={`#badge-${use}`} {...props} />;
        } else {
          shape = createElement(tag, { ...props, ...(d ? { d } : {}), ...(part === "ring" ? { pathLength: 1 } : {}) });
        }
        return (
          <g key={part} data-part={part}>
            {/* The crow's own wrapper: its hop on hover must not restart the entrance. */}
            {part === "crow" ? <g className="badge-crow">{shape}</g> : shape}
          </g>
        );
      })}
    </svg>
  );
}
