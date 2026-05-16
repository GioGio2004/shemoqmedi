"use client";

import { useState, useRef, useEffect, useCallback, memo, startTransition } from "react";
import { X, Send, Sparkles, Loader2, ArrowDownToLine, Eye, ShoppingBag, Plus, Minus, Trash2, RefreshCw, Star, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProductCard } from "@/components/chatbots/product-card-chat";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
// ─── Convex ────────────────────────────────────────────────────────────────────
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex-helpers-api";

gsap.registerPlugin(ScrollTrigger);

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A single chat turn — shape shared between the Convex `messages` table
 * and local optimistic state used for instant UI feedback.
 */
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  products?: number[];
}

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  color: string;
  allergens?: string[];
  ingredients?: string;
  nutrition?: {
    calories: number;
    carbs: string;
    sugar: string;
    fat: string;
    sodium: string;
    caffeine: string;
    isGlutenFree: boolean;
  };
}

/**
 * Visual design tokens controlled by the cafe owner.
 * Every colour in the widget is derived from these values — no hardcoded
 * orange or zinc values survive in the JSX.
 */
export interface CafeTheme {
  /** Primary action colour, e.g. "#ea580c" (orange-600) */
  primaryColor: string;
  /** Lighter accent colour, e.g. "#f97316" (orange-500) */
  primaryColorLight: string;
  /** Full-screen overlay background, e.g. "#09090b" */
  backgroundColor: string;
  /** Floating pill / surface background, e.g. "rgba(24,24,27,0.88)" */
  surfaceColor: string;
  /** Main body text colour, e.g. "#e4e4e7" */
  textColor: string;
  /** Subtle inner glow applied to accented elements, e.g. "rgba(249,115,22,0.08)" */
  accentGlow: string;
}

/**
 * Per-tenant configuration passed as a single prop to Coffee3.
 * One config object completely controls the widget's identity and look.
 */
export interface CafeConfig {
  /** Unique tenant slug stored alongside every message in Convex */
  cafeId: string;
  /** Displayed in the chat header, e.g. "Voloo AI" */
  brandName: string;
  theme: CafeTheme;
}

interface VolooAIChatProps {
  apiEndpoint?: string;
  localizedProducts?: Product[];
  /** Required — controls branding, colours, and Convex tenant isolation */
  cafeConfig: CafeConfig;
}

/**
 * A single item in the user's order basket.
 * Quantity is stored separately from the Product so we never mutate the catalog.
 */
interface BasketItem {
  product: Product;
  quantity: number;
}

// ─── Storage keys ──────────────────────────────────────────────────────────────
const CONTEXT_KEY = "voloo_chat_selected_context";
const BASKET_KEY = "voloo_order_basket";

// ─── FormatMessage ─────────────────────────────────────────────────────────────
// Accepts `accentColor` from the parent's theme so bold text uses the
// cafe's brand colour instead of a hardcoded orange.
const FormatMessage = memo(
  ({ content, accentColor }: { content: string; accentColor: string }) => {
    if (!content) return null;
    return (
      <div className="space-y-1.5">
        {content.split("\n").map((line, i) => {
          if (!line.trim()) return <div key={i} className="h-1" />;
          return (
            <p key={i} className="leading-relaxed text-sm">
              {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <span key={j} className="font-bold" style={{ color: accentColor }}>
                      {part.slice(2, -2)}
                    </span>
                  );
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    );
  }
);
FormatMessage.displayName = "FormatMessage";

// ─── ContextChip ──────────────────────────────────────────────────────────────
// A compact, removable chip that sits above the floating input pill.
const ContextChip = memo(
  ({
    product,
    onRemove,
  }: {
    product: Product;
    onRemove: (id: number) => void;
  }) => {
    const chipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!chipRef.current) return;
      // Entrance: fade in + slide up from the input pill
      gsap.fromTo(
        chipRef.current,
        { opacity: 0, y: 8, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.8)" }
      );
    }, []);

    const handleRemove = () => {
      if (!chipRef.current) {
        onRemove(product.id);
        return;
      }
      // Exit animation before removing from state
      gsap.to(chipRef.current, {
        opacity: 0,
        scale: 0.85,
        y: 4,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => onRemove(product.id),
      });
    };

    return (
      <div
        ref={chipRef}
        className="flex items-center gap-1.5 pl-0.5 pr-1.5 py-0.5 rounded-full"
        style={{
          backgroundColor: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Tiny thumbnail */}
        <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-white/10">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="20px"
          />
        </div>

        {/* Name — capped width */}
        <span className="text-[10px] font-semibold text-zinc-300 max-w-[90px] truncate">
          {product.name}
        </span>

        {/* Remove button */}
        <button
          onClick={handleRemove}
          aria-label={`Remove ${product.name} from context`}
          className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-white/10 transition-all duration-150 shrink-0"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      </div>
    );
  }
);
ContextChip.displayName = "ContextChip";

// ─── ChatInput ─────────────────────────────────────────────────────────────────
//
// PERFORMANCE: Owns its own `inputValue` state so keystroke updates are isolated
// to this tiny component. The parent VolooAI never re-renders on typing.
//
// When the user submits (Enter or Send button), it calls `onSend(text)` which
// triggers the parent's `sendMessage` function, and resets the local input.
interface ChatInputProps {
  onSend: (text: string) => void;
  isProcessing: boolean;
  chatMode: "collapse" | "keep";
  hasContext: boolean;
  contextName?: string;
  placeholder: string;
  theme: CafeTheme;
  onTyping?: () => void;
}

const ChatInput = memo(({
  onSend,
  isProcessing,
  chatMode,
  hasContext,
  contextName,
  placeholder,
  theme,
  onTyping,
}: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || (isProcessing && chatMode === "collapse")) return;
    onSend(trimmed);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 rounded-[2rem]"
      style={{
        backgroundColor: theme.surfaceColor,
        border: hasContext
          ? `1px solid ${theme.primaryColor}40`
          : "1px solid rgba(255,255,255,0.09)",
        backdropFilter: "blur(24px) saturate(150%)",
        WebkitBackdropFilter: "blur(24px) saturate(150%)",
        boxShadow: hasContext
          ? `0 8px 40px rgba(0,0,0,0.55), 0 0 12px ${theme.accentGlow} inset, inset 0 1px 0 rgba(255,255,255,0.04)`
          : "0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
    >
      {/* Context-active dot */}
      {hasContext && (
        <div
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{
            backgroundColor: theme.primaryColorLight,
            boxShadow: `0 0 6px ${theme.primaryColorLight}b3`,
          }}
        />
      )}

      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onTyping?.();
        }}
        onKeyDown={handleKeyDown}
        placeholder={hasContext && contextName ? `Ask about ${contextName}…` : placeholder}
        className="flex-1 bg-transparent outline-none text-[16px] text-zinc-200 placeholder:text-zinc-600 font-medium"
        autoComplete="off"
      />

      <button
        onClick={handleSubmit}
        disabled={!inputValue.trim() || (isProcessing && chatMode === "collapse")}
        aria-label="Send message"
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
        style={{
          background: inputValue.trim()
            ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColorLight})`
            : "rgba(255,255,255,0.08)",
          boxShadow: inputValue.trim() ? `0 4px 16px ${theme.primaryColor}60` : "none",
        }}
      >
        <Send className="w-3.5 h-3.5 text-white" />
      </button>
    </div>
  );
});
ChatInput.displayName = "ChatInput";


const ProductRow = memo(
  ({
    productIds,
    localizedProducts,
    isBackgroundDark,
    rowId,
    selectedContext,
    onToggleSelection,
    onAddToBasket,
    primaryColor,
    primaryColorLight,
  }: {
    productIds: number[];
    localizedProducts: Product[];
    isBackgroundDark: boolean;
    rowId: string;
    selectedContext: Product[];
    onToggleSelection: (product: Product) => void;
    onAddToBasket: (product: Product) => void;
    primaryColor: string;
    primaryColorLight: string;
  }) => {
    const rowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!rowRef.current) return;
      gsap.fromTo(
        rowRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", delay: 0.1 }
      );
    }, []);

    const products = productIds
      .map((id) => localizedProducts.find((p) => p.id === id))
      .filter(Boolean) as Product[];

    if (products.length === 0) return null;

    return (
      <div ref={rowRef} className={`product-row-${rowId} mt-3`}>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 ml-0.5">
          Recommendations
        </p>
        <div className="flex gap-3 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide pb-2">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product as any}
              isBackgroundDark={isBackgroundDark}
              isSelected={selectedContext.some((p) => p.id === product.id)}
              onToggle={onToggleSelection}
              onAddToBasket={onAddToBasket}
              primaryColor={primaryColor}
              primaryColorLight={primaryColorLight}
            />
          ))}
        </div>
      </div>
    );
  }
);
ProductRow.displayName = "ProductRow";

// ─── Main Component ────────────────────────────────────────────────────────────────────
export function VolooAI({
  apiEndpoint = "/api/chat",
  localizedProducts = [],
  cafeConfig,
}: VolooAIChatProps) {
  const t = useTranslations("CoffeeTemplate3.Chatbot");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Destructure theme once so every reference stays short
  const { theme, cafeId, brandName } = cafeConfig;

  // ── State ──
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatMode, setChatMode] = useState<"collapse" | "keep">("collapse");
  // Note: inputValue is now owned by the <ChatInput> child component.
  // Keeping it out of the parent prevents re-renders on every keystroke.
  const [isBackgroundDark] = useState(true);

  // ── Session Management ─────────────────────────────────────────────────────────────────
  //
  // A UUID is generated client-side on first visit and stored in localStorage
  // under the key "voloo_session_id". It is scoped to this cafeId in Convex
  // so two different cafes running the widget on the same device never share
  // history. Starts as "" to avoid SSR mismatches; Convex query is skipped
  // until the ID is populated (see "skip" guard on useQuery below).
  const SESSION_STORAGE_KEY = "voloo_session_id";
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    let id = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!id) {
      // crypto.randomUUID() is available in all modern browsers + Node 16+
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_STORAGE_KEY, id);
    }
    setSessionId(id);
  }, []);

  // ── Convex: reactive message history ──────────────────────────────────────────────────
  //
  // `useQuery` with "skip" prevents any Convex call before the session UUID
  // is read from localStorage (avoids querying with an empty string key).
  // Once sessionId is populated it returns a live array that re-renders the
  // component whenever a new message is inserted from any device/tab.
  const convexMessages = useQuery(
    api.chat.getMessages,
    sessionId ? { sessionId, cafeId } : "skip"
  );

  // Map Convex docs to the local Message shape used by the renderer.
  // Convex docs have a `_id` and `_creationTime` on top of our fields;
  // we strip those to keep the renderer type-safe.
  const messages: Message[] = (convexMessages ?? []).map((m: { role: any; content: any; timestamp: any; products: any; }) => ({
    role: m.role,
    content: m.content,
    timestamp: m.timestamp,
    products: m.products,
  }));

  // Optimistic pending state: instantly shown before Convex round-trip
  // completes. Cleared once `convexMessages` re-renders with the new row.
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);

  // Combined view: persisted history + any in-flight optimistic messages
  const allMessages = [...messages, ...pendingMessages];

  // ── Convex: save message mutation ──────────────────────────────────────────────────
  const saveMessage = useMutation(api.chat.sendMessage);

  // ── Convex: order mutation ─────────────────────────────────────────────────────────
  const placeOrder = useMutation(api.orders.placeOrder);
  const [seatNumber, setSeatNumber] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handlePlaceOrder = async () => {
    if (!seatNumber || isNaN(Number(seatNumber))) return;
    setIsPlacingOrder(true);
    try {
      await placeOrder({
        cafeId,
        seatNumber: Number(seatNumber),
        items: basket.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        totalPrice: basketTotal,
      });
      setOrderSuccess(true);
      setBasket([]);
      setTimeout(() => {
        setOrderSuccess(false);
        setIsBasketOpen(false);
      }, 3000);
    } catch (e) {
      console.error("Failed to place order", e);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // ── Context-selection state (persisted to sessionStorage) ──
  const [selectedContext, setSelectedContext] = useState<Product[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = sessionStorage.getItem(CONTEXT_KEY);
      return stored ? (JSON.parse(stored) as Product[]) : [];
    } catch {
      return [];
    }
  });

  // Sync selectedContext → sessionStorage whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(selectedContext));
    } catch {
      // sessionStorage unavailable (private browsing etc.) — silently ignore
    }
  }, [selectedContext]);

  // ── Toggle helper — add or remove a product from the context ──
  const toggleSelection = useCallback((product: Product) => {
    setSelectedContext((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      return exists ? prev.filter((p) => p.id !== product.id) : [...prev, product];
    });
  }, []);

  // ── Order Basket State ─────────────────────────────────────────────────────────────────
  //
  // HYDRATION FIX: Always start as [] so server and client render identical
  // HTML on first paint (no basket badge on either). sessionStorage is loaded
  // in a useEffect that only runs after client mount — never on the server.
  const [basket, setBasket] = useState<BasketItem[]>([]);

  // One-time hydration from sessionStorage after mount.
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`${BASKET_KEY}_${cafeId}`);
      if (stored) setBasket(JSON.parse(stored) as BasketItem[]);
    } catch { /* private-browsing or malformed JSON — stay empty */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync basket → sessionStorage on every subsequent change.
  useEffect(() => {
    try {
      sessionStorage.setItem(`${BASKET_KEY}_${cafeId}`, JSON.stringify(basket));
      const count = basket.reduce((sum, item) => sum + item.quantity, 0);
      window.dispatchEvent(new CustomEvent("basket-updated", { detail: { count } }));
    } catch { /* private-browsing — ignore */ }
  }, [basket, cafeId]);


  const [isBasketOpen, setIsBasketOpen] = useState(false);

  // Listen for navbar cart button clicks
  useEffect(() => {
    const handleOpenBasket = () => {
      setIsOpen(true);
      setIsBasketOpen(true);
    };
    window.addEventListener("open-voloo-basket", handleOpenBasket);
    return () => window.removeEventListener("open-voloo-basket", handleOpenBasket);
  }, []);

  // ── Rating State ──
  const [hasRated, setHasRated] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(`rated_${cafeId}_${sessionId}`) === "true";
  });
  const submitRating = useMutation(api.chat.submitRating);

  // ── Allergies State & Modal ──
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [userAllergies, setUserAllergies] = useState<string[]>([]);
  const toggleAllergy = useCallback((allergy: string) => {
    setUserAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  }, []);

  // ── Tooltip State ──
  const [showTooltip, setShowTooltip] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  /**
   * addToBasket — increments quantity if the product already exists,
   * otherwise appends a new row with quantity = 1.
   */
  const addToBasket = useCallback((product: Product) => {
    setBasket((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
        return updated;
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  /**
   * removeFromBasket — removes the product entirely (regardless of quantity).
   */
  const removeFromBasket = useCallback((productId: number) => {
    setBasket((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  /**
   * updateQuantity — sets an exact quantity; removes the row if qty drops to 0.
   */
  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromBasket(productId);
      return;
    }
    setBasket((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromBasket]);

  // Derived: total number of individual items in the basket (for badge)
  const basketCount = basket.reduce((sum, item) => sum + item.quantity, 0);
  // Derived: order total price
  const basketTotal = basket.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // ── Refs ──
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const processingPillRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollLocked = useRef(false);
  const savedScrollPos = useRef(0);

  // ── Language Switch ──
  //
  // Soft client-side locale swap using startTransition so the route change
  // doesn't cause a hard reload or unmount the widget. The pathname is
  // reconstructed with the new locale in segment [1] (e.g. /en/... → /ka/...).
  const handleLanguageSwitch = (newLocale: string) => {
    if (newLocale === locale) return;
    const segments = pathname.split("/");
    // segments[0] is empty (leading slash), segments[1] is the locale
    segments[1] = newLocale;
    startTransition(() => {
      router.replace(segments.join("/"));
    });
  };

  // ── Effects ──
  // Scroll to bottom whenever persisted messages or optimistic messages update
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [allMessages, isProcessing, isOpen]);

  // GSAP entrance on new messages — watches `allMessages` (union of Convex +
  // optimistic) so the animation fires for both persisted and pending turns.
  useEffect(() => {
    if (allMessages.length > 0 && isOpen) {
      const idx = allMessages.length - 1;
      gsap.fromTo(
        `.message-item-${idx}`,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
      );
    }
  }, [allMessages, isOpen]);

  // ── Scroll Locking ──
  const lockScroll = () => {
    if (!scrollLocked.current) {
      savedScrollPos.current = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${savedScrollPos.current}px`;
      document.body.style.width = "100%";
      document.documentElement.style.backgroundColor = theme.backgroundColor;
      ScrollTrigger.getAll().forEach((st) => st.disable());
      scrollLocked.current = true;
    }
  };

  const unlockScroll = () => {
    if (scrollLocked.current) {
      const scrollY = savedScrollPos.current;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.documentElement.style.backgroundColor = "";
      window.scrollTo(0, scrollY);
      ScrollTrigger.getAll().forEach((st) => st.enable());
      scrollLocked.current = false;
    }
  };

  // ── Animations ──
  const openChatAnimation = () => {
    lockScroll();
    const tl = gsap.timeline();
    tl.set(overlayRef.current, { display: "flex", opacity: 0 })
      .to(overlayRef.current, { opacity: 1, duration: 0.2 })
      .fromTo(
        overlayRef.current,
        { clipPath: "inset(50% 0% 50% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: "expo.inOut" }
      )
      .to(
        chatContainerRef.current,
        { opacity: 1, duration: 0.45, onComplete: () => setIsOpen(true) },
        "-=0.35"
      )
      .from(
        ".voloo-ui-element",
        { y: 16, opacity: 0, stagger: 0.08, duration: 0.35, ease: "power2.out" },
        "-=0.2"
      );
    return tl;
  };

  const closeChatAnimation = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        setIsOpen(false);
        unlockScroll();
        if (overlayRef.current) overlayRef.current.style.display = "none";
      },
    });
    tl.to(chatContainerRef.current, { opacity: 0, duration: 0.25 })
      .to(
        overlayRef.current,
        { clipPath: "inset(50% 0% 50% 0%)", duration: 0.7, ease: "expo.inOut" },
        "-=0.25"
      )
      .to(overlayRef.current, { opacity: 0, duration: 0.2 }, "-=0.2");
    return tl;
  };

  const shrinkToProcessing = async () => {
    const tl = gsap.timeline();
    tl.to(chatContainerRef.current, { opacity: 0, duration: 0.25 })
      .to(
        overlayRef.current,
        { clipPath: "inset(50% 0% 50% 0%)", duration: 0.55, ease: "expo.inOut" },
        "-=0.25"
      )
      .set(processingPillRef.current, { display: "flex", opacity: 0, scale: 0.85 })
      .to(processingPillRef.current, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" })
      .to(overlayRef.current, { opacity: 0, duration: 0.2 }, "-=0.2")
      .add(() => {
        unlockScroll();
        if (overlayRef.current) overlayRef.current.style.display = "none";
      })
      .to(processingPillRef.current, {
        opacity: 0,
        scale: 0.85,
        duration: 0.3,
        delay: 0.8,
        onComplete: () => {
          if (processingPillRef.current)
            processingPillRef.current.style.display = "none";
          setIsOpen(false);
        },
      });
    return tl;
  };

  // ── sendMessage ────────────────────────────────────────────────────────────────────
  //
  // Data flow:
  //   1. Add user message to `pendingMessages` immediately (optimistic UI)
  //   2. Collapse animation (if chatMode === "collapse")
  //   3. Call Gemini via /api/chat to get AI response + productIds
  //   4. Persist BOTH turns to Convex (user first, then assistant)
  //   5. Clear pendingMessages — Convex `useQuery` re-renders with real rows
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !sessionId) return;

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: Date.now(),
    };

    // Step 1: Optimistic update — instant UI feedback
    setPendingMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    if (chatMode === "collapse") await shrinkToProcessing();

    try {
      // Step 2: Build product context string for the Gemini system prompt
      const productContext = localizedProducts
        .map((p) => {
          const ingredientsStr = p.ingredients ? `Ingredients: ${p.ingredients}.` : "";
          const allergenStr = p.allergens ? `Allergens: ${p.allergens.join(", ")}.` : "";
          const nutritionStr = p.nutrition ? `Nutrition: ${JSON.stringify(p.nutrition)}.` : "";
          return `ID: ${p.id} | ${p.name} (${p.category}) - $${p.price}: ${p.description}. ${ingredientsStr} ${allergenStr} ${nutritionStr}`;
        })
        .join("\n\n");

      // Step 3: Call Gemini API — include the current basket so the AI is aware
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          productContext,
          scrollPosition: window.scrollY,
          conversationHistory: messages,
          language: locale,
          focusedItems: selectedContext.map((p) => p.name),
          userAllergies,
          // Basket context — lets Gemini acknowledge the cart and suggest pairings
          currentBasket: basket.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
          })),
        }),
      });

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || "I apologize, but I couldn't process that request.",
        timestamp: Date.now(),
        products: data.productIds || [],
      };

      // Step 4: Persist both turns to Convex (user then assistant)
      // These mutations are fired in sequence so the DB has the right order.
      await saveMessage({
        sessionId,
        cafeId,
        role: "user",
        content: userMessage.content,
      });
      await saveMessage({
        sessionId,
        cafeId,
        role: "assistant",
        content: assistantMessage.content,
        products: assistantMessage.products,
      });

      // Step 5: Clear optimistic messages — Convex `useQuery` will now
      // return the real persisted rows and re-render the list.
      setPendingMessages([]);

      if (chatMode === "collapse") {
        setTimeout(() => openChatAnimation(), 300);
      }
    } catch (error) {
      console.error("VolooAI Error", error);
      // On error keep the optimistic user message visible so the user can retry
      if (chatMode === "collapse") setTimeout(() => openChatAnimation(), 500);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── handleNewChat ───────────────────────────────────────────────────────────────────
  //
  // Starts a fresh session WITHOUT deleting anything from Convex.
  // A new UUID → sessionId swap causes the Convex useQuery to immediately
  // return [] for the new session, clearing the screen instantly.
  // Old messages remain intact in the DB for the cafe manager.
  const handleNewChat = useCallback(() => {
    const newId = crypto.randomUUID();
    localStorage.setItem(SESSION_STORAGE_KEY, newId);
    setSessionId(newId);
    setPendingMessages([]);
    setBasket([]);
  }, []);

  const suggestionKeys = ["0", "1", "2"];
  const suggestions = suggestionKeys.map((k) => t(`suggestions.${k}` as any));

  const hasContext = selectedContext.length > 0;

  // ── Render ──
  return (
    <>
      {/* Scrollbar hide global style */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── Floating Trigger ── */}
      {!isOpen && !isProcessing && (
        <button
          onClick={openChatAnimation}
          className="fixed bottom-6 right-6 z-50 p-4 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group"
          style={{
            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColorLight})`,
            boxShadow: `0 20px 60px -10px ${theme.primaryColor}80`,
          }}
        >
          <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
        </button>
      )}

      {/* ── Processing Pill ── */}
      <div ref={processingPillRef} className="fixed bottom-8 right-8 z-[100] hidden">
        <div className="px-6 py-3 bg-zinc-900/90 text-white rounded-full shadow-2xl flex items-center gap-2.5 border border-white/10 backdrop-blur-xl">
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: theme.primaryColorLight }} />
          <span className="font-bold text-xs uppercase tracking-wider">{t("thinking")}</span>
        </div>
      </div>

      {/* ── Full-screen Overlay Shell ── */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[90] hidden items-center justify-center"
        style={{
          backgroundColor: theme.backgroundColor,
          clipPath: "inset(50% 0% 50% 0%)",
          // dvh = dynamic viewport height: shrinks when the soft keyboard
          // appears so the input stays above it without a white gap.
          height: "100dvh",
          // Prevent the entire overlay from being dragged/panned off-screen
          // on touch devices.
          overscrollBehavior: "none",
          touchAction: "none",
          overflow: "hidden",
        }}
      >
        <div
          ref={chatContainerRef}
          className="w-full h-full flex flex-col opacity-0 relative overflow-hidden"
          style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
        >
          {/* ════════ HEADER ════════ */}
          <div
            className="voloo-ui-element flex items-center justify-between px-4 py-2.5 sticky top-0 z-10"
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              // Header bg uses a slightly-opaque tint of the cafe's background colour
              backgroundColor: `${theme.backgroundColor}eb`,
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Left – brand (no Sparkles icon, just name + status dot) */}
            <div className="flex items-center gap-2">
              <div>
                <h2 className="font-black text-sm uppercase tracking-tight leading-none text-zinc-100">
                  {brandName}
                </h2>
                <p className="text-[9px] font-mono flex items-center gap-1.5 mt-0.5 text-zinc-500">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  {t("subtitle")}
                </p>
              </div>
            </div>

            {/* Right – controls (tighter gap) */}
            <div className="flex items-center gap-1">
              {/* Language toggle */}
              <div
                className="flex items-center p-0.5 rounded-lg border border-white/8"
                style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
              >
                {["en", "ka"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageSwitch(lang)}
                    className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all duration-200"
                    style={
                      locale === lang
                        ? { backgroundColor: theme.primaryColor, color: "#fff" }
                        : {}
                    }
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {/* Chat Mode toggle — icon-only for compact mobile header */}
              <div
                className="relative flex items-center p-0.5 rounded-lg border border-white/8"
                style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
              >
                {/* ── Onboarding Tooltip ── */}
                {showTooltip && (
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[160px] p-2 rounded-lg text-center text-xs font-semibold text-white shadow-2xl animate-fade-in pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColorLight})`,
                      boxShadow: `0 8px 32px ${theme.primaryColor}50`
                    }}
                  >
                    Chat auto-minimizes so you can view the menu.
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style={{ backgroundColor: theme.primaryColor }} />
                  </div>
                )}
                <button
                  onClick={() => setChatMode("collapse")}
                  aria-label="Auto-collapse mode"
                  title="Auto collapse"
                  className="w-7 h-7 flex items-center justify-center rounded-md transition-all duration-200"
                  style={
                    chatMode === "collapse"
                      ? { backgroundColor: theme.primaryColor, color: "#fff" }
                      : {}
                  }
                >
                  <ArrowDownToLine className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setChatMode("keep")}
                  aria-label="Keep open mode"
                  title="Keep open"
                  className="w-7 h-7 flex items-center justify-center rounded-md transition-all duration-200"
                  style={
                    chatMode === "keep"
                      ? { backgroundColor: theme.primaryColor, color: "#fff" }
                      : {}
                  }
                >
                  <Eye className="w-3 h-3" />
                </button>
              </div>

              {/* New Chat button — rotates on hover, uses theme for active glow */}
              <button
                onClick={handleNewChat}
                aria-label="Start new chat"
                title="New Chat"
                className="p-1.5 rounded-lg transition-all duration-200 hover:bg-white/5 text-zinc-500 hover:text-zinc-200 group"
              >
                <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
              </button>

              {/* Basket toggle button — ShoppingBag with animated item count badge */}
              <button
                onClick={() => setIsBasketOpen(true)}
                aria-label="Open order basket"
                className="relative p-1.5 rounded-lg transition-all duration-200 hover:bg-white/5"
                style={{ color: basketCount > 0 ? theme.primaryColorLight : "rgba(255,255,255,0.4)" }}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                {basketCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center rounded-full text-white text-[8px] font-black"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {basketCount > 9 ? "9+" : basketCount}
                  </span>
                )}
              </button>

              {/* Close */}
              <button
                onClick={closeChatAnimation}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all duration-200 group"
              >
                <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* ════════ MESSAGES AREA ════════ */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto scrollbar-hide">
            {/*
              pb is dynamic:
              • 36 = base clearance for the floating pill (~144px)
              • +8 (~32px) extra when context chips are visible
            */}
            <div
              className={`max-w-3xl mx-auto w-full px-4 py-6 space-y-6 transition-[padding] duration-300 ${hasContext ? "pb-44" : "pb-36"
                }`}
            >
              {/* ── Welcome State ── */}
              {allMessages.length === 0 && (
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-5">
                  <div
                    className="voloo-ui-element w-12 h-12 mx-auto rounded-2xl flex items-center justify-center border border-white/5"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primaryColor}33, ${theme.primaryColorLight}0d)`,
                    }}
                  >
                    <Sparkles className="w-6 h-6" style={{ color: theme.primaryColorLight }} />
                  </div>
                  <div className="voloo-ui-element">
                    <h3 className="font-black text-xl tracking-tight text-zinc-100">
                      {t("welcome")}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1 leading-relaxed max-w-sm mx-auto">
                      {t("welcome_desc")}
                    </p>
                  </div>

                  {/* ── Personal Preferences Button ── */}
                  <div className="voloo-ui-element w-full px-2 mt-2 flex justify-center">
                    <button
                      onClick={() => setIsPreferencesOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-200 group"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.02)",
                        borderColor: "rgba(255,255,255,0.08)",
                        color: theme.textColor
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = `${theme.primaryColor}80`;
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${theme.primaryColor}0d`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.02)";
                      }}
                    >
                      <SlidersHorizontal className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" style={{ color: theme.primaryColorLight }} />
                      <span className="text-xs font-bold uppercase tracking-wider">Dietary Requirements</span>
                      {userAllergies.length > 0 && (
                        <span className="w-2 h-2 rounded-full ml-1 animate-pulse" style={{ backgroundColor: theme.primaryColor }} />
                      )}
                    </button>
                  </div>

                  <div className="voloo-ui-element flex flex-wrap gap-2 justify-center">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(suggestion)}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 text-zinc-400 hover:text-zinc-100 transition-all duration-200"
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = `${theme.primaryColor}80`;
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${theme.primaryColor}0d`;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "";
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "";
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Message List ──
                  Renders `allMessages` = persisted Convex history + optimistic pending turns.
                  Using allMessages (not messages alone) ensures the GSAP entrance
                  animation fires on both real and in-flight turns.
              */}
              {allMessages.map((msg, idx) => (
                <div key={`${msg.timestamp}-${idx}`} className={`message-item-${idx}`}>
                  {msg.role === "user" ? (
                    <div className="flex justify-end">
                      <div
                        className="max-w-[75%] px-4 py-2.5 rounded-2xl text-zinc-100 text-sm leading-relaxed"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          backdropFilter: "blur(12px)",
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {/* AI avatar — uses theme gradient */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColorLight})`,
                            boxShadow: `0 2px 8px ${theme.primaryColor}60`,
                          }}
                        >
                          <Sparkles className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                          {brandName}
                        </span>
                      </div>

                      {/* Unboxed text on the dark canvas */}
                      <div className="text-zinc-300 pl-1">
                        {/* Pass the cafe's accent colour so bold (**text**) matches the brand */}
                        <FormatMessage content={msg.content} accentColor={theme.primaryColorLight} />
                      </div>

                      {/* Horizontal product card row */}
                      {msg.products && msg.products.length > 0 && (
                        <ProductRow
                          productIds={msg.products}
                          localizedProducts={localizedProducts}
                          isBackgroundDark={isBackgroundDark}
                          rowId={String(idx)}
                          selectedContext={selectedContext}
                          onToggleSelection={toggleSelection}
                          onAddToBasket={addToBasket}
                          primaryColor={theme.primaryColor}
                          primaryColorLight={theme.primaryColorLight}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* ── Rating UI ── */}
              {allMessages.length >= 4 && !hasRated && (
                <div className="mt-8 p-6 rounded-[2rem] border border-white/10 text-center animate-fade-in"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(20px)"
                  }}
                >
                  <h4 className="text-zinc-200 font-bold text-sm mb-4">How is your AI experience?</h4>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => {
                          submitRating({ sessionId, cafeId, rating: star });
                          setHasRated(true);
                          sessionStorage.setItem(`rated_${cafeId}_${sessionId}`, "true");
                        }}
                        className="p-2 text-zinc-500 hover:text-yellow-400 hover:scale-110 transition-all duration-200"
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {allMessages.length >= 4 && hasRated && (
                <div className="mt-8 p-4 text-center animate-fade-in">
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.primaryColorLight }}>Thank you!</p>
                </div>
              )}

              {/* ── Typing Indicator ── */}
              {isProcessing && chatMode === "keep" && (
                <div className="flex items-center gap-1.5 pl-1">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColorLight})` }}
                  >
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                  </div>
                  <div
                    className="flex items-center gap-1 px-3 py-2 rounded-xl"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s]" style={{ backgroundColor: theme.primaryColorLight }} />
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s]" style={{ backgroundColor: theme.primaryColorLight }} />
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: theme.primaryColorLight }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* ════════ FLOATING INPUT ZONE ════════
              Contains two layers:
              1. Context chip bar (only when selectedContext.length > 0)
              2. The pill input itself
          */}
          <div className="voloo-ui-element absolute bottom-0 left-0 right-0 pointer-events-none">
            <div className="max-w-3xl mx-auto px-4 flex flex-col gap-2 pointer-events-auto" style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}>

              {/* ── Context Chip Bar ──
                  Rendered above the pill when products are selected.
                  Each chip is individually GSAP-animated on mount/unmount.
              */}
              {hasContext && (
                <div className="flex flex-wrap gap-1.5 px-1">
                  {/* "Focused on:" label */}
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 self-center pr-0.5">
                    Focused on:
                  </span>
                  {selectedContext.map((product) => (
                    <ContextChip
                      key={product.id}
                      product={product}
                      onRemove={(id) =>
                        setSelectedContext((prev) => prev.filter((p) => p.id !== id))
                      }
                    />
                  ))}
                </div>
              )}

              {/* ── ChatInput (memoized — owns its own inputValue state) ── */}
              <ChatInput
                onSend={sendMessage}
                isProcessing={isProcessing}
                chatMode={chatMode}
                hasContext={hasContext}
                contextName={selectedContext[0]?.name}
                placeholder={t("input_placeholder")}
                theme={theme}
                onTyping={() => setShowTooltip(false)}
              />

            </div>
          </div>
          {/* end floating input */}


          {/* ════════ ORDER BASKET DRAWER ════════
              A slide-in panel from the right edge of the chat overlay.
              Uses CSS transitions (translateX) instead of GSAP so it stays
              performant even while the AI is streaming. The panel renders
              inside chatContainerRef so it inherits the cafe's background.

              Key design rules:
              • backdrop-filter: blur(24px) — glassy premium feel
              • All colours from theme — zero hardcoded values
              • ShoppingBag icon in header matches badge colour
          */}
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
              className="flex items-center justify-between px-5 py-3.5 shrink-0"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                backgroundColor: `${theme.backgroundColor}cc`,
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" style={{ color: theme.primaryColorLight }} />
                <span className="font-black text-sm uppercase tracking-tight" style={{ color: theme.textColor }}>
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
                    <ShoppingBag className="w-6 h-6 opacity-30" style={{ color: theme.primaryColorLight }} />
                  </div>
                  <p className="text-xs font-semibold opacity-30 text-center" style={{ color: theme.textColor }}>
                    Your basket is empty.<br />Tap <strong>ADD</strong> on any product card.
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
                      <Image src={product.image} alt={product.name} fill className="object-cover" sizes="44px" />
                    </div>

                    {/* Name + price */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: theme.textColor }}>{product.name}</p>
                      <p className="text-[10px] font-mono opacity-50" style={{ color: theme.textColor }}>
                        ${(product.price * quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        aria-label="Decrease quantity"
                        className="w-5 h-5 rounded-md flex items-center justify-center transition-colors duration-150"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.07)",
                          color: theme.textColor,
                        }}
                      >
                        {quantity === 1 ? (
                          <Trash2 className="w-2.5 h-2.5" style={{ color: "#ef4444" }} />
                        ) : (
                          <Minus className="w-2.5 h-2.5" />
                        )}
                      </button>

                      <span
                        className="w-5 text-center text-[10px] font-black tabular-nums"
                        style={{ color: theme.textColor }}
                      >
                        {quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        aria-label="Increase quantity"
                        className="w-5 h-5 rounded-md flex items-center justify-center transition-colors duration-150"
                        style={{
                          backgroundColor: `${theme.primaryColor}33`,
                          color: theme.primaryColorLight,
                        }}
                      >
                        <Plus className="w-2.5 h-2.5" />
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
                  <span className="text-xs font-bold uppercase tracking-widest opacity-40" style={{ color: theme.textColor }}>
                    Total
                  </span>
                  <span className="text-base font-black font-mono" style={{ color: theme.primaryColorLight }}>
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
                        {isPlacingOrder ? <Loader2 className="w-4 h-4 mx-auto animate-spin" /> : "Place Order"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* end basket drawer */}

        </div>
      </div>

      {/* ════════ PREFERENCES MODAL ════════ */}
      {isPreferencesOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="relative w-full max-w-[320px] rounded-[2rem] p-6 border shadow-2xl"
            style={{
              backgroundColor: `${theme.backgroundColor}f0`,
              borderColor: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(24px) saturate(150%)"
            }}
          >
            <button
              onClick={() => setIsPreferencesOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <SlidersHorizontal className="w-4 h-4" style={{ color: theme.primaryColorLight }} />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Dietary Needs</h3>
            </div>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Select any ingredients you'd like our AI to avoid when recommending menu items.
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {["Lactose/Dairy", "Nuts", "Gluten", "Vegan"].map((allergy) => {
                const isActive = userAllergies.includes(allergy);
                return (
                  <button
                    key={allergy}
                    onClick={() => toggleAllergy(allergy)}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all duration-200"
                    style={isActive ? {
                      backgroundColor: theme.primaryColor,
                      borderColor: theme.primaryColor,
                      color: "#fff",
                      boxShadow: `0 4px 12px ${theme.primaryColor}50`
                    } : {
                      backgroundColor: "rgba(255,255,255,0.02)",
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "#a1a1aa"
                    }}
                  >
                    {allergy}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setIsPreferencesOpen(false)}
              className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-white transition-all hover:opacity-90 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColorLight})`,
                boxShadow: `0 8px 24px ${theme.primaryColor}40`
              }}
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </>
  );
}