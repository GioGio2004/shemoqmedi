import { cn } from "@/lib/utils";

/**
 * Kencho's catalogue opening: a lowercase prelude, an oversized uppercase
 * title, then a bottom row with a short line and an action.
 */
export function PageHero({
  prelude,
  title,
  lede,
  meta,
  action,
  titleClassName,
  afterHero,
}: {
  prelude: string;
  title: string;
  lede?: React.ReactNode;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  titleClassName?: string;
  /** Set when a full-screen hero sits above, so there's no header offset. */
  afterHero?: boolean;
}) {
  return (
    <header
      className={cn(
        "container-site pb-12 md:pb-16",
        afterHero ? "pt-16 md:pt-24" : "pt-32 md:pt-40",
      )}
    >
      <p className="text-[clamp(1.75rem,4vw,3.5rem)] leading-none font-medium tracking-[-0.045em] lowercase">
        {prelude}
      </p>
      <h1
        className={cn(
          "mt-2 text-[clamp(3.75rem,13.5vw,13.5rem)] leading-[0.86] font-semibold tracking-[-0.065em] uppercase [overflow-wrap:anywhere]",
          titleClassName,
        )}
      >
        {title}
      </h1>
      {(lede || meta || action) && (
        <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md">
            {lede && <p className="text-sm leading-relaxed text-black/60">{lede}</p>}
            {meta && <p className="mt-3 text-xs font-medium text-black">{meta}</p>}
          </div>
          {action}
        </div>
      )}
    </header>
  );
}
