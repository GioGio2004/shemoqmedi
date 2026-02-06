"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslations, useLocale } from "next-intl";
import { 
  ArrowLeft, CreditCard, Truck, ShieldCheck, 
  Trash2, MapPin, Mail, User, Phone 
} from "lucide-react";

import { useCart, CartProvider } from "../_components/cart-context";
import { ShopNavbar } from "../_components/shop-navbar";

function CheckoutContent() {
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const { items, total, removeItem } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  useGSAP(() => {
    gsap.from(".fade-in", {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out"
    });
  }, { scope: containerRef });

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      alert("Order placed successfully! (Demo)");
      setIsProcessing(false);
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-black mb-4">Your bag is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven&apos;t added any artifacts yet.</p>
        <Link 
          href={`/${locale}/shop`}
          className="px-8 py-4 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-all"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto px-6 pb-24">
      <Link href={`/${locale}/shop`} className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-colors fade-in">
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </Link>

      <h1 className="text-4xl md:text-5xl font-black mb-12 fade-in">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
        
        {/* LEFT: Shipping Form */}
        <div className="flex-1 fade-in">
          <form onSubmit={handlePayment} className="space-y-8">
            {/* Contact Info */}
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm">1</span>
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                   <div className="relative">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                     <input required type="email" placeholder="you@example.com" className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none" />
                   </div>
                </div>
              </div>
            </section>

            {/* Shipping Details */}
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm">2</span>
                Shipping Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                    <div className="relative">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                       <input required type="text" placeholder="John Doe" className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none" />
                    </div>
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                    <div className="relative">
                       <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                       <input required type="text" placeholder="123 Marble St" className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none" />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                    <input required type="text" placeholder="New York" className="w-full px-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none" />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Postal Code</label>
                    <input required type="text" placeholder="10001" className="w-full px-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none" />
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                    <div className="relative">
                       <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                       <input required type="tel" placeholder="+1 (555) 000-0000" className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none" />
                    </div>
                 </div>
              </div>
            </section>

            {/* Payment (Visual) */}
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 opacity-80">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm">3</span>
                Payment
              </h2>
              <div className="p-4 border-2 border-black rounded-xl flex items-center gap-4 bg-gray-50">
                 <CreditCard className="w-6 h-6" />
                 <div>
                    <p className="font-bold">Credit Card (Stripe)</p>
                    <p className="text-xs text-gray-500">Secure encryption</p>
                 </div>
                 <div className="ml-auto w-4 h-4 rounded-full bg-black" />
              </div>
            </section>

             <button 
               disabled={isProcessing}
               className="w-full py-5 bg-black text-white text-xl font-bold rounded-2xl hover:bg-gray-800 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
               {isProcessing ? "Processing..." : `Pay $${total.toLocaleString()}`}
             </button>
             
             <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
               <ShieldCheck className="w-4 h-4" /> Secure 256-bit SSL Encrypted Payment
             </div>
          </form>
        </div>

        {/* RIGHT: Order Summary */}
        <div className="w-full lg:w-[400px] shrink-0 fade-in delay-100">
           <div className="sticky top-32 bg-white/50 backdrop-blur-xl p-8 rounded-[2rem] border border-white/50 shadow-xl">
             <h3 className="text-2xl font-black mb-8">Order Summary</h3>
             
             <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
               {items.map((item) => (
                 <div key={item.id} className="flex gap-4">
                   <div className="w-20 h-20 bg-gray-100 rounded-xl relative overflow-hidden shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-sm truncate pr-2">{item.name}</h4>
                        <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                           <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-medium text-gray-500">Qty: {item.quantity}</span>
                        <span className="font-bold">${(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                   </div>
                 </div>
               ))}
             </div>

             <div className="space-y-3 pt-6 border-t border-gray-200">
               <div className="flex justify-between text-gray-600">
                 <span>Subtotal</span>
                 <span>${total.toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-gray-600">
                 <span>Shipping</span>
                 <span className="text-green-600 font-medium">Free</span>
               </div>
               <div className="flex justify-between text-2xl font-black pt-4 mt-4 border-t border-gray-200">
                 <span>Total</span>
                 <span>${total.toLocaleString()}</span>
               </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 overflow-x-hidden">
      <CartProvider>
         <ShopNavbar />
         <div className="pt-32">
            <CheckoutContent />
         </div>
      </CartProvider>
    </div>
  );
}
