export default function MobileHero() {
  const MOBILE_LINES = ["SHE", "MOQ", "ME", "DI"];

  return (
    <div className="relative h-svh w-full touch-none overflow-hidden bg-background text-foreground flex flex-col justify-center">
      {/* ── Giant brand type ── */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <h1
          className="m-0 flex select-none flex-col items-center font-black uppercase leading-[0.82] tracking-tighter"
          style={{ letterSpacing: "-0.055em" }}
        >
          <span className="sr-only">SHEMOQMEDI</span>
          {MOBILE_LINES.map((line, lineIdx) => (
            <span
              key={lineIdx}
              aria-hidden="true"
              className="block overflow-hidden whitespace-nowrap text-[27vw]"
            >
              {line}
            </span>
          ))}
        </h1>
      </div>
    </div>
  );
}
