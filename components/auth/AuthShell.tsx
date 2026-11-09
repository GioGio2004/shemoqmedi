import { Wordmark } from "@/components/site/ui";

/**
 * Frame shared by the log-in and sign-up pages. The crow lives here too: in
 * the logo, and it lands on the letters of the big title (one span per
 * letter, measured by crow/world.ts).
 */
export function AuthShell({
  prelude,
  title,
  children,
}: {
  prelude: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <header className="container-site flex h-20 items-center md:h-[88px]">
        <Wordmark live />
      </header>
      <main className="container-site grid items-center gap-12 pt-6 pb-20 lg:grid-cols-[1.1fr_auto] lg:gap-20 lg:pt-16">
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
              <span key={i} aria-hidden="true" data-crow-letter="">
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
