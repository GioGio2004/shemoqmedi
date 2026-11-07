import { cn } from "@/lib/utils";
import { TILE_TONES, type Project } from "@/lib/showcase";

/**
 * Typographic stand-in for a website screenshot: a flat beige "browser"
 * frame with the project name. No images, so it costs nothing to load.
 * Swap for real screenshots (ImageKit) once submissions exist.
 */
export function ProjectTile({
  project,
  size = "md",
  className,
}: {
  project: Project;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("relative aspect-[4/3] overflow-hidden rounded-md", className)}
      style={{ backgroundColor: TILE_TONES[project.tone % TILE_TONES.length] }}
    >
      <div className="absolute inset-[7%] flex flex-col rounded-sm bg-paper/70">
        <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
          <span className="size-1.5 rounded-full bg-line" />
          <span className="size-1.5 rounded-full bg-line" />
          <span className="size-1.5 rounded-full bg-line" />
          <span className="ml-3 h-1.5 w-1/3 rounded-full bg-beige" />
        </div>
        <div className="flex flex-1 flex-col justify-between p-[6%]">
          <span className="label">{project.tags[0]}</span>
          <span
            className={cn(
              "font-semibold leading-[0.9] tracking-[-0.05em] text-ink",
              size === "lg"
                ? "text-[clamp(2.5rem,6vw,5.5rem)]"
                : "text-[clamp(1.75rem,3vw,2.75rem)]",
            )}
          >
            {project.title}
          </span>
          <div className="flex gap-2">
            <span className="h-1.5 w-1/4 rounded-full bg-beige-deep" />
            <span className="h-1.5 w-1/6 rounded-full bg-beige" />
          </div>
        </div>
      </div>
    </div>
  );
}
