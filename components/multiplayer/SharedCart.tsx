"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Users, Lock, Plus, Minus, Trash2, CheckCircle2, Clock } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex-helpers-api";
import { useMultiplayer } from "./MultiplayerContext";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  guestId?: string;
  image?: string;
}

interface SharedCartTheme {
  primaryColor: string;
  primaryColorLight: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  accentGlow: string;
}

interface SharedCartProps {
  isOpen: boolean;
  onClose: () => void;
  /** Locally-added basket items for online-only users (single-user basket) */
  localBasketItems?: CartItem[];
  onCheckout: (guestCount: number, items: CartItem[], total: number) => void;
  /** Theme pulled from the DB — matches the AI chatbot's look */
  theme?: SharedCartTheme;
  updateQuantity?: (productId: number, quantity: number) => void;
}

export function SharedCart({
  isOpen,
  onClose,
  localBasketItems = [],
  onCheckout,
  theme,
  updateQuantity,
}: SharedCartProps) {
  const { guestId: localGuestId, sessionId, isDineIn } = useMultiplayer();
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Fallback theme (dark) ──────────────────────────────────────────────────
  const t = {
    primaryColor: theme?.primaryColor || "#ea580c",
    primaryColorLight: theme?.primaryColorLight || "#ea580ccc",
    backgroundColor: theme?.backgroundColor || "#09090b",
    surfaceColor: theme?.surfaceColor || "rgba(24,24,27,0.88)",
    textColor: theme?.textColor || "#e4e4e7",
    accentGlow: theme?.accentGlow || "rgba(249,115,22,0.08)",
  };

  // ── Real-time Convex queries (only fire for dine-in guests) ────────────────
  const session = useQuery(
    api.tableSessions.getSession,
    sessionId ? { sessionId: sessionId as any } : "skip",
  );

  const sessionOrders = useQuery(
    api.tableSessions.getSessionOrders,
    sessionId ? { sessionId: sessionId as any } : "skip"
  );
  
  const pendingOrders = (sessionOrders || []).filter((o: any) => o.status === "pending");

  // ── Build item lists ─────────────────────────────────────────────────────────
  const items: CartItem[] = [];

  if (isDineIn && session?.cartItems) {
    session.cartItems.forEach((item: any) => {
      items.push({
        id: String(item.id),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        guestId: item.guestId,
        image: item.image,
      });
    });
  } else if (!isDineIn) {
    items.push(...localBasketItems);
  }

  const activeGuestIds = session?.activeGuestIds || [];

  const myItems = isDineIn
    ? items.filter(
        (item) => item.guestId === localGuestId || !item.guestId,
      )
    : items;

  const otherItems = isDineIn
    ? items.filter(
        (item) =>
          item.guestId &&
          item.guestId !== localGuestId &&
          activeGuestIds.includes(item.guestId),
      )
    : [];

  const calculateTotal = (cartItems: CartItem[]) =>
    cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const myTotal = calculateTotal(myItems);
  const tableTotal = calculateTotal(otherItems);
  const grandTotal = myTotal + tableTotal;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md shadow-2xl z-50 flex flex-col"
            style={{
              backgroundColor: `${t.backgroundColor}f0`,
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
              borderLeft: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "-24px 0 80px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 pb-4 pt-[calc(env(safe-area-inset-top)+16px)] shrink-0"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                backgroundColor: `${t.backgroundColor}cc`,
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" style={{ color: t.primaryColorLight }} />
                <h2
                  className="text-base font-black uppercase tracking-tight"
                  style={{ color: t.textColor }}
                >
                  {isDineIn ? "Shared Order" : "Your Order"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors duration-150"
                style={{ color: `${t.textColor}99` }}
                aria-label="Close Cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-10 scrollbar-hide [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {/* My Order Section */}
              <section>
                <div
                  className="flex items-center gap-2 mb-4 pb-2"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    color: t.textColor,
                  }}
                >
                  <ShoppingBag className="w-4 h-4" style={{ color: t.primaryColor }} />
                  <h3 className="text-[11px] font-bold uppercase tracking-widest">
                    My Order
                  </h3>
                </div>
                {myItems.length === 0 ? (
                  <p className="text-sm italic" style={{ color: `${t.textColor}66` }}>
                    Your list is empty.
                  </p>
                ) : (
                  <ul className="space-y-6">
                    {myItems.map((item, idx) => (
                      <li
                        key={`${item.id}-${idx}`}
                        className="flex flex-col gap-3"
                      >
                        <div className="flex justify-between items-start gap-3">
                          {/* Image */}
                          {item.image && item.image !== "/placeholder.svg" ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover shrink-0"
                              style={{ border: `1px solid ${t.primaryColor}22` }}
                            />
                          ) : (
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${t.primaryColor}11`, border: `1px solid ${t.primaryColor}22` }}
                            >
                              ☕
                            </div>
                          )}
                          
                          <div className="flex-1 flex flex-col pt-0.5">
                            <span className="text-sm font-bold leading-tight line-clamp-2" style={{ color: t.textColor }}>
                              {item.name}
                            </span>
                            <span className="font-medium mt-1 text-sm" style={{ color: t.primaryColor }}>
                              {item.price.toFixed(2)}₾
                            </span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 ml-[60px]">
                          <button
                            onClick={() => updateQuantity?.(Number(item.id), item.quantity - 1)}
                            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
                            style={{ backgroundColor: `${t.textColor}11`, color: t.textColor }}
                          >
                            {item.quantity === 1 ? (
                              <Trash2 className="w-3 h-3 text-red-400" />
                            ) : (
                              <Minus className="w-3 h-3" />
                            )}
                          </button>
                          <span className="w-6 text-center text-sm font-medium" style={{ color: t.textColor }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity?.(Number(item.id), item.quantity + 1)}
                            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
                            style={{ backgroundColor: `${t.primaryColor}22`, color: t.primaryColor }}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Table's Order Section — only visible for dine-in */}
              {isDineIn && (
                <section>
                  <div
                    className="flex items-center gap-2 mb-4 pb-2"
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      color: t.textColor,
                    }}
                  >
                    <Users className="w-4 h-4" style={{ color: t.primaryColor }} />
                    <h3 className="text-[11px] font-bold uppercase tracking-widest">
                      Table&apos;s Order
                    </h3>
                  </div>
                  {otherItems.length === 0 ? (
                    <p className="text-sm italic" style={{ color: `${t.textColor}66` }}>
                      No items from others yet.
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {otherItems.map((item, idx) => (
                        <li
                          key={`${item.id}-${idx}`}
                          className="flex justify-between items-center text-sm gap-3"
                        >
                          {item.image && item.image !== "/placeholder.svg" ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-8 h-8 rounded-md object-cover shrink-0 opacity-80 grayscale"
                            />
                          ) : (
                            <div
                              className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 opacity-50"
                              style={{ backgroundColor: `${t.textColor}11` }}
                            >
                              ☕
                            </div>
                          )}
                          <div className="flex-1 flex gap-2 items-baseline">
                            <span className="font-medium" style={{ color: `${t.textColor}88` }}>
                              {item.quantity}x
                            </span>
                            <span className="line-clamp-1" style={{ color: `${t.textColor}77` }}>{item.name}</span>
                          </div>
                          <span className="font-medium shrink-0" style={{ color: `${t.textColor}88` }}>
                            {item.price.toFixed(2)}₾
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

              {/* Sent Orders History Section */}
              {isDineIn && pendingOrders.length > 0 && (
                <section>
                  <div
                    className="flex items-center gap-2 mb-4 pb-2"
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      color: t.textColor,
                    }}
                  >
                    <Clock className="w-4 h-4" style={{ color: t.primaryColor }} />
                    <h3 className="text-[11px] font-bold uppercase tracking-widest">
                      Sent Orders
                    </h3>
                  </div>
                  <ul className="space-y-6">
                    {pendingOrders.map((order: any, orderIdx: number) => (
                      <li key={order._id} className="flex flex-col gap-3">
                        <div className="flex items-center justify-between opacity-50">
                          <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: t.textColor }}>
                            Order #{orderIdx + 1}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: t.primaryColor }}>
                            Preparing
                          </span>
                        </div>
                        <ul className="space-y-3 pl-2" style={{ borderLeft: `1px solid rgba(255,255,255,0.05)` }}>
                          {order.items.map((item: any, idx: number) => (
                            <li key={idx} className="flex justify-between items-baseline text-sm gap-3 opacity-60">
                              <div className="flex-1 flex gap-2">
                                <span className="font-medium" style={{ color: `${t.textColor}88` }}>
                                  {item.quantity}x
                                </span>
                                <span className="line-clamp-1" style={{ color: `${t.textColor}77` }}>{item.name}</span>
                              </div>
                              <span className="font-medium shrink-0" style={{ color: `${t.textColor}88` }}>
                                {item.price.toFixed(2)}₾
                              </span>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Footer Summary */}
            <div
              className="p-6"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                backgroundColor: `${t.backgroundColor}cc`,
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: `${t.textColor}88` }}
                >
                  Grand Total
                </span>
                <span
                  className="text-2xl font-medium tracking-tight"
                  style={{ color: t.primaryColor }}
                >
                  {grandTotal.toFixed(2)}₾
                </span>
              </div>

              {isDineIn ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={items.length === 0}
                  className="w-full py-4 rounded-xl font-medium tracking-wide transition-all duration-200 active:scale-[0.98]"
                  style={{
                    backgroundColor: items.length > 0 ? t.primaryColor : "rgba(255,255,255,0.06)",
                    color: items.length > 0 ? "#fff" : `${t.textColor}44`,
                    cursor: items.length > 0 ? "pointer" : "not-allowed",
                  }}
                >
                  Review &amp; Send Order
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-4 rounded-xl font-medium tracking-wide cursor-not-allowed flex items-center justify-center gap-2.5 opacity-90"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    color: `${t.textColor}66`,
                  }}
                >
                  <Lock className="w-4 h-4" />
                  Available for Dine-In Only
                </button>
              )}
            </div>
          </motion.div>

          {/* Readiness Confirmation Popup */}
          <AnimatePresence>
            {showConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                onClick={() => setShowConfirm(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center"
                  style={{
                    backgroundColor: t.backgroundColor,
                    border: `1px solid ${t.primaryColor}33`,
                    boxShadow: `0 20px 40px rgba(0,0,0,0.5), 0 0 40px ${t.primaryColor}15`
                  }}
                >
                  <div 
                    className="w-16 h-16 rounded-full mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${t.primaryColor}1a`, color: t.primaryColor }}
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black mb-2" style={{ color: t.textColor }}>
                    Are you guys ready?
                  </h3>
                  <p className="text-sm mb-8" style={{ color: `${t.textColor}99` }}>
                    This will send the entire table's order directly to the kitchen. Please confirm that everyone is finished ordering.
                  </p>
                  
                  <div className="flex w-full gap-3">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 py-3.5 rounded-xl font-bold transition-all"
                      style={{ backgroundColor: `${t.textColor}1a`, color: t.textColor }}
                    >
                      Wait, not yet
                    </button>
                    <button
                      onClick={() => {
                        setShowConfirm(false);
                        onCheckout(activeGuestIds.length, items, grandTotal);
                      }}
                      className="flex-1 py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                      style={{ backgroundColor: t.primaryColor, color: "#fff" }}
                    >
                      Yes, Send it!
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}

