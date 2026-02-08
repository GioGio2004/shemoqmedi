'use client';

import { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiquid } from './LiquidContext';
import { X } from 'lucide-react';

export function SplitScreenLayout({ children }: { children: ReactNode }) {
  const { isSplitting, chatResponse, endSplit } = useLiquid();
  const [maskStops, setMaskStops] = useState({ start: 50, end: 50 });

  useEffect(() => {
    if (isSplitting) {
      // Animate opening
      setMaskStops({ start: 30, end: 70 });
    } else {
      setMaskStops({ start: 50, end: 50 });
    }
  }, [isSplitting]);

  return (
    <>
      {/* Background / The VOID (Chat Interface) */}
      <div className="fixed inset-0 z-0 bg-black flex flex-col items-center justify-center p-8 sm:p-20 overflow-hidden">
        <AnimatePresence>
          {isSplitting && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="w-full max-w-3xl h-full flex flex-col justify-center relative"
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
              
              <div className="text-orange-500/80 font-mono text-xs uppercase tracking-[0.2em] mb-4 text-center">
                 Incoming Transmission...
              </div>

              {/* Chat Stream - Simple Text Rendering since react-markdown is missing */}
              <div className="relative font-mono text-lg md:text-xl lg:text-2xl text-orange-50 leading-relaxed text-center sm:text-left mix-blend-screen max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-orange-900 scrollbar-track-transparent">
                  <div className="whitespace-pre-wrap">
                      {chatResponse || "Listening to the void..."}
                  </div>
                  <div className="inline-block w-2 h-5 bg-orange-500 animate-pulse ml-1 align-middle" />
              </div>

              {/* Close Button Trigger */}
              <motion.button
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 2 }}
                 onClick={endSplit}
                 className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group px-6 py-2 rounded-full border border-white/5 hover:border-orange-500/50 text-sm uppercase tracking-widest bg-black/50 backdrop-blur"
              >
                  <X className="w-4 h-4" />
                  Close Reality
              </motion.button>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Foreground / The Webpage */}
      <motion.div
        className="relative z-10 bg-[#050505] min-h-screen origin-center"
        animate={{
             scale: isSplitting ? 0.95 : 1,
             filter: isSplitting ? 'grayscale(100%) brightness(0.4)' : 'grayscale(0%) brightness(1)',
        }}
        style={{
            maskImage: isSplitting 
                ? `linear-gradient(to bottom, black 0%, black ${maskStops.start}%, transparent ${maskStops.start}%, transparent ${maskStops.end}%, black ${maskStops.end}%, black 100%)`
                : `linear-gradient(to bottom, black 0%, black 50%, black 50%, black 100%)`,
            WebkitMaskImage: isSplitting 
                ? `linear-gradient(to bottom, black 0%, black ${maskStops.start}%, transparent ${maskStops.start}%, transparent ${maskStops.end}%, black ${maskStops.end}%, black 100%)`
                : `linear-gradient(to bottom, black 0%, black 50%, black 50%, black 100%)`,
            transition: 'mask-image 1.2s cubic-bezier(0.22, 1, 0.36, 1), -webkit-mask-image 1.2s cubic-bezier(0.22, 1, 0.36, 1), scale 1.2s cubic-bezier(0.22, 1, 0.36, 1), filter 0.5s',
        }}
      >
        {children}
      </motion.div>
    </>
  );
}
