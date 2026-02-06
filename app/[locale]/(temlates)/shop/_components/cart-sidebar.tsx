"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { X, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "./cart-context";

export function CartSidebar() {
  const t = useTranslations("ShopTemplate.Cart");
  const locale = useLocale();
  const { isOpen, toggleCart, items, removeItem, total } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleCart}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white/90 backdrop-blur-2xl z-[70] shadow-2xl transition-transform duration-500 ease-out border-l border-white/50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">{t("title")}</h2>
            <button
              onClick={toggleCart}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <p>{t("empty")}</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-blue-600 font-bold">${item.price * item.quantity}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="pt-6 border-t border-gray-200 mt-auto">
              <div className="flex justify-between items-center mb-6 text-xl font-bold">
                <span>{t("total")}</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Link 
                href={`/${locale}/shop/checkout`}
                onClick={toggleCart}
                className="w-full py-4 rounded-xl bg-black text-white font-bold text-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                {t("checkout")} <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
