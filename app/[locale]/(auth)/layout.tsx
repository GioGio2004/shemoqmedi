import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ClerkProvider } from "@/components/clerk-provider";
import ConvexClientProvider from "@/components/ConvexClientProvider";

// Clerk + Convex are mounted only for the pages that need a session
// (sign-in, sign-up, account), so the public pages stay light.
export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const messages = await getMessages();

  return (
    <ClerkProvider>
      {/* Only the namespace client components here actually use. */}
      <NextIntlClientProvider messages={{ account: messages.account }}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </NextIntlClientProvider>
    </ClerkProvider>
  );
}
