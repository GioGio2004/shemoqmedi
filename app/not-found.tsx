import { Logo } from "@/components/site/Logo";
import { ButtonLink } from "@/components/site/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 px-4 text-center">
      <Logo />
      <p className="text-7xl font-semibold tracking-[-0.05em]">404</p>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="text-ink-soft">This page doesn&apos;t exist (anymore).</p>
      <ButtonLink href="/">Back home</ButtonLink>
    </main>
  );
}
