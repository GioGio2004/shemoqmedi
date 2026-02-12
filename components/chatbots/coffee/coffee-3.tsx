"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Loader2, ArrowDownToLine, Eye } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProductCard } from "@/components/chatbots/product-card-chat";
// 1. Import navigation hooks
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

// --- Types ---
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

// --- Helper Component: Text Formatter ---
const FormatMessage = ({ content }: { content: string }) => {
  if (!content) return null;
  
  return (
    <div className="space-y-2">
      {content.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        
        return (
          <p key={i} className="leading-relaxed">
            {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <span key={j} className="font-bold text-orange-500">
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
};

export function Coffee3({ 
  apiEndpoint = "/api/chat",
  localizedProducts = []
}: VolooAIChatProps) {
  
  const t = useTranslations('CoffeeTemplate3.Chatbot');
  
  // 2. Get current locale and navigation tools
  const locale = useLocale(); // 'en' or 'ka'
  const router = useRouter();
  const pathname = usePathname();

  // --- State ---
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatMode, setChatMode] = useState<"collapse" | "keep">("collapse");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isBackgroundDark, setIsBackgroundDark] = useState(true);
  
  // Note: Removed local [language, setLanguage] state. We use `locale` from next-intl now.

  // --- Refs ---
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const processingPillRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollLocked = useRef(false);
  const savedScrollPos = useRef(0);

  // --- Language Switching Logic ---
  const handleLanguageSwitch = (newLocale: string) => {
    if (newLocale === locale) return;

    // Logic to swap the locale segment in the URL (e.g. /en/home -> /ka/home)
    const pathSegments = pathname.split('/');
    // Assuming standard Next.js localization where the second segment is the locale
    // ['', 'en', 'page']
    if (pathSegments.length > 1) {
      pathSegments[1] = newLocale;
    } else {
      // Fallback if path is weird
      pathSegments.splice(1, 0, newLocale);
    }
    
    const newPath = pathSegments.join('/');
    router.replace(newPath); // Updates the URL and triggers a re-render with new translations
  };

  // --- Effects ---

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isProcessing, isOpen]);

  // Animate new messages with GSAP
  useEffect(() => {
    if (messages.length > 0 && isOpen) {
        const lastMessageIndex = messages.length - 1;
        const selector = `.message-item-${lastMessageIndex}`;
        
        gsap.fromTo(selector, 
            { opacity: 0, y: 20, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.5)" }
        );
    }
  }, [messages, isOpen]);

  // Theme Detection
  const updateViewportCenter = () => {
    const center = {
      x: window.innerWidth / 2,
      y: (window.innerHeight / 2) + window.scrollY
    };
    
    if (typeof document !== 'undefined') {
      const element = document.elementFromPoint(center.x, center.y - window.scrollY);
      if (element) {
        const bgColor = window.getComputedStyle(element).backgroundColor;
        const rgb = bgColor.match(/\d+/g);
        if (rgb) {
          const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
          setIsBackgroundDark(brightness < 128);
        }
      }
    }
  };

  // Scroll Locking
  const lockScroll = () => {
    if (!scrollLocked.current) {
      savedScrollPos.current = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${savedScrollPos.current}px`;
      document.body.style.width = "100%";
      ScrollTrigger.getAll().forEach(st => st.disable());
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
      ScrollTrigger.getAll().forEach(st => st.enable());
      scrollLocked.current = false;
    }
  };

  // --- Animations ---

  const openChatAnimation = () => {
    updateViewportCenter();
    lockScroll();

    if (chatContainerRef.current) {
      chatContainerRef.current.style.backgroundColor = isBackgroundDark ? "rgba(10,10,10,0.98)" : "rgba(250,250,250,0.98)";
      chatContainerRef.current.style.color = isBackgroundDark ? "#ffffff" : "#000000";
    }

    const tl = gsap.timeline();

    tl.set(overlayRef.current, { display: "flex", opacity: 0 })
      .to(overlayRef.current, { opacity: 1, duration: 0.2 })
      .fromTo(overlayRef.current, 
        { clipPath: "inset(50% 0% 50% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "expo.inOut" }
      )
      .to(chatContainerRef.current, {
        opacity: 1,
        duration: 0.5,
        onComplete: () => setIsOpen(true)
      }, "-=0.4")
      .from(".voloo-ui-element", {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.4,
        ease: "power2.out"
      }, "-=0.2");

    return tl;
  };

  const closeChatAnimation = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        setIsOpen(false);
        unlockScroll();
        if (overlayRef.current) overlayRef.current.style.display = "none";
      }
    });

    tl.to(chatContainerRef.current, { opacity: 0, duration: 0.3 })
      .to(overlayRef.current, { 
        clipPath: "inset(50% 0% 50% 0%)", 
        duration: 0.8, 
        ease: "expo.inOut" 
      }, "-=0.3")
      .to(overlayRef.current, { opacity: 0, duration: 0.2 }, "-=0.2");

    return tl;
  };

  const shrinkToProcessing = async () => {
    const tl = gsap.timeline();
    
    tl.to(chatContainerRef.current, { opacity: 0, duration: 0.3 })
      .to(overlayRef.current, { 
        clipPath: "inset(50% 0% 50% 0%)", 
        duration: 0.6, 
        ease: "expo.inOut" 
      }, "-=0.3")
      .set(processingPillRef.current, { display: "flex", opacity: 0, scale: 0.8 })
      .to(processingPillRef.current, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" })
      .to(overlayRef.current, { opacity: 0, duration: 0.2 }, "-=0.2")
      .add(() => {
         unlockScroll(); 
         if (overlayRef.current) overlayRef.current.style.display = "none";
      })
      .to(processingPillRef.current, { opacity: 0, scale: 0.8, duration: 0.3, delay: 0.8, onComplete: () => {
         if (processingPillRef.current) processingPillRef.current.style.display = "none";
         setIsOpen(false);
      }});

    return tl;
  };

  // --- Handlers ---

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { role: "user", content: inputValue, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsProcessing(true);

    if (chatMode === "collapse") {
        await shrinkToProcessing();
    }

    try {
      const productContext = localizedProducts.map((p) => 
        `${p.name} (${p.category}) - $${p.price}: ${p.description}`
      ).join('\n');

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          productContext,
          scrollPosition: window.scrollY,
          conversationHistory: messages,
          language: locale // 3. Use the global locale here
        })
      });

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || "I apologize, but I couldn't process that request.",
        timestamp: Date.now(),
        products: data.productIds || []
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (chatMode === "collapse") {
         setTimeout(() => {
             openChatAnimation();
         }, 300);
      }
      
    } catch (error) {
      console.error("VolooAI Error", error);
      if (chatMode === "collapse") {
          setTimeout(() => openChatAnimation(), 500);
      }
    } finally {
        setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Suggestions logic
  const suggestionKeys = ['0', '1', '2']; 
  const suggestions = suggestionKeys.map(k => t(`suggestions.${k}` as any));

  return (
    <>
      {/* GLOBAL STYLES to hide scrollbar but allow scrolling */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>

      {/* Floating Trigger */}
      {!isOpen && !isProcessing && (
        <button
          onClick={openChatAnimation}
          className="fixed bottom-6 right-6 z-50 p-4 md:p-5 bg-gradient-to-br from-orange-600 to-orange-500 text-white rounded-full shadow-2xl shadow-orange-900/50 hover:scale-110 transition-all duration-300 group backdrop-blur-xl"
        >
          <Sparkles className="w-6 h-6 md:w-7 md:h-7 group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
        </button>
      )}

      {/* Processing Pill */}
      <div ref={processingPillRef} className="fixed bottom-8 right-8 z-[100] hidden">
        <div className="px-8 py-4 bg-orange-600 text-white rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-xl border border-white/20">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-bold text-sm uppercase tracking-wider">{t('thinking')}</span>
        </div>
      </div>

      {/* Main Overlay (Full Screen) */}
      <div ref={overlayRef} className="fixed inset-0 z-[90] hidden items-center justify-center"
        style={{
          backgroundColor: isBackgroundDark ? "#000000" : "#ffffff",
          clipPath: "inset(50% 0% 50% 0%)"
        }}
      >
        <div ref={chatContainerRef} className="w-full h-full flex flex-col opacity-0 shadow-2xl"
          style={{
            backgroundColor: isBackgroundDark ? "rgba(10,10,10,0.98)" : "rgba(250,250,250,0.98)",
          }}
        >
          
          {/* Header */}
          <div className="voloo-ui-element flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 border-b backdrop-blur-xl gap-4 md:gap-0 sticky top-0 z-10"
               style={{ 
                 borderColor: isBackgroundDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
               }}>
            
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-gradient-to-br from-orange-600 to-orange-500 rounded-xl shadow-lg shadow-orange-900/30">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h2 className="font-black text-lg md:text-xl uppercase tracking-tight">{t('title')}</h2>
                <p className="text-[10px] md:text-xs opacity-60 font-mono flex items-center gap-2">
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse" />
                  {t('subtitle')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto mt-2 md:mt-0">
                {/* 4. Update Language Toggle to switch URL */}
                <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-white/10 mr-2">
                    <button 
                        onClick={() => handleLanguageSwitch('en')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all duration-300 ${
                            locale === 'en' 
                            ? 'bg-orange-600 text-white shadow-lg' 
                            : 'opacity-50 hover:opacity-100 hover:bg-white/5'
                        }`}
                    >
                        EN
                    </button>
                    <button 
                        onClick={() => handleLanguageSwitch('ka')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all duration-300 ${
                            locale === 'ka' 
                            ? 'bg-orange-600 text-white shadow-lg' 
                            : 'opacity-50 hover:opacity-100 hover:bg-white/5'
                        }`}
                    >
                        KA
                    </button>
                </div>

                {/* Chat Mode Toggle */}
                <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-white/10 w-full md:w-auto justify-center">
                    <button 
                        onClick={() => setChatMode('collapse')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase transition-all duration-300 ${
                            chatMode === 'collapse' 
                            ? 'bg-orange-600 text-white shadow-lg' 
                            : 'opacity-50 hover:opacity-100 hover:bg-white/5'
                        }`}
                    >
                        <ArrowDownToLine className="w-3 h-3" />
                        <span>{t('auto_collapse')}</span>
                    </button>
                    <button 
                        onClick={() => setChatMode('keep')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase transition-all duration-300 ${
                            chatMode === 'keep' 
                            ? 'bg-orange-600 text-white shadow-lg' 
                            : 'opacity-50 hover:opacity-100 hover:bg-white/5'
                        }`}
                    >
                        <Eye className="w-3 h-3" />
                        <span>{t('keep_open')}</span>
                    </button>
                </div>

                <button 
                    onClick={closeChatAnimation} 
                    className="p-3 rounded-xl hover:bg-white/5 transition-all duration-300 backdrop-blur-sm ml-2 group"
                >
                    <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                </button>
            </div>
          </div>

          {/* Messages Area */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scrollbar-hide max-w-5xl mx-auto w-full">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <div className="voloo-ui-element space-y-8 px-4 max-w-lg mx-auto">
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-gradient-to-br from-orange-600/20 to-orange-500/10 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/5">
                    <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-2xl md:text-3xl mb-3 tracking-tight">{t('welcome')}</h3>
                    <p className="text-base opacity-60 leading-relaxed">
                      {t('welcome_desc')}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInputValue(suggestion)}
                        className="px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-full border border-white/10 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all duration-300 hover:scale-105"
                        style={{
                          backgroundColor: isBackgroundDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`message-item-${idx} flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[90%] md:max-w-[80%] space-y-3`}>
                      <div
                        className={`rounded-2xl md:rounded-3xl px-6 py-4 shadow-lg ${
                          msg.role === "user"
                            ? "bg-gradient-to-br from-orange-600 to-orange-500 text-white"
                            : ""
                        }`}
                        style={msg.role === "assistant" ? {
                          backgroundColor: isBackgroundDark ? "rgba(30,30,30,0.8)" : "rgba(255,255,255,0.8)",
                          border: `1px solid ${isBackgroundDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                          backdropFilter: "blur(20px)"
                        } : {}}
                      >
                        <div className="text-sm md:text-lg">
                            <FormatMessage content={msg.content} />
                        </div>
                      </div>
                      
                      {msg.products && msg.products.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {msg.products.map(productId => {
                            const product = localizedProducts.find((p) => p.id === productId);
                            if (!product) return null;
                            return (
                              <ProductCard 
                                key={product.id} 
                                product={product as any}
                                isBackgroundDark={isBackgroundDark}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isProcessing && chatMode === 'keep' && (
                   <div className="flex justify-start animate-pulse">
                      <div className="rounded-3xl px-6 py-4 bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"></div>
                      </div>
                   </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div 
            className="voloo-ui-element p-4 md:p-8 border-t backdrop-blur-2xl"
            style={{ 
              borderColor: isBackgroundDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
              backgroundColor: isBackgroundDark ? "rgba(20,20,20,0.6)" : "rgba(255,255,255,0.6)"
            }}
          >
            <div className="max-w-5xl mx-auto flex gap-3 md:gap-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('input_placeholder')}
                className="flex-1 px-6 py-4 rounded-xl md:rounded-2xl border outline-none focus:border-orange-500 transition-all duration-300 font-medium backdrop-blur-xl shadow-inner text-base"
                style={{
                  backgroundColor: isBackgroundDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)",
                  borderColor: isBackgroundDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                  color: isBackgroundDark ? "#fff" : "#000"
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || (isProcessing && chatMode === 'collapse')}
                className="px-8 py-4 bg-gradient-to-br from-orange-600 to-orange-500 text-white rounded-xl md:rounded-2xl font-black hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-orange-900/30 uppercase tracking-wider"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}