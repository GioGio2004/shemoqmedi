import { Logo } from "@/components/site/Logo";

/** Centered frame shared by the sign-in and sign-up pages. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-beige px-4 py-10">
      <Logo className="text-2xl" />
      {children}
    </main>
  );
}
