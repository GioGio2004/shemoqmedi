"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Loader2, Minimize2, Maximize2, ShoppingBag } from "lucide-react";
import gsap from "gsap";
import Image from "next/image";
import { PRODUCTS } from "../../app/[locale]/(temlates)/(coffee-shops)/coffee-3/_components/image-listing"; // Ensure this path is correct
import { ContactDropdown } from "../../app/[locale]/(temlates)/(coffee-shops)/coffee-3/_components/contact-dropdown"; // Ensure this path is correct

// Context content hardcoded for client-side simplicity, or fetch from file/prop
const NOIR_CONTEXT = `
You are the AI assistant for Noir Coffee Shop.
MENU & IDs:
1. Obsidian Espresso ($4.50)
2. Flat White Noise ($5.50)
3. V60 Slow Drip ($6.50)
4. Cold Brew Void ($6.00)
5. Midnight Matcha ($6.75)
6. Charcoal Latte ($7.00)
7. Golden Tonic ($6.00)
8. Lavender Fog ($6.50)
9. Eclipse Croissant ($5.00)
10. Basque Burnt Cake ($8.50)
11. Shadow Toast ($12.00)
12. Noir Brownie ($4.75)

INSTRUCTION: If suggesting an item, append [PRODUCT_ID: X] to the end.
`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function VolooAIGeminiSideComponent({ apiEndpoint = "/api/chat" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isMinimized]);

  // GSAP Entrance/Exit Animations
  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(chatRef.current, 
        { y: 20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" }
      );
    }
  }, [isOpen]);

  // Toggle Minimize/Maximize Animation
  useEffect(() => {
    if (!chatRef.current) return;
    if (isMinimized) {
      gsap.to(chatRef.current, { height: "80px", width: "320px", borderRadius: "100px", duration: 0.5, ease: "expo.inOut" });
    } else {
      gsap.to(chatRef.current, { height: "600px", width: "400px", borderRadius: "24px", duration: 0.5, ease: "expo.inOut" });
    }
  }, [isMinimized]);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue(""); // Clear input immediately
    
    // Add user message
    const newHistory = [...messages, { role: "user" as const, content: userText }];
    setMessages(newHistory);
    setIsProcessing(true);

    // Optional: Auto-collapse while thinking if specifically requested, 
    // but usually users like to see the "Thinking..." state.
    // We will keep it open to show the loader.

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          context: NOIR_CONTEXT,
          conversationHistory: newHistory
        })
      });

      const data = await res.json();
      
      // If user collapsed while waiting, auto-expand on response
      if (isMinimized) setIsMinimized(false);

      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "assistant", content: "The void is silent right now. Please try again." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to parse text and inject Product Cards
  const renderMessageContent = (content: string) => {
    // Regex to find [PRODUCT_ID: X]
    const productRegex = /\[PRODUCT_ID:\s*(\d+)\]/g;
    const matches = [...content.matchAll(productRegex)];
    
    // Clean text by removing tags
    const cleanText = content.replace(productRegex, "").trim();

    return (
      <div className="flex flex-col gap-4">
        {/* Text Content */}
        {cleanText && <p className="leading-relaxed whitespace-pre-wrap">{cleanText}</p>}

        {/* Render Product Cards if found */}
        {matches.length > 0 && (
          <div className="grid grid-cols-1 gap-3 mt-2">
            {matches.map((match, idx) => {
              const id = parseInt(match[1]);
              const product = PRODUCTS.find(p => p.id === id);
              
              if (!product) return null;

              return (
                <div key={idx} className="bg-black/40 border border-white/10 rounded-2xl p-3 flex gap-3 items-center shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Image */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                    <Image 
                      src={product.image} 
                      alt={product.name} 
                      fill 
                      className="object-cover" 
                      sizes="64px"
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-white truncate">{product.name}</h4>
                      <span className="text-xs font-mono text-orange-500">${product.price.toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate">{product.category}</p>
                    
                    {/* Action Button - Reusing existing ContactDropdown but styled smaller */}
                    <div className="mt-2 flex justify-end">
                       <ContactDropdown 
                         productName={product.name}
                         productCategory={product.category}
                         productPrice={product.price}
                         productImage={product.image}
                         colorClass="bg-orange-600 hover:bg-orange-700 !py-1 !px-3 !text-[10px] !h-auto"
                       />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans flex flex-col items-end">
      
      {/* 1. Trigger Button (Visible when closed) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="group relative p-4 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl hover:scale-110 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-orange-600/20 blur-xl rounded-full group-hover:bg-orange-600/40 transition-all" />
          <Sparkles className="w-6 h-6 text-orange-500 relative z-10" />
        </button>
      )}

      {/* 2. Main Chat Container */}
      {isOpen && (
        <div 
          ref={chatRef}
          className="bg-black/60 backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col transition-all will-change-transform origin-bottom-right"
          style={{ width: '400px', height: '600px', borderRadius: '24px' }}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5 transition-all ${isMinimized ? 'h-full cursor-pointer' : ''}`}
               onClick={() => isMinimized && setIsMinimized(false)}>
            
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
              <span className="font-bold text-sm tracking-widest uppercase text-white">Noir Assistant</span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-red-500/20 rounded-full transition-colors text-zinc-400 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Content Area (Hidden when minimized) */}
          <div className={`flex-1 flex flex-col transition-opacity duration-300 ${isMinimized ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'}`}>
            
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-4">
                  <ShoppingBag className="w-12 h-12 opacity-20" />
                  <p className="text-sm">Ask for a recommendation.<br/>"What goes well with an espresso?"</p>
                </div>
              )}
              
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div 
                    className={`max-w-[85%] p-4 text-sm rounded-2xl ${
                      msg.role === "user" 
                        ? "bg-orange-600 text-white shadow-[0_4px_20px_-4px_rgba(234,88,12,0.5)]" 
                        : "bg-zinc-900/80 border border-white/10 text-zinc-200"
                    }`}
                  >
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900/50 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/20 border-t border-white/5 backdrop-blur-lg">
              <div className="relative flex items-center">
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask noir..."
                  className="w-full bg-zinc-900/50 border border-white/10 text-white rounded-full py-3 px-5 text-sm focus:outline-none focus:border-orange-500/50 focus:bg-zinc-900 transition-all placeholder:text-zinc-600"
                />
                <button 
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isProcessing}
                  className="absolute right-2 p-2 bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-500 disabled:opacity-50 disabled:hover:bg-orange-600 transition-all"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}