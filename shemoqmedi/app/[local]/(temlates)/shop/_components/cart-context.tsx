"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  colors?: string[];
}

interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  productId?: Id<"products">; // Store original ID for reference
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  toggleCart: () => void;
  addItem: (product: Product & { selectedColor?: string }) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  // Initialize Session
  useEffect(() => {
    let sid = localStorage.getItem("shop_session_id");
    if (!sid) {
      sid = Math.random().toString(36).substring(7);
      localStorage.setItem("shop_session_id", sid);
    }
    setSessionId(sid);
  }, []);

  // Convex Hooks
  const remoteCart = useQuery(api.shop.getCart, sessionId ? { sessionId } : "skip");
  const syncCart = useMutation(api.shop.syncCart);
  
  // Local state for optimistic updates
  const [localItems, setLocalItems] = useState<CartItem[]>([]);

  // Sync remote to local when it loads
  useEffect(() => {
    if (remoteCart) {
      setLocalItems(remoteCart.map((item: any) => ({
        ...item,
        id: item._id, // Map Convex ID
        productId: item._id as Id<"products">
      } as CartItem)));
    }
  }, [remoteCart]);

  const toggleCart = () => setIsOpen((prev) => !prev);

  const pushToBackend = (newItems: CartItem[]) => {
    if (!sessionId) return;
    const payload = newItems.map(item => ({
       productId: (item.productId || item.id) as Id<"products">,
       quantity: item.quantity,
       selectedColor: item.selectedColor
    }));
    syncCart({ sessionId, items: payload });
  };

  const addItem = (product: Product & { selectedColor?: string }) => {
    setLocalItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let newItems;
      if (existing) {
        newItems = prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...prev, { ...product, quantity: 1, productId: product.id as Id<"products"> }];
      }
      pushToBackend(newItems);
      return newItems;
    });
    setIsOpen(true);
  };

  const removeItem = (id: string) => {
    setLocalItems((prev) => {
       const newItems = prev.filter((item) => item.id !== id);
       pushToBackend(newItems);
       return newItems;
    });
  };

  const clearCart = () => {
    setLocalItems([]);
    if(sessionId) syncCart({ sessionId, items: [] });
  }

  const total = localItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items: localItems, isOpen, toggleCart, addItem, removeItem, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
