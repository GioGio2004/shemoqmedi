import type { Metadata } from "next";
import { UserButton } from "@clerk/nextjs";
import { CurrentUserCard } from "@/components/auth/CurrentUserCard";
import { Logo } from "@/components/site/Logo";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

// Protected by proxy.ts (requires a Clerk session).
export default function AccountPage() {
  return (
    <div className="min-h-dvh">
      <header className="border-b">
        <div className="container-site flex h-16 items-center justify-between">
          <Logo />
          <UserButton />
        </div>
      </header>
      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your account</h1>
          <p className="text-muted-foreground">You are registered. Submissions open soon.</p>
        </div>
        <CurrentUserCard />
      </main>
    </div>
  );
}
