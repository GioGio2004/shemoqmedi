"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  ShoppingBag, ArrowRight, X, Star, 
  Check, Minus, Plus, Truck, 
  RotateCcw, Search, Heart, Filter
} from "lucide-react";

import { CartProvider, useCart } from "./_components/cart-context";
import { CartSidebar } from "./_components/cart-sidebar";
import { ShopNavbar } from "./_components/shop-navbar";

// Ensure ScrollTrigger is registered
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── TYPES ───
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  features: string[];
  colors?: string[];
  sizes?: string[];
}

// ─── DATA ───
// ─── COMPONENTS ───

function ProductPopup({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]);



  useGSAP(() => {
    if (product && overlayRef.current && contentRef.current) {
      const tl = gsap.timeline();
      
      tl.to(overlayRef.current, { 
        opacity: 1, 
        duration: 0.3, 
        ease: "power2.out" 
      })
      .fromTo(contentRef.current, 
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.2)" },
        "-=0.1"
      );
    }
  }, [product]);

  const handleClose = () => {
    gsap.to(contentRef.current, { 
      y: 20, opacity: 0, scale: 0.95, duration: 0.2 
    });
    gsap.to(overlayRef.current, { 
      opacity: 0, 
      duration: 0.2, 
      onComplete: onClose 
    });
  };

  if (!product) return null;

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md opacity-0"
      onClick={handleClose}
    >
      <div 
        ref={contentRef}
        className="w-full max-w-5xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 z-10 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Image Section */}
        <div className="md:w-1/2 relative min-h-[400px] md:min-h-[600px] bg-gray-100">
           <Image
             src={product.image}
             alt={product.name}
             fill
             className="object-cover"
           />
        </div>

        {/* Details Section */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col max-h-[90vh] overflow-y-auto">
          <div className="mb-2 text-sm font-bold tracking-widest text-gray-400 uppercase">
            {product.category}
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
            {product.name}
          </h2>
          
          <div className="flex items-center gap-2 mb-6 text-sm">
             <div className="flex text-yellow-500">
               {[...Array(5)].map((_, i) => (
                 <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-current" : "text-gray-300 fill-gray-300"}`} />
               ))}
             </div>
             <span className="text-gray-500">({product.reviews} reviews)</span>
          </div>

          <p className="text-3xl font-bold text-gray-900 mb-8 font-serif">
            ${product.price.toLocaleString()}
          </p>

          <p className="text-gray-600 leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Features */}
          <div className="mb-8">
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4 text-gray-900">Features</h4>
            <div className="grid grid-cols-2 gap-3">
              {product.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" /> {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto space-y-6">
             {/* Controls */}
             <div className="flex flex-wrap gap-6 items-center">
                {product.colors && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase text-gray-400">Color</span>
                    <div className="flex gap-2">
                      {product.colors.map((c) => (
                        <button 
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${selectedColor === c ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-400"}`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                   <span className="text-xs font-bold uppercase text-gray-400">Quantity</span>
                   <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-white rounded-md shadow-sm transition-all"><Minus className="w-4 h-4" /></button>
                      <span className="w-8 text-center font-bold">{quantity}</span>
                      <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="p-2 hover:bg-white rounded-md shadow-sm transition-all"><Plus className="w-4 h-4" /></button>
                   </div>
                </div>
             </div>

             {/* Add to Cart */}
             <button
               onClick={() => {
                 for(let i=0; i<quantity; i++) addItem({ ...product, id: product.id });
                 handleClose();
               }}
               className="w-full py-5 bg-black text-white text-lg font-bold rounded-2xl hover:bg-gray-800 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl flex items-center justify-center gap-3"
             >
               <ShoppingBag className="w-6 h-6" />
               Add to Bag — ${(product.price * quantity).toLocaleString()}
             </button>
             
             <div className="flex items-center justify-center gap-6 text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1"><Truck className="w-4 h-4" /> Free Shipping</span>
                <span className="flex items-center gap-1"><RotateCcw className="w-4 h-4" /> 30-Day Returns</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───

function ShopContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawProducts = useQuery(api.products.get);
  const products = rawProducts?.map(p => ({ ...p, id: p._id })) || [];
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useGSAP(() => {
    if (!products.length) return; // Wait for products to load before animating

    // Parallax & Float animations
    gsap.to(".marble-bg", {
      yPercent: 10,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    // Reveal Products
    gsap.from(".product-card", {
      y: 100,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".product-grid",
        start: "top 80%"
      }
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#f3f4f6] text-gray-900 overflow-x-hidden">
      <CartSidebar />
      <ShopNavbar />

      {/* Marble Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2370')] bg-cover bg-center opacity-40 marble-bg scale-110" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/50 to-[#f3f4f6]/90" />
      </div>

      {/* Hero Content */}
      <section className="relative z-10 pt-40 px-6 pb-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-white/40 shadow-sm mb-6 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-gray-600">The Marble Collection</span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-gray-900 mb-8 drop-shadow-sm">
            STONE & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">SILK</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed mb-12">
            Curated artifacts for the modern connoisseur. 
            Experience the weight of history in every object.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
             <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth'})} className="px-8 py-4 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                Explore Collection <ArrowRight className="w-5 h-5" />
             </button>
             <button className="px-8 py-4 bg-white text-black border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition-all">
                Read the Journal
             </button>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 pb-6 border-b border-gray-200/50">
            <div>
              <h2 className="text-4xl font-black mb-2">Artifacts</h2>
              <p className="text-gray-500">Showing {products.length} curated items</p>
            </div>
            <div className="flex gap-4">
               <button className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"><Filter className="w-5 h-5" /></button>
               <button className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"><Search className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Grid */}
          <div className="product-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div 
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="product-card group cursor-pointer"
              >
                <div className="relative aspect-[4/5] bg-gray-100 rounded-[2rem] overflow-hidden shadow-lg mb-6 transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                   <Image 
                     src={product.image} 
                     alt={product.name} 
                     fill 
                     className="object-cover transition-transform duration-700 group-hover:scale-110"
                   />
                   
                   {/* Overlay */}
                   <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full font-bold text-sm tracking-widest uppercase transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-xl">
                        View Details
                      </div>
                   </div>

                   <button 
                     className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-md rounded-full text-black opacity-0 group-hover:opacity-100 transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75 hover:bg-black hover:text-white"
                     onClick={(e) => {
                       e.stopPropagation();
                       // Wishlist logic here
                     }}
                   >
                     <Heart className="w-5 h-5" />
                   </button>
                </div>

                <div className="px-2">
                   <div className="flex justify-between items-start mb-1">
                      <h3 className="text-xl font-bold">{product.name}</h3>
                      <span className="font-serif italic font-bold text-lg">${product.price}</span>
                   </div>
                   <p className="text-sm text-gray-500 font-medium">{product.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Teaser */}
      <section className="relative z-10 py-32 px-6 bg-black text-white mt-12 rounded-t-[3rem]">
         <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter">
              BECOME A <br/>MEMBER
            </h2>
            <p className="text-gray-400 text-xl mb-12 max-w-xl mx-auto">
              Join our exclusive circle of collectors. Get early access to limited drops and private exhibitions.
            </p>
            
            <div className="flex bg-white/10 p-2 rounded-full max-w-md mx-auto backdrop-blur-md border border-white/10">
               <input 
                 type="email" 
                 placeholder="Enter your email" 
                 className="flex-1 bg-transparent px-6 py-3 outline-none placeholder:text-gray-500"
               />
               <button className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors">
                  Join
               </button>
            </div>
         </div>
      </section>

      {/* Popup */}
      <ProductPopup 
        key={selectedProduct?.id}
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </div>
  );
}

export default function ShopPage() {
  return (
    <CartProvider>
      <ShopContent />
    </CartProvider>
  );
}
