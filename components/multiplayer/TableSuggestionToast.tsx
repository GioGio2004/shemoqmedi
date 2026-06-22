"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex-helpers-api";
import { useMultiplayer } from "./MultiplayerContext";

interface TableSuggestionToastProps {
  catalog: any[];
  themeSettings?: {
    primaryColor: string;
    backgroundColor?: string;
    textColor?: string;
  } | null;
}

function hashId(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function TableSuggestionToast({
  catalog,
  themeSettings,
}: TableSuggestionToastProps) {
  const { sessionId, guestId: localGuestId, isDineIn } = useMultiplayer();

  // ── Theme from DB ──────────────────────────────────────────────────────────
  const bg = themeSettings?.backgroundColor || "#09090b";
  const text = themeSettings?.textColor || "#e4e4e7";
  const accent = themeSettings?.primaryColor || "#ea580c";

  const session = useQuery(
    api.tableSessions.getSession,
    sessionId ? { sessionId: sessionId as any } : "skip",
  );
  
  const [isVisible, setIsVisible] = useState(false);
  const [suggestedItemName, setSuggestedItemName] = useState("");
  const [suggestedProduct, setSuggestedProduct] = useState<any>(null);

  useEffect(() => {
    if (!session?.latestSuggestion || !localGuestId) return;
    
    const { itemName, suggestedBy, timestamp } = session.latestSuggestion;
    const isNew = Date.now() - timestamp < 15000;
    
    if (isNew && suggestedBy !== localGuestId) {
      setSuggestedItemName(itemName);
      
      // Flatten the categories array to find the item
      let foundDbItem: any = null;
      let foundCategoryName = "";
      
      for (const category of catalog) {
        const item = category.items?.find((p: any) => {
           const pName = p.name["en"] || Object.values(p.name)[0] || "Unknown";
           return pName === itemName;
        });
        if (item) {
          foundDbItem = item;
          foundCategoryName = category.name["en"] || Object.values(category.name)[0] || "Item";
          break;
        }
      }

      if (foundDbItem) {
        // Map to VolooAI Product type
        const aiProduct = {
          id: hashId(foundDbItem._id),
          name: itemName,
          category: foundCategoryName,
          price: foundDbItem.price / 100,
          image: foundDbItem.imageUrl || "/placeholder.svg",
          description: foundDbItem.description
            ? (typeof foundDbItem.description === "string"
                ? foundDbItem.description
                : foundDbItem.description["en"] || Object.values(foundDbItem.description)[0] || "")
            : "",
        };
        setSuggestedProduct(aiProduct);
      } else {
        setSuggestedProduct(null);
      }
      setIsVisible(true);
    }
  }, [session?.latestSuggestion, localGuestId, catalog]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setIsVisible(false), 8000); // 8 seconds before auto close
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Don't render for online-only users
  if (!isDineIn) return null;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (suggestedProduct) {
      window.dispatchEvent(
        new CustomEvent("add-to-voloo-basket", { detail: { product: suggestedProduct } })
      );
    }
    setIsVisible(false);
  };

  const handleOpenDetail = () => {
    if (suggestedProduct) {
      window.dispatchEvent(
        new CustomEvent("open-product-detail", { detail: { product: suggestedProduct } })
      );
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: "-100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-24 left-4 z-[100] flex flex-col p-4 rounded-2xl shadow-2xl min-w-[300px] max-w-[90vw] cursor-pointer transition-all duration-200"
          style={{
            backgroundColor: `${bg}f0`,
            color: text,
            border: `1px solid ${accent}33`,
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${accent}15`,
          }}
          onClick={handleOpenDetail}
        >
          {/* Header & Close Button */}
          <div className="flex items-center justify-between mb-3 w-full">
            <p
              className="text-[10px] uppercase tracking-widest font-semibold"
              style={{ color: accent }}
            >
              Someone suggests
            </p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
              }}
              className="transition-colors p-1 rounded-full"
              style={{
                color: `${text}88`,
                backgroundColor: `${text}0d`,
              }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {suggestedProduct?.image && suggestedProduct.image !== "/placeholder.svg" ? (
              <img 
                src={suggestedProduct.image} 
                alt={suggestedItemName} 
                className="w-12 h-12 object-cover rounded-xl shrink-0"
                style={{
                  border: `1px solid ${accent}33`,
                  backgroundColor: `${bg}cc`,
                }}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl"
                style={{
                  backgroundColor: `${accent}1a`,
                  border: `1px solid ${accent}33`,
                }}
              >
                ☕
              </div>
            )}
            
            <div className="flex-1 pr-2">
              <p className="text-sm font-bold line-clamp-2 leading-tight" style={{ color: text }}>
                {suggestedItemName}
              </p>
            </div>

            <button
              onClick={handleAdd}
              disabled={!suggestedProduct}
              className="flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl text-xs font-bold transition-colors active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: accent,
                color: "#fff",
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
