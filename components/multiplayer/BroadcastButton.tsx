"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Share } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useMutation } from "convex/react";
import { api } from "../../convex-helpers-api";
import { useMultiplayer } from "./MultiplayerContext";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface BroadcastButtonProps {
  itemName: string;
  theme?: {
    primaryColor?: string;
    textColor?: string;
  };
}

export function BroadcastButton({ itemName, theme }: BroadcastButtonProps) {
  const { sessionId, guestId: localGuestId, isDineIn } = useMultiplayer();
  const [cooldown, setCooldown] = useState(0);
  const broadcast = useMutation(api.tableSessions.broadcastSuggestion);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Don't render for online-only users
  if (!isDineIn) return null;

  const handlePress = () => {
    if (cooldown > 0 || !sessionId || !localGuestId) return;
    
    broadcast({ 
      sessionId: sessionId as any, 
      itemName, 
      suggestedBy: localGuestId 
    }).catch(console.error);

    setCooldown(15);
  };

  const isCoolingDown = cooldown > 0;
  
  const accent = theme?.primaryColor || "#ea580c";
  const text = theme?.textColor || "#ffffff";

  return (
    <button
      onClick={handlePress}
      disabled={isCoolingDown || !sessionId || !localGuestId}
      className={cn(
        "relative flex items-center justify-center gap-2 w-full py-3 rounded-xl overflow-hidden transition-all duration-300",
        isCoolingDown || !sessionId || !localGuestId
          ? "cursor-not-allowed opacity-50"
          : "active:scale-[0.98] hover:brightness-110"
      )}
      style={{
        backgroundColor: isCoolingDown || !sessionId || !localGuestId ? `${text}1a` : `${accent}1a`,
        color: isCoolingDown || !sessionId || !localGuestId ? `${text}88` : accent,
        border: `1px solid ${isCoolingDown || !sessionId || !localGuestId ? `${text}1a` : `${accent}33`}`,
        backdropFilter: "blur(12px) saturate(150%)",
        WebkitBackdropFilter: "blur(12px) saturate(150%)",
      }}
      aria-label={`Suggest ${itemName} to table`}
    >
      <Share className="w-4 h-4" />
      <span className="text-xs font-bold uppercase tracking-widest">
        {isCoolingDown ? `Wait ${cooldown}s` : "Suggest to Table"}
      </span>
      {/* Visual Cooldown Bar Indicator */}
      {isCoolingDown && (
        <motion.div
          className="absolute bottom-0 left-0 h-[2px]"
          style={{ backgroundColor: `${text}44` }}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 15, ease: "linear" }}
        />
      )}
    </button>
  );
}
