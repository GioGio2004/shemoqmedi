"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../convex-helpers-api";
import { useMultiplayer } from "./MultiplayerContext";
import { Lock } from "lucide-react";

interface CheckoutDoubleCheckModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CheckoutDoubleCheckModal({
  isOpen,
  onConfirm,
  onCancel,
}: CheckoutDoubleCheckModalProps) {
  const { sessionId, isDineIn } = useMultiplayer();

  const session = useQuery(
    api.tableSessions.getSession,
    sessionId ? { sessionId: sessionId as any } : "skip",
  );
  const guestCount = session?.activeGuestIds?.length || 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl pointer-events-auto text-center"
            >
              {isDineIn ? (
                <>
                  <h2 className="text-2xl font-medium tracking-tight mb-2 text-black">
                    Are you sure?
                  </h2>
                  <p className="text-zinc-500 mb-8 leading-relaxed text-sm">
                    Sending order for {guestCount}{" "}
                    {guestCount === 1 ? "person" : "people"}. Is everyone ready?
                  </p>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={onConfirm}
                      className="w-full bg-black text-white py-4 rounded-xl font-medium tracking-wide hover:bg-zinc-800 transition-colors active:scale-[0.98]"
                    >
                      Send to Kitchen
                    </button>
                    <button
                      onClick={onCancel}
                      className="w-full bg-white text-black py-4 rounded-xl font-medium tracking-wide border border-black hover:bg-zinc-50 transition-colors active:scale-[0.98]"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-6 h-6 text-zinc-400" />
                  </div>
                  <h2 className="text-2xl font-medium tracking-tight mb-2 text-black">
                    Dine-In Required
                  </h2>
                  <p className="text-zinc-500 mb-8 leading-relaxed text-sm">
                    To send orders to the kitchen, please visit us in person and
                    tap the NFC tag at your table.
                  </p>

                  <button
                    onClick={onCancel}
                    className="w-full bg-black text-white py-4 rounded-xl font-medium tracking-wide hover:bg-zinc-800 transition-colors active:scale-[0.98]"
                  >
                    Got it
                  </button>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
