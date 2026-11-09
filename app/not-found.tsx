import { PillLink } from "@/components/site/ui";

export default function NotFound() {
  return (
    <div className="min-h-dvh">
      {/* Room for the fixed navbar (app/layout.tsx). */}
      <div aria-hidden="true" className="h-20 md:h-[88px]" />
      <main id="main-content" className="container-site pt-16 pb-24">
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
