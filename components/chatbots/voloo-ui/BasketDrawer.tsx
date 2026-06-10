import { X, ShoppingBag, Trash2, Minus, Plus, Loader2 } from "lucide-react";
import Image from "next/image";
import { CafeTheme, BasketItem } from "./types";

interface BasketDrawerProps {
  isBasketOpen: boolean;
  setIsBasketOpen: (open: boolean) => void;
  basket: BasketItem[];
  basketCount: number;
  basketTotal: number;
  theme: CafeTheme;
  updateQuantity: (productId: number, quantity: number) => void;
  handlePlaceOrder: () => void;
  isPlacingOrder: boolean;
  orderSuccess: boolean;
  seatNumber: string;
  setSeatNumber: (seat: string) => void;
}

export function BasketDrawer({
  isBasketOpen,
  setIsBasketOpen,
  basket,
  basketCount,
  basketTotal,
  theme,
  updateQuantity,
  handlePlaceOrder,
  isPlacingOrder,
  orderSuccess,
  seatNumber,
  setSeatNumber,
}: BasketDrawerProps) {
  return (
    <div
      className="absolute inset-y-0 right-0 z-20 flex flex-col"
      style={{
        width: "min(360px, 100%)",
        transform: isBasketOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
        backgroundColor: `${theme.backgroundColor}f0`,
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        borderLeft: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "-24px 0 80px rgba(0,0,0,0.5)",
      }}
    >
      {/* Drawer Header */}
      <div
        className="flex items-center justify-between px-5 pb-[14px] pt-[calc(env(safe-area-inset-top)+14px)] shrink-0"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backgroundColor: `${theme.backgroundColor}cc`,
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center gap-2">
          <ShoppingBag
            className="w-4 h-4"
            style={{ color: theme.primaryColorLight }}
          />
          <span
            className="font-black text-sm uppercase tracking-tight"
            style={{ color: theme.textColor }}
          >
            Order
          </span>
          {basketCount > 0 && (
            <span
              className="px-1.5 py-0.5 rounded-full text-white text-[9px] font-black"
              style={{ backgroundColor: theme.primaryColor }}
            >
              {basketCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsBasketOpen(false)}
          aria-label="Close basket"
          className="p-1 rounded-lg hover:bg-white/5 transition-colors duration-150 text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Body — scrollable item list */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-3 space-y-2">
        {basket.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${theme.primaryColor}26, ${theme.primaryColorLight}0d)`,
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <ShoppingBag
                className="w-6 h-6 opacity-30"
                style={{ color: theme.primaryColorLight }}
              />
            </div>
            <p
              className="text-xs font-semibold opacity-30 text-center"
              style={{ color: theme.textColor }}
            >
              Your basket is empty.
              <br />
              Tap <strong>ADD</strong> on any product card.
            </p>
          </div>
        ) : (
          /* Item rows */
          basket.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-2.5 rounded-xl transition-colors duration-150"
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Thumbnail */}
              <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="44px"
                />
              </div>

              {/* Name + price */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-bold truncate"
                  style={{ color: theme.textColor }}
                >
                  {product.name}
                </p>
                <p
                  className="text-[10px] font-mono opacity-50"
                  style={{ color: theme.textColor }}
                >
                  ${(product.price * quantity).toFixed(2)}
                </p>
              </div>

              {/* Quantity controls — bigger touch targets */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  aria-label="Decrease quantity"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-150"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.07)",
                    color: theme.textColor,
                  }}
                >
                  {quantity === 1 ? (
                    <Trash2
                      className="w-3.5 h-3.5"
                      style={{ color: "#ef4444" }}
                    />
                  ) : (
                    <Minus className="w-3.5 h-3.5" />
                  )}
                </button>

                <span
                  className="w-6 text-center text-sm font-black tabular-nums"
                  style={{ color: theme.textColor }}
                >
                  {quantity}
                </span>

                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  aria-label="Increase quantity"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-150"
                  style={{
                    backgroundColor: `${theme.primaryColor}33`,
                    color: theme.primaryColorLight,
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Drawer Footer — total + Send Order */}
      {basket.length > 0 && (
        <div
          className="shrink-0 px-4 py-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Total row */}
          <div className="flex justify-between items-center mb-4">
            <span
              className="text-xs font-bold uppercase tracking-widest opacity-40"
              style={{ color: theme.textColor }}
            >
              Total
            </span>
            <span
              className="text-base font-black font-mono"
              style={{ color: theme.primaryColorLight }}
            >
              ${basketTotal.toFixed(2)}
            </span>
          </div>

          {orderSuccess ? (
            <div className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider text-white text-center bg-green-500/20 border border-green-500/50 text-green-400">
              Order Placed!
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Seat No."
                  value={seatNumber}
                  onChange={(e) => setSeatNumber(e.target.value)}
                  className="w-24 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-center outline-none focus:border-white/30"
                  style={{ color: theme.textColor }}
                  min="1"
                  max="100"
                />
                <button
                  onClick={handlePlaceOrder}
                  disabled={!seatNumber || isPlacingOrder}
                  className="flex-1 py-3 rounded-xl font-black text-sm uppercase tracking-wider text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColorLight})`,
                    boxShadow: `0 8px 32px ${theme.primaryColor}50`,
                  }}
                >
                  {isPlacingOrder ? (
                    <Loader2 className="w-4 h-4 mx-auto animate-spin" />
                  ) : (
                    "Place Order"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
