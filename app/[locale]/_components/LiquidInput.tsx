'use client';

import { useState } from 'react';
import { Send, Loader2, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiquid } from './LiquidContext';

export function LiquidInput() {
  const { 
    isSplitting, 
    startSplit, 
    setIsProcessing, 
    isProcessing, 
    setResponse, 
    appendResponse,
    query,
    setQuery
  } = useLiquid();
  
  const [isOpen, setIsOpen] = useState(true); // Initially open or controlled by some trigger

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;

    setIsProcessing(true);
    setResponse(''); // Clear previous response

    try {
      // 1. Capture current scroll center
      const scrollCenter = window.scrollY + window.innerHeight / 2;

      // 2. Call API
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           messages: [{ role: 'user', content: query }] 
           // Note: System context injection happens on the server now
        }),
      });

      if (!res.body || !res.ok) {
        throw new Error('Failed to fetch');
      }

      // 3. Trigger Split on success (or first byte)
      startSplit(scrollCenter);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        appendResponse(chunk);
      }
    } catch (error) {
      console.error(error);
      setResponse('Error: Failed to connect to the timeline.');
    } finally {
      setIsProcessing(false);
      // Optional: Clear query?
      // setQuery(''); 
    }
  };

  // If we are splitting, hide the input entirely (or morph it elsewhere)
  if (isSplitting) return null;

  return (
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full px-6 max-w-lg">
        <AnimatePresence mode="wait">
            {!isProcessing ? (
                <motion.form
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                    onSubmit={handleSubmit}
                    className="relative group"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative flex items-center bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl p-1.5 pl-5">
                         <Sparkles className="w-4 h-4 text-orange-500 mr-3 animate-pulse" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask the void..."
                            className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-100 placeholder-zinc-500 min-w-0"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!query.trim()}
                            className="p-2.5 bg-zinc-800 hover:bg-orange-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed group-submit"
                        >
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                </motion.form>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex justify-center"
                >
                    <div className="px-6 py-3 bg-zinc-900/90 backdrop-blur border border-orange-500/30 rounded-full flex items-center gap-3 shadow-2xl shadow-orange-900/20">
                        <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                        <span className="text-xs font-mono text-orange-200 uppercase tracking-widest">Processing Reality</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
  );
}

function ArrowUpRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}
