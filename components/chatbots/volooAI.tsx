"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  startTransition,
} from "react";
import {
  X,
  Send,
  Sparkles,
  Loader2,
  ArrowDownToLine,
  Eye,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
  Star,
  SlidersHorizontal,
} from "lucide-react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
// ─── Convex ────────────────────────────────────────────────────────────────────
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex-helpers-api";

import { LightRays } from "@/components/ui/light-rays";
import { FlickeringGrid } from "@/components/ui/flickering-grid";

gsap.registerPlugin(ScrollTrigger);

// ─── Types ────────────────────────────────────────────────────────────────────
export * from "./voloo-ui/types";
import {
  Message,
  Product,
  CafeTheme,
  CafeConfig,
  BasketItem,
} from "./voloo-ui/types";
import { FormatMessage } from "./voloo-ui/FormatMessage";
import { ContextChip } from "./voloo-ui/ContextChip";
import { ChatInput } from "./voloo-ui/ChatInput";
import { ProductRow } from "./voloo-ui/ProductRow";
import { BasketDrawer } from "./voloo-ui/BasketDrawer";
import { PreferencesModal } from "./voloo-ui/PreferencesModal";
import { DesktopTrigger } from "./voloo-ui/DesktopTrigger";
import { MobileTrigger } from "./voloo-ui/MobileTrigger";

export interface VolooAIChatProps {
  apiEndpoint?: string;
  localizedProducts?: Product[];
  /** Required — controls branding, colours, and Convex tenant isolation */
  cafeConfig: CafeConfig;
}

// ─── Storage keys ──────────────────────────────────────────────────────────────
const CONTEXT_KEY = "voloo_chat_selected_context";
const BASKET_KEY = "voloo_order_basket";

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

  // ── Database Theme Override ──
  const { cafeId, brandName } = cafeConfig;
  // Fetch DB theme — only reads background animation template + color overrides saved by admin.
  const activeThemeData = useQuery(api.aiChatThemes?.getBySlug, { slug: cafeId });

  // Merge DB values with cafeConfig defaults — DB wins when a value is set.
  const theme = {
    primaryColor:       activeThemeData?.primaryColor      || cafeConfig.theme.primaryColor,
    primaryColorLight:  cafeConfig.theme.primaryColorLight,   // always from cafeConfig — no DB override
    backgroundColor:    activeThemeData?.backgroundColor   || cafeConfig.theme.backgroundColor,
    surfaceColor:       activeThemeData?.userMessageBg     || cafeConfig.theme.surfaceColor,
    textColor:          activeThemeData?.textColor         || cafeConfig.theme.textColor,
    accentGlow:         cafeConfig.theme.accentGlow,
    // Extended fields
    userBubbleBg:       activeThemeData?.userMessageBg     || "rgba(255,255,255,0.08)",
    userBubbleText:     activeThemeData?.userMessageText   || cafeConfig.theme.textColor,
    botBubbleText:      activeThemeData?.botMessageText    || "#a1a1aa",
  };

  // "none" = no animation (default when nothing saved)
  const backgroundTemplate = activeThemeData?.backgroundTemplate ?? "none";

  // ── State ──
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [chatMode, setChatMode] = useState<"collapse" | "keep">("keep");
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
    sessionId ? { sessionId, cafeId } : "skip",
  );

  // Map Convex docs to the local Message shape used by the renderer.
  // Convex docs have a `_id` and `_creationTime` on top of our fields;
  // we strip those to keep the renderer type-safe.
  const messages: Message[] = (convexMessages ?? []).map(
    (m: { role: any; content: any; timestamp: any; products: any }) => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
      products: m.products,
    }),
  );

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
        items: basket.map((item) => ({
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
      return exists
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product];
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
    } catch {
      /* private-browsing or malformed JSON — stay empty */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync basket → sessionStorage on every subsequent change.
  useEffect(() => {
    try {
      sessionStorage.setItem(`${BASKET_KEY}_${cafeId}`, JSON.stringify(basket));
      const count = basket.reduce((sum, item) => sum + item.quantity, 0);
      window.dispatchEvent(
        new CustomEvent("basket-updated", { detail: { count } }),
      );
    } catch {
      /* private-browsing — ignore */
    }
  }, [basket, cafeId]);

  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const openChatAnimationRef = useRef<(() => void) | null>(null);
  const isOpenRef = useRef(isOpen);
  
  // Keep refs up-to-date for the event listener closure
  useEffect(() => {
    isOpenRef.current = isOpen;
    openChatAnimationRef.current = openChatAnimation;
  });

  // Listen for navbar cart button clicks
  useEffect(() => {
    const handleOpenBasket = () => {
      if (!isOpenRef.current && openChatAnimationRef.current) {
        openChatAnimationRef.current();
      }
      setIsBasketOpen(true);
    };
    window.addEventListener("open-voloo-basket", handleOpenBasket);
    return () =>
      window.removeEventListener("open-voloo-basket", handleOpenBasket);
  }, []);

  const sendMessageRef = useRef<((msg: string) => void) | null>(null);
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  });

  // Listen for 'Ask AI' clicks from the storefront
  useEffect(() => {
    const handleAskAI = (e: any) => {
      const { message, product, keepOpen } = e.detail || {};
      
      if (keepOpen) {
        setChatMode("keep");
      }

      // Optionally focus the context chip on this product
      if (product) {
        setSelectedContext((prev) => {
          if (!prev.some((p) => p.id === product.id)) return [...prev, product];
          return prev;
        });
      }
      
      // Open the chat UI if it's not open already
      if (!isOpenRef.current && openChatAnimationRef.current) {
        openChatAnimationRef.current();
      }

      // Pre-fill and send the prompt
      if (message && sendMessageRef.current) {
        // slight delay to let GSAP timeline start rendering chat container
        setTimeout(() => sendMessageRef.current?.(message), 300);
      }
    };
    window.addEventListener("ask-voloo-ai", handleAskAI);
    return () => window.removeEventListener("ask-voloo-ai", handleAskAI);
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
      prev.includes(allergy)
        ? prev.filter((a) => a !== allergy)
        : [...prev, allergy],
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
  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (quantity <= 0) {
        removeFromBasket(productId);
        return;
      }
      setBasket((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item,
        ),
      );
    },
    [removeFromBasket],
  );

  // Listen for global "add-to-voloo-basket" events
  useEffect(() => {
    const handleAdd = (e: any) => {
      if (e.detail?.product) {
        addToBasket(e.detail.product);
      }
    };
    window.addEventListener("add-to-voloo-basket", handleAdd);
    return () => window.removeEventListener("add-to-voloo-basket", handleAdd);
  }, [addToBasket]);

  // Derived: total number of individual items in the basket (for badge)
  const basketCount = basket.reduce((sum, item) => sum + item.quantity, 0);
  // Derived: order total price
  const basketTotal = basket.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
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
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
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
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: "expo.inOut" },
      )
      .to(
        chatContainerRef.current,
        { opacity: 1, duration: 0.45, onComplete: () => setIsOpen(true) },
        "-=0.35",
      )
      .from(
        ".voloo-ui-element",
        {
          y: 16,
          opacity: 0,
          stagger: 0.08,
          duration: 0.35,
          ease: "power2.out",
        },
        "-=0.2",
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
        "-=0.25",
      )
      .to(overlayRef.current, { opacity: 0, duration: 0.2 }, "-=0.2");
    return tl;
  };

  const shrinkToProcessing = async () => {
    const tl = gsap.timeline();
    tl.to(chatContainerRef.current, { opacity: 0, duration: 0.25 })
      .to(
        overlayRef.current,
        {
          clipPath: "inset(50% 0% 50% 0%)",
          duration: 0.55,
          ease: "expo.inOut",
        },
        "-=0.25",
      )
      .set(processingPillRef.current, {
        display: "flex",
        opacity: 0,
        scale: 0.85,
      })
      .to(processingPillRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "back.out(1.7)",
      })
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
          const ingredientsStr = p.ingredients
            ? `Ingredients: ${p.ingredients}.`
            : "";
          const allergenStr = p.allergens
            ? `Allergens: ${p.allergens.join(", ")}.`
            : "";
          const nutritionStr = p.nutrition
            ? `Nutrition: ${JSON.stringify(p.nutrition)}.`
            : "";
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
        content:
          data.response || "I apologize, but I couldn't process that request.",
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
      setIsProcessing(false);

      if (chatMode === "collapse") {
        setIsReady(true);
        setTimeout(() => {
          setIsReady(false);
          openChatAnimation();
        }, 2500);
      }
    } catch (error) {
      console.error("VolooAI Error", error);
      setIsProcessing(false);
      // On error keep the optimistic user message visible so the user can retry
      if (chatMode === "collapse") setTimeout(() => openChatAnimation(), 500);
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
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <DesktopTrigger
        isOpen={isOpen}
        isProcessing={isProcessing}
        isReady={isReady}
        openChatAnimation={openChatAnimation}
        theme={theme}
        processingPillRef={processingPillRef}
      />
      <MobileTrigger
        isOpen={isOpen}
        isProcessing={isProcessing}
        isReady={isReady}
        openChatAnimation={openChatAnimation}
      />

      {/* ── Full-screen Overlay Shell ── */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[90] hidden items-center justify-center"
        style={{
          backgroundColor: theme.backgroundColor,
          clipPath: "inset(50% 0% 50% 0%)",
          height: "100%",
          // Prevent the entire overlay from being dragged/panned off-screen
          // on touch devices.
          overscrollBehavior: "none",
          touchAction: "none",
          overflow: "hidden",
        }}
      >
        <div
          ref={chatContainerRef}
          className="w-full flex flex-col opacity-0 relative overflow-hidden"
          style={{
            height: "100dvh",
            backgroundColor: theme.backgroundColor,
            color: theme.textColor,
          }}
        >
          {/* --- AI CHAT AMBIENT BACKGROUND --- */}
          {backgroundTemplate !== "none" && (
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
              {backgroundTemplate === "light_rays" && (
                <LightRays
                  color={`${theme.primaryColor}30`}
                  count={5}
                  blur={32}
                />
              )}
              {backgroundTemplate === "flickering_grid" && (
                <FlickeringGrid
                  className="absolute inset-0 z-0"
                  squareSize={3}
                  gridGap={6}
                  color={theme.primaryColor}
                  maxOpacity={0.18}
                  flickerChance={0.06}
                />
              )}
            </div>
          )}

          {/* ════════ HEADER ════════ */}
          <div
            className="voloo-ui-element flex items-center justify-between px-4 pb-[10px] pt-[calc(env(safe-area-inset-top)+10px)] sticky top-0 z-10"
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

            {/* Right – controls (bigger touch targets) */}
            <div className="flex items-center gap-1.5">
              {/* Language toggle */}
              <div
                className="flex items-center p-1 rounded-xl border border-white/8"
                style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
              >
                {["en", "ka"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageSwitch(lang)}
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200"
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

              {/* Chat Mode toggle — bigger touch targets */}
              <div
                className="relative flex items-center p-1 rounded-xl border border-white/8"
                style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
              >
                {/* ── Onboarding Tooltip ── */}
                {showTooltip && (
                  <div
                    className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[160px] p-2 rounded-lg text-center text-xs font-semibold text-white shadow-2xl animate-fade-in pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColorLight})`,
                      boxShadow: `0 8px 32px ${theme.primaryColor}50`,
                    }}
                  >
                    Chat auto-minimizes so you can view the menu.
                    <div
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                  </div>
                )}
                <button
                  onClick={() => setChatMode("collapse")}
                  aria-label="Auto-collapse mode"
                  title="Auto collapse"
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg transition-all duration-200"
                  style={
                    chatMode === "collapse"
                      ? { backgroundColor: theme.primaryColor, color: "#fff" }
                      : {}
                  }
                >
                  <ArrowDownToLine className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setChatMode("keep")}
                  aria-label="Keep open mode"
                  title="Keep open"
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg transition-all duration-200"
                  style={
                    chatMode === "keep"
                      ? { backgroundColor: theme.primaryColor, color: "#fff" }
                      : {}
                  }
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* New Chat button */}
              <button
                onClick={handleNewChat}
                aria-label="Start new chat"
                title="New Chat"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-white/5 text-zinc-500 hover:text-zinc-200 group"
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              </button>

              {/* Basket toggle button */}
              <button
                onClick={() => setIsBasketOpen(true)}
                aria-label="Open order basket"
                className="relative min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-white/5"
                style={{
                  color:
                    basketCount > 0
                      ? theme.primaryColorLight
                      : "rgba(255,255,255,0.4)",
                }}
              >
                <ShoppingBag className="w-4 h-4" />
                {basketCount > 0 && (
                  <span
                    className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full text-white text-[8px] font-black"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {basketCount > 9 ? "9+" : basketCount}
                  </span>
                )}
              </button>

              {/* Close */}
              <button
                onClick={closeChatAnimation}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all duration-200 group"
              >
                <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* ════════ MESSAGES AREA ════════ */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto scrollbar-hide"
          >
            {/*
              pb is dynamic:
              • 36 = base clearance for the floating pill (~144px)
              • +8 (~32px) extra when context chips are visible
            */}
            <div
              className={`max-w-3xl mx-auto w-full px-4 py-6 space-y-6 transition-[padding] duration-300 ${
                hasContext ? "pb-44" : "pb-36"
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
                    <Sparkles
                      className="w-6 h-6"
                      style={{ color: theme.primaryColorLight }}
                    />
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
                      className="flex items-center gap-2 px-5 py-2.5 rounded-[27.5px] relative overflow-hidden backdrop-blur-[20px] bg-gradient-to-b from-white/10 to-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.1)] active:scale-95 active:bg-white/20 transition-all duration-300 group"
                      style={{ color: theme.textColor }}
                      onMouseEnter={(e) => {
                        const border = e.currentTarget.querySelector(
                          ".inner-border",
                        ) as HTMLDivElement;
                        if (border)
                          border.style.borderColor = `${theme.primaryColor}80`;
                      }}
                      onMouseLeave={(e) => {
                        const border = e.currentTarget.querySelector(
                          ".inner-border",
                        ) as HTMLDivElement;
                        if (border)
                          border.style.borderColor = "rgba(255,255,255,0.2)";
                      }}
                    >
                      <div className="inner-border absolute inset-0 rounded-[27.5px] border border-white/20 pointer-events-none transition-colors duration-300" />
                      <SlidersHorizontal
                        className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180"
                        style={{ color: theme.primaryColorLight }}
                      />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Dietary Requirements
                      </span>
                      {userAllergies.length > 0 && (
                        <span
                          className="w-2 h-2 rounded-full ml-1 animate-pulse"
                          style={{ backgroundColor: theme.primaryColor }}
                        />
                      )}
                    </button>
                  </div>

                  <div className="voloo-ui-element flex flex-wrap gap-2 justify-center">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(suggestion)}
                        className="relative overflow-hidden px-4 py-2.5 text-xs font-semibold rounded-[27.5px] text-zinc-300 hover:text-zinc-100 active:scale-95 transition-all duration-300 min-h-[44px] backdrop-blur-[20px] bg-gradient-to-b from-white/10 to-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.1)]"
                        onMouseEnter={(e) => {
                          const border = e.currentTarget.querySelector(
                            ".inner-border",
                          ) as HTMLDivElement;
                          if (border)
                            border.style.borderColor = `${theme.primaryColor}80`;
                        }}
                        onMouseLeave={(e) => {
                          const border = e.currentTarget.querySelector(
                            ".inner-border",
                          ) as HTMLDivElement;
                          if (border)
                            border.style.borderColor = "rgba(255,255,255,0.2)";
                        }}
                      >
                        <div className="inner-border absolute inset-0 rounded-[27.5px] border border-white/20 pointer-events-none transition-colors duration-300" />
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
                <div
                  key={`${msg.timestamp}-${idx}`}
                  className={`message-item-${idx}`}
                >
                  {msg.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="max-w-[75%] px-4 py-2.5 rounded-[27.5px] rounded-br-sm text-zinc-100 text-sm leading-relaxed relative overflow-hidden backdrop-blur-[20px] bg-gradient-to-b from-white/10 to-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
                        <div className="absolute inset-0 rounded-[27.5px] rounded-br-sm border border-white/20 pointer-events-none" />
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
                        <FormatMessage
                          content={msg.content}
                          accentColor={theme.primaryColorLight}
                        />
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
                <div className="mt-8 p-6 rounded-[27.5px] text-center animate-fade-in relative overflow-hidden backdrop-blur-[20px] bg-gradient-to-b from-white/10 to-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
                  <div className="absolute inset-0 rounded-[27.5px] border border-white/20 pointer-events-none" />
                  <h4 className="text-zinc-200 font-bold text-sm mb-4">
                    How is your AI experience?
                  </h4>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => {
                          submitRating({ sessionId, cafeId, rating: star });
                          setHasRated(true);
                          sessionStorage.setItem(
                            `rated_${cafeId}_${sessionId}`,
                            "true",
                          );
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
                  <p
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: theme.primaryColorLight }}
                  >
                    Thank you!
                  </p>
                </div>
              )}

              {/* ── Typing Indicator ── */}
              {isProcessing && chatMode === "keep" && (
                <div className="flex items-center gap-1.5 pl-1">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColorLight})`,
                    }}
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
                    <div
                      className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s]"
                      style={{ backgroundColor: theme.primaryColorLight }}
                    />
                    <div
                      className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s]"
                      style={{ backgroundColor: theme.primaryColorLight }}
                    />
                    <div
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ backgroundColor: theme.primaryColorLight }}
                    />
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
            <div
              className="max-w-3xl mx-auto px-4 flex flex-col gap-2 pointer-events-auto"
              style={{
                paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))",
              }}
            >
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
                        setSelectedContext((prev) =>
                          prev.filter((p) => p.id !== id),
                        )
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
                onTyping={() => setShowTooltip(false)}
              />
            </div>
          </div>
          {/* end floating input */}

          {/* ════════ ORDER BASKET DRAWER ════════ */}
          <BasketDrawer
            isBasketOpen={isBasketOpen}
            setIsBasketOpen={setIsBasketOpen}
            basket={basket}
            basketCount={basketCount}
            basketTotal={basketTotal}
            theme={theme}
            updateQuantity={updateQuantity}
            handlePlaceOrder={handlePlaceOrder}
            isPlacingOrder={isPlacingOrder}
            orderSuccess={orderSuccess}
            seatNumber={seatNumber}
            setSeatNumber={setSeatNumber}
          />
          {/* end basket drawer */}
        </div>
      </div>

      {/* ════════ PREFERENCES MODAL ════════ */}
      <PreferencesModal
        isPreferencesOpen={isPreferencesOpen}
        setIsPreferencesOpen={setIsPreferencesOpen}
        userAllergies={userAllergies}
        toggleAllergy={toggleAllergy}
        theme={theme}
      />
    </>
  );
}
