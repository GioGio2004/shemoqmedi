"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
    Carousel, 
    CarouselContent, 
    CarouselItem, 
    CarouselNext, 
    CarouselPrevious 
} from "@/components/ui/carousel";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, Heart, Eye, ShoppingBag, Star } from "lucide-react";
import { CATEGORIES, PRODUCTS, Product } from "./data";

gsap.registerPlugin(ScrollTrigger);

export function ProductShowcase({ 
  onProductClick, 
  toggleWishlist, 
  addToCart,
  wishlist 
}: { 
  onProductClick: (product: Product) => void;
  toggleWishlist: (id: number) => void;
  addToCart: () => void;
  wishlist: Set<number>;
}) {
  
  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>(".reveal-cat").forEach((elem) => {
      gsap.from(elem, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: elem,
          start: "top 85%",
        }
      });
    });
  });

  return (
    <>
      {CATEGORIES.map(cat => (
        <section key={cat.id} id={cat.id} className="py-32 px-4 md:px-8 border-t border-white/5 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 reveal-cat">
              <div>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-2 text-white">
                  {cat.name}
                </h2>
                <p className="text-sm text-[#5a5a70] uppercase tracking-wider">
                  {PRODUCTS.filter(p => p.cat === cat.id).length} Products
                </p>
              </div>
              
              <div className="flex gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger className="px-4 py-2 border border-white/10 rounded-lg text-xs font-bold uppercase flex items-center gap-2 hover:border-[#00e5ff] transition-colors text-white">
                    <SlidersHorizontal size={14} /> Filter
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#0a0a1a] border-white/5 text-white">
                    <DropdownMenuItem className="text-xs">Price: Low to High</DropdownMenuItem>
                    <DropdownMenuItem className="text-xs">Price: High to Low</DropdownMenuItem>
                    <DropdownMenuItem className="text-xs">Newest First</DropdownMenuItem>
                    <DropdownMenuItem className="text-xs">Best Selling</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <button className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#00e5ff] border border-[#00e5ff] rounded-lg hover:bg-[#00e5ff] hover:text-black transition-all">
                  View All
                </button>
              </div>
            </div>

            <Carousel opts={{ align: "start", loop: true }} className="w-full reveal-cat">
              <CarouselContent className="-ml-4">
                {PRODUCTS.filter(p => p.cat === cat.id).map(product => (
                  <CarouselItem key={product.id} className="pl-4 basis-[85%] md:basis-1/3 lg:basis-1/4">
                    <div 
                      className="group bg-[#0a0a1a] rounded-3xl border border-white/5 p-4 transition-all hover:border-[#00e5ff]/30 hover:shadow-[0_0_30px_rgba(0,229,255,0.1)] cursor-pointer"
                      onClick={() => onProductClick(product)}
                    >
                      <div className="aspect-[4/5] rounded-2xl overflow-hidden relative mb-6">
                        <img 
                          src={product.image} 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                          alt={product.name} 
                        />
                        
                        {/* Badge */}
                        {product.badge && (
                          <Badge className="absolute top-3 left-3 bg-[#00e5ff] text-black text-[8px] font-black uppercase tracking-wider">
                            {product.badge}
                          </Badge>
                        )}

                        {/* Wishlist */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-[#00e5ff] transition-all group/heart"
                        >
                          <Heart 
                            size={16} 
                            className={`${wishlist.has(product.id) ? 'fill-[#00e5ff] text-[#00e5ff]' : 'text-white'} group-hover/heart:text-black transition-colors`}
                          />
                        </button>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 flex flex-col items-center justify-end p-4 gap-2 backdrop-blur-sm transition-all duration-300">
                          <button className="w-full py-2 bg-white text-black rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#00e5ff] transition-colors">
                            <Eye size={14} /> Quick View
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart();
                            }}
                            className="w-full py-2 bg-[#00e5ff] text-black rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-white transition-colors"
                          >
                            <ShoppingBag size={14} /> Add to Cart
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={i < Math.floor(product.rating) ? "fill-[#00e5ff] text-[#00e5ff]" : "text-gray-700"} 
                            />
                          ))}
                          <span className="text-[9px] text-[#5a5a70] ml-1">({product.reviews})</span>
                        </div>
                        <h4 className="font-bold text-sm tracking-tight text-white group-hover:text-[#00e5ff] transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-xs font-mono text-[#00e5ff] tracking-widest font-bold">
                          ${product.price}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center gap-4 mt-8">
                <CarouselPrevious className="relative inset-0 translate-x-0 translate-y-0" />
                <CarouselNext className="relative inset-0 translate-x-0 translate-y-0" />
              </div>
            </Carousel>
          </div>
        </section>
      ))}
    </>
  );
}
