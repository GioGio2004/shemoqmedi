"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const t = useTranslations("Navbar");
  const { isSignedIn } = useUser();
  const pathname = usePathname();

  // Helper to switch language
  // This replaces the current locale (e.g. /en/...) with the new one (e.g. /ka/...)
  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale; // Replace 'en' or 'ka'
    return segments.join("/");
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-900 text-white">
      {/* Logo */}
      <div className="text-xl font-bold">
        <Link href="/">{t("brand")}</Link>
      </div>

      {/* Navigation Links */}
      <div className="flex gap-4">
        <Link href="/" className="hover:text-gray-300">
          {t("home")}
        </Link>
        {/* Add more links here */}
      </div>

      {/* Right Side: Lang Switcher + Auth */}
      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <div className="flex gap-2 text-sm">
          <Link href={switchLocale("en")} className="hover:underline">🇺🇸 EN</Link>
          <span className="text-gray-500">|</span>
          <Link href={switchLocale("ka")} className="hover:underline">🇬🇪 KA</Link>
        </div>

        {/* Auth Buttons */}
        {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <SignInButton mode="modal">
            <button className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 transition">
              {t("signIn")}
            </button>
          </SignInButton>
        )}
      </div>
    </nav>
  );
}