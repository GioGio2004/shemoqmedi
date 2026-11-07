import { ClerkProvider } from "@/components/clerk-provider";
import ConvexClientProvider from "@/components/ConvexClientProvider";

// Clerk + Convex are mounted only for the pages that need a session
// (sign-in, sign-up, account), so the public pages stay light.
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </ClerkProvider>
  );
}
