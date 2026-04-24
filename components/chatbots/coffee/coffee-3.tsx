"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { X, Send, Sparkles, Loader2, ArrowDownToLine, Eye } from "lucide-react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProductCard } from "@/components/chatbots/product-card-chat";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

// ─── Types ────────────────────────────────────────────────────────────────────
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
}

interface VolooAIChatProps {
  apiEndpoint?: string;
  localizedProducts?: Product[];
}

// ─── Session storage key ───────────────────────────────────────────────────────
const CONTEXT_KEY = "voloo_chat_selected_context";

// ─── FormatMessage ─────────────────────────────────────────────────────────────
const FormatMessage = memo(({ content }: { content: string }) => {
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
                  <span key={j} className="font-bold text-orange-400">
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
});
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

// ─── ProductRow ────────────────────────────────────────────────────────────────
const ProductRow = memo(
  ({
    productIds,
    localizedProducts,
    isBackgroundDark,
    rowId,
    selectedContext,
    onToggleSelection,
  }: {
    productIds: number[];
    localizedProducts: Product[];
    isBackgroundDark: boolean;
    rowId: string;
    selectedContext: Product[];
    onToggleSelection: (product: Product) => void;
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
            />
          ))}
        </div>
      </div>
    );
  }
);
ProductRow.displayName = "ProductRow";

// ─── Main Component ────────────────────────────────────────────────────────────
export function Coffee3({
  apiEndpoint = "/api/chat",
  localizedProducts = [],
}: VolooAIChatProps) {
  const t = useTranslations("CoffeeTemplate3.Chatbot");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // ── State ──
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatMode, setChatMode] = useState<"collapse" | "keep">("collapse");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isBackgroundDark] = useState(true);

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

  // ── Refs ──
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const processingPillRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollLocked = useRef(false);
  const savedScrollPos = useRef(0);

  // ── Language Switch ──
  const handleLanguageSwitch = (newLocale: string) => {
    if (newLocale === locale) return;
    const pathSegments = pathname.split("/");
    if (pathSegments.length > 1) {
      pathSegments[1] = newLocale;
    } else {
      pathSegments.splice(1, 0, newLocale);
    }
    router.replace(pathSegments.join("/"));
  };

  // ── Effects ──
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isProcessing, isOpen]);

  useEffect(() => {
    if (messages.length > 0 && isOpen) {
      const idx = messages.length - 1;
      gsap.fromTo(
        `.message-item-${idx}`,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
      );
    }
  }, [messages, isOpen]);

  // ── Scroll Locking ──
  const lockScroll = () => {
    if (!scrollLocked.current) {
      savedScrollPos.current = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${savedScrollPos.current}px`;
      document.body.style.width = "100%";
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

  // ── sendMessage — enriches payload with focusedProducts silently ──
  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue,   // ← exactly what the user typed, unchanged in the chat log
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsProcessing(true);

    if (chatMode === "collapse") await shrinkToProcessing();

    try {
      const productContext = localizedProducts
        .map((p) => `${p.name} (${p.category}) - $${p.price}: ${p.description}`)
        .join("\n");

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          productContext,
          scrollPosition: window.scrollY,
          conversationHistory: messages,
          language: locale,
          // ── Secret sauce: IDs of products the user pinned for context ──
          focusedProducts: selectedContext.map((p) => p.id),
        }),
      });

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || "I apologize, but I couldn't process that request.",
        timestamp: Date.now(),
        products: data.productIds || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (chatMode === "collapse") {
        setTimeout(() => openChatAnimation(), 300);
      }
    } catch (error) {
      console.error("VolooAI Error", error);
      if (chatMode === "collapse") setTimeout(() => openChatAnimation(), 500);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inputValue, isProcessing, chatMode]
  );

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
          className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-br from-orange-600 to-orange-500 text-white rounded-full shadow-2xl shadow-orange-900/50 hover:scale-110 transition-all duration-300 group"
        >
          <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
        </button>
      )}

      {/* ── Processing Pill ── */}
      <div ref={processingPillRef} className="fixed bottom-8 right-8 z-[100] hidden">
        <div className="px-6 py-3 bg-zinc-900/90 text-white rounded-full shadow-2xl flex items-center gap-2.5 border border-white/10 backdrop-blur-xl">
          <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
          <span className="font-bold text-xs uppercase tracking-wider">{t("thinking")}</span>
        </div>
      </div>

      {/* ── Full-screen Overlay Shell ── */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[90] hidden items-center justify-center"
        style={{ backgroundColor: "#09090b", clipPath: "inset(50% 0% 50% 0%)" }}
      >
        <div
          ref={chatContainerRef}
          className="w-full h-full flex flex-col opacity-0"
          style={{ backgroundColor: "rgba(9, 9, 11, 0.98)", color: "#e4e4e7" }}
        >
          {/* ════════ HEADER ════════ */}
          <div
            className="voloo-ui-element flex items-center justify-between px-4 py-2.5 sticky top-0 z-10"
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              backgroundColor: "rgba(9,9,11,0.92)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Left – brand */}
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-gradient-to-br from-orange-600 to-orange-500 rounded-lg shadow-lg shadow-orange-900/40">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h2 className="font-black text-sm uppercase tracking-tight leading-none text-zinc-100">
                  {t("title")}
                </h2>
                <p className="text-[9px] font-mono flex items-center gap-1.5 mt-0.5 text-zinc-500">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  {t("subtitle")}
                </p>
              </div>
            </div>

            {/* Right – controls */}
            <div className="flex items-center gap-1.5">
              {/* Language toggle */}
              <div
                className="flex items-center p-0.5 rounded-lg border border-white/8"
                style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
              >
                {["en", "ka"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageSwitch(lang)}
                    className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                      locale === lang
                        ? "bg-orange-600 text-white shadow"
                        : "text-zinc-500 hover:text-zinc-200"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {/* Chat Mode toggle */}
              <div
                className="flex items-center p-0.5 rounded-lg border border-white/8"
                style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
              >
                <button
                  onClick={() => setChatMode("collapse")}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                    chatMode === "collapse"
                      ? "bg-orange-600 text-white shadow"
                      : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  <ArrowDownToLine className="w-2.5 h-2.5" />
                  {t("auto_collapse")}
                </button>
                <button
                  onClick={() => setChatMode("keep")}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all duration-200 ${
                    chatMode === "keep"
                      ? "bg-orange-600 text-white shadow"
                      : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  <Eye className="w-2.5 h-2.5" />
                  {t("keep_open")}
                </button>
              </div>

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
              className={`max-w-3xl mx-auto w-full px-4 py-6 space-y-6 transition-[padding] duration-300 ${
                hasContext ? "pb-44" : "pb-36"
              }`}
            >
              {/* ── Welcome State ── */}
              {messages.length === 0 && (
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-5">
                  <div className="voloo-ui-element w-12 h-12 mx-auto bg-gradient-to-br from-orange-600/20 to-orange-500/5 rounded-2xl flex items-center justify-center border border-white/5">
                    <Sparkles className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="voloo-ui-element">
                    <h3 className="font-black text-xl tracking-tight text-zinc-100">
                      {t("welcome")}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1 leading-relaxed max-w-sm mx-auto">
                      {t("welcome_desc")}
                    </p>
                  </div>
                  <div className="voloo-ui-element flex flex-wrap gap-2 justify-center">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInputValue(suggestion)}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 text-zinc-400 hover:text-zinc-100 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all duration-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Message List ── */}
              {messages.map((msg, idx) => (
                <div key={idx} className={`message-item-${idx}`}>
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
                      {/* AI label */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-600 to-orange-500 flex items-center justify-center shadow shadow-orange-900/40">
                          <Sparkles className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                          AI
                        </span>
                      </div>

                      {/* Unboxed text on the dark canvas */}
                      <div className="text-zinc-300 pl-1">
                        <FormatMessage content={msg.content} />
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
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* ── Typing Indicator ── */}
              {isProcessing && chatMode === "keep" && (
                <div className="flex items-center gap-1.5 pl-1">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-600 to-orange-500 flex items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                  </div>
                  <div
                    className="flex items-center gap-1 px-3 py-2 rounded-xl"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" />
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
            <div className="max-w-3xl mx-auto px-4 pb-5 flex flex-col gap-2 pointer-events-auto">

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

              {/* ── Pill Input ── */}
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-[2rem]"
                style={{
                  backgroundColor: "rgba(24,24,27,0.88)",
                  border: hasContext
                    ? "1px solid rgba(249,115,22,0.25)"   // subtle orange tint when context active
                    : "1px solid rgba(255,255,255,0.09)",
                  backdropFilter: "blur(24px) saturate(150%)",
                  WebkitBackdropFilter: "blur(24px) saturate(150%)",
                  boxShadow: hasContext
                    ? "0 8px 40px rgba(0,0,0,0.55), 0 0 12px rgba(249,115,22,0.08) inset, inset 0 1px 0 rgba(255,255,255,0.04)"
                    : "0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
                  transition: "border-color 0.3s, box-shadow 0.3s",
                }}
              >
                {/* Subtle orange dot when context is active */}
                {hasContext && (
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: "#f97316", boxShadow: "0 0 6px rgba(249,115,22,0.7)" }}
                  />
                )}

                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    hasContext
                      ? `Ask about ${selectedContext[0]?.name}…`
                      : t("input_placeholder")
                  }
                  className="flex-1 bg-transparent outline-none text-sm text-zinc-200 placeholder:text-zinc-600 font-medium"
                />

                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || (isProcessing && chatMode === "collapse")}
                  className={`
                    shrink-0 w-8 h-8 flex items-center justify-center rounded-full
                    transition-all duration-200
                    disabled:opacity-30 disabled:cursor-not-allowed
                    ${
                      inputValue.trim()
                        ? "bg-gradient-to-br from-orange-600 to-orange-500 shadow-lg shadow-orange-900/40 hover:scale-105"
                        : "bg-white/8"
                    }
                  `}
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>

            </div>
          </div>
          {/* end floating input */}

        </div>
      </div>
    </>
  );
}