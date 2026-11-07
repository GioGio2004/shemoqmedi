import { Logo } from "@/components/site/Logo";

/** Centered frame shared by the sign-in and sign-up pages. */
export function AuthShell({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-beige px-4 py-10">
      <Logo locale={locale} className="text-2xl" />
      {children}
    </main>
  );
}
