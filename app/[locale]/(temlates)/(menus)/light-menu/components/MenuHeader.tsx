"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem } from '../page';

interface MenuHeaderProps {
  scrollToSection: (id: string) => void;
  sections: string[];
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  updateQuantity: (name: string, delta: number) => void;
}

export function MenuHeader({ scrollToSection, sections, cart, isCartOpen, setIsCartOpen, updateQuantity }: MenuHeaderProps) {
  const [isSending, setIsSending] = useState(false);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#111111]/10 backdrop-blur-md bg-[#FCFCFC]/90">
        <div className="max-w-7xl mx-auto px-6 h-[90px] flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1"
          >
            <h1 className="text-2xl md:text-3xl font-serif text-[#111111] tracking-widest uppercase">Karabak</h1>
          </motion.div>
          
          <nav className="hidden md:flex gap-10 text-[11px] uppercase tracking-[0.2em] font-medium text-[#111111]">
            {sections.map((section, idx) => (
              <motion.button 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 + (idx * 0.1), ease: [0.16, 1, 0.3, 1] }}
                key={section}
                onClick={() => scrollToSection(section.toLowerCase())} 
                className="relative overflow-hidden group py-2"
              >
                <span className="group-hover:text-neutral-400 transition-colors duration-500">{section}</span>
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#111111] transform -translate-x-[105%] group-hover:translate-x-0 transition-transform duration-700 ease-[0.76,0,0.24,1]"></span>
              </motion.button>
            ))}
          </nav>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex justify-end gap-4"
          >
             <button 
               onClick={() => setIsCartOpen(true)}
               className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] font-medium border border-[#111111] px-6 py-3 hover:bg-[#111111] hover:text-[#FCFCFC] transition-all duration-700 ease-[0.76,0,0.24,1]"
             >
               Cart ({totalItems})
             </button>
          </motion.div>
        </div>
      </header>
      
      {/* Marquee Ticker */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="bg-[#111111] text-[#FCFCFC] overflow-hidden py-3"
      >
        <div className="whitespace-nowrap inline-flex items-center text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-light" style={{ animation: 'marquee 35s linear infinite' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center shrink-0">
              <span className="mx-8 opacity-80">Authentic Turkish & Georgian Cuisine</span>
              <span className="mx-8 text-neutral-600 opacity-50">•</span>
              <span className="mx-8 opacity-80">Wood-Fired Khachapuri</span>
              <span className="mx-8 text-neutral-600 opacity-50">•</span>
              <span className="mx-8 opacity-80">Charcoal Grilled Kebabs</span>
              <span className="mx-8 text-neutral-600 opacity-50">•</span>
              <span className="mx-8 opacity-80">Tbilisi, Georgia</span>
              <span className="mx-8 text-neutral-600 opacity-50">•</span>
            </div>
          ))}
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}} />
      </motion.div>

      {/* Cart Drawer Overlay */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 bg-[#FCFCFC]/80 backdrop-blur-sm z-50"
              onClick={() => setIsCartOpen(false)}
            />
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              className="fixed top-0 right-0 w-full md:w-[400px] h-full bg-[#FCFCFC] border-l border-[#111111] z-50 flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-[#111111] flex justify-between items-center">
                <h2 className="text-xl font-serif text-[#111111] tracking-widest uppercase">Your Order</h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="text-2xl font-light text-[#111111] hover:opacity-50 transition-opacity"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {cart.length === 0 ? (
                  <p className="text-[#555555] font-serif italic text-center mt-10">Your cart is elegantly empty.</p>
                ) : (
                  cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b border-[#111111]/10 pb-4">
                      <div className="flex items-center gap-4">
                        {item.imageUrl && (
                          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-[#111111]/5">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover saturate-[0.8]" />
                          </div>
                        )}
                        <div>
                          <p className="text-[13px] uppercase tracking-widest font-semibold text-[#111111] mb-2">{item.name}</p>
                          <div className="flex items-center gap-4">
                            <button onClick={() => updateQuantity(item.name, -1)} className="text-[#555555] hover:text-[#111111]">-</button>
                            <span className="text-[12px] text-[#555555]">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.name, 1)} className="text-[#555555] hover:text-[#111111]">+</button>
                          </div>
                        </div>
                      </div>
                      <p className="text-[13px] font-medium text-[#111111]">{item.price * item.quantity} GEL</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 border-t border-[#111111] bg-[#FCFCFC]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[11px] uppercase tracking-widest text-[#555555]">Total</span>
                  <span className="text-lg font-serif text-[#111111]">{totalPrice} GEL</span>
                </div>
                <button 
                  onClick={async () => {
                    if (cart.length === 0 || isSending) return;
                    setIsSending(true);
                    try {
                      const res = await fetch('/api/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ cart, totalPrice })
                      });
                      if (res.ok) {
                        alert('Order sent successfully!');
                        setIsCartOpen(false);
                      } else {
                        alert('Failed to send order.');
                      }
                    } catch (e) {
                      alert('Failed to send order.');
                    } finally {
                      setIsSending(false);
                    }
                  }}
                  className="w-full bg-[#111111] text-[#FCFCFC] py-4 text-[11px] uppercase tracking-[0.2em] hover:bg-transparent hover:text-[#111111] hover:shadow-[inset_0_0_0_1px_#111111] transition-all duration-700 ease-[0.76,0,0.24,1]"
                >
                  {isSending ? 'Sending...' : 'Send the order'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
