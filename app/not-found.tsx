import { PillLink, Wordmark } from "@/components/site/ui";

export default function NotFound() {
  return (
    <div className="min-h-dvh">
      <header className="container-site flex h-20 items-center md:h-[88px]">
        <Wordmark />
      </header>
      <main className="container-site pt-16 pb-24">
        <p className="text-[clamp(1.75rem,4vw,3.5rem)] leading-none font-medium tracking-[-0.045em] lowercase">
          page not found
        </p>
        <h1 className="mt-2 text-[clamp(5rem,20vw,18rem)] leading-[0.86] font-semibold tracking-[-0.065em]">
          404
        </h1>
        <div className="mt-10">
          <PillLink href="/">All websites</PillLink>
        </div>
      </main>
    </div>
  );
}
