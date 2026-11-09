/**
 * Frame shared by the log-in and sign-up pages, under the site's one fixed
 * navbar (app/layout.tsx). The crow lands on the letters of the big title
 * (one span per letter, measured by crow/world.ts).
 */
export function AuthShell({
  prelude,
  title,
  crowLetter,
  children,
}: {
  prelude: string;
  title: string;
  /** A letter of the title the crow heads for first (e.g. the I of LOG IN). */
  crowLetter?: string;
  children: React.ReactNode;
}) {
  const goto = crowLetter ? title.toLowerCase().lastIndexOf(crowLetter.toLowerCase()) : -1;
  return (
    <div className="min-h-dvh">
      {/* Room for the fixed navbar. */}
      <div aria-hidden="true" className="h-20 md:h-[88px]" />
      <main id="main-content" className="container-site grid items-center gap-12 pt-6 pb-20 lg:grid-cols-[1.1fr_auto] lg:gap-20 lg:pt-16">
        <div>
          <p className="text-[clamp(2.5rem,6.5vw,5.5rem)] leading-none font-medium tracking-[-0.05em] lowercase">
            {prelude}
          </p>
          <h1
            aria-label={title}
            data-crow-wordmark=""
            // Room above the letters for the crow to stand on them.
            className="mt-[clamp(2.75rem,5vw,4rem)] text-[clamp(3.5rem,10vw,9.5rem)] leading-[0.86] font-semibold tracking-[-0.065em] uppercase"
          >
            {title.split("").map((ch, i) => (
              <span key={i} aria-hidden="true" data-crow-letter="" data-crow-goto={i === goto ? "" : undefined}>
                {ch}
              </span>
            ))}
            <span data-crow-baseline="" aria-hidden="true" className="inline-block h-0 w-0" />
          </h1>
        </div>
        <div className="w-full max-w-[420px] justify-self-start lg:w-[420px] lg:justify-self-end">{children}</div>
      </main>
    </div>
  );
}
