"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ShoppingBag, Search, LayoutDashboard } from "lucide-react";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { useCart } from "./cart-context";

export function ShopNavbar() {
  const t = useTranslations("ShopTemplate.Navbar");
  const { toggleCart, items } = useCart();
  const locale = useLocale();
  const { user, isSignedIn } = useUser();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const categories = [
    { key: "all", label: t("categories.all") },
    { key: "tech", label: t("categories.tech") },
    { key: "art", label: t("categories.art") },
    { key: "fashion", label: t("categories.fashion") },
  ];

  const allowedEmail = "khvichia42@gmail.com";
  const isAdmin = user?.primaryEmailAddress?.emailAddress === allowedEmail;

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 rounded-full border border-white/40 bg-white/30 backdrop-blur-xl shadow-lg shadow-black/5 px-6 py-4 flex items-center justify-between">
      {/* Brand */}
      <div className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        <Link href={`/${locale}/shop`}>{t("brand")}</Link>
      </div>

      {/* Categories (Desktop) */}
      <div className="hidden md:flex items-center gap-1 bg-white/20 p-1 rounded-full border border-white/20">
        {categories.map((cat) => (
          <button
            key={cat.key}
            className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-white hover:text-black transition-all"
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {isAdmin && (
           <Link 
             href={`/${locale}/shop/admin`}
             className="px-4 py-2 bg-red-600 text-white rounded-full text-xs font-bold flex items-center gap-2 hover:bg-red-700 transition-colors"
           >
             <LayoutDashboard className="w-4 h-4" /> Admin
           </Link>
        )}

        <button className="p-2 rounded-full hover:bg-white/40 text-gray-600 transition-colors">
          <Search className="w-5 h-5" />
        </button>
        
        <button 
            onClick={toggleCart}
            className="relative p-2 rounded-full bg-black text-white hover:bg-blue-600 transition-colors shadow-lg"
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold border-2 border-white">
              {cartCount}
            </span>
          )}
        </button>

        {isSignedIn ? (
          <UserButton />
        ) : (
          <SignInButton mode="modal">
            <button className="text-sm font-bold hover:underline">Sign In</button>
          </SignInButton>
        )}
      </div>
    </nav>
  );
}
