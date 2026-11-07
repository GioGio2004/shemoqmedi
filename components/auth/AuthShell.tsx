import { Wordmark } from "@/components/site/ui";

/** Frame shared by the log-in and sign-up pages. */
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
        <Wordmark />
      </header>
      <main className="container-site grid items-center gap-12 pt-6 pb-20 lg:grid-cols-[1.1fr_auto] lg:gap-20 lg:pt-16">
        <div>
          <p className="text-[clamp(1.75rem,4vw,3.5rem)] leading-none font-medium tracking-[-0.045em] lowercase">
            {prelude}
          </p>
          <h1 className="mt-2 text-[clamp(3.5rem,10vw,9.5rem)] leading-[0.86] font-semibold tracking-[-0.065em] uppercase">
            {title}
          </h1>
        </div>
        <div className="justify-self-start lg:justify-self-end">{children}</div>
      </main>
    </div>
  );
}
