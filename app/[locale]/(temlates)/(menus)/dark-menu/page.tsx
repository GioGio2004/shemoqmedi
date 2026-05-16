"use client";

import { motion } from "framer-motion";
import { MenuSection } from "./components/MenuSection";
import { CafeInfo } from "./components/CafeInfo";
import { Coffee, ChevronDown } from "lucide-react";

const COFFEE_ITEMS = [
  {
    id: 1,
    name: 'Espresso Noir',
    description: 'A concentrated shot of our darkest roast, rich and bold with notes of dark cocoa.',
    price: '$3.50',
    imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80',
  },
  {
    id: 2,
    name: 'Midnight Mocha',
    description: 'Dark Belgian chocolate mixed with double espresso and steamed velvet milk.',
    price: '$5.00',
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80',
  },
  {
    id: 3,
    name: 'Velvet Latte',
    description: 'Smooth espresso layered with micro-foam and a hint of Madagascar vanilla.',
    price: '$4.50',
    imageUrl: 'https://images.unsplash.com/photo-1557142046-c704a3adf364?w=500&q=80',
  },
  {
    id: 4,
    name: 'Shadow Cold Brew',
    description: 'Steeped for 24 hours in complete darkness, served over ice for a crisp finish.',
    price: '$4.00',
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&q=80',
  },
];

const CAKE_ITEMS = [
  {
    id: 1,
    name: 'Obsidian Truffle',
    description: 'Decadent dark chocolate cake with a molten center, dusted with gold.',
    price: '$7.00',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80',
  },
  {
    id: 2,
    name: 'Crimson Velvet',
    description: 'Classic red velvet layered with rich cream cheese frosting.',
    price: '$6.50',
    imageUrl: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=500&q=80',
  },
  {
    id: 3,
    name: 'Twilight Cheesecake',
    description: 'New York style burnt basque cheesecake topped with dark berries.',
    price: '$7.50',
    imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80',
  },
  {
    id: 4,
    name: 'Matcha Moss',
    description: 'Earthy matcha sponge cake layered with white chocolate ganache.',
    price: '$6.50',
    imageUrl: 'https://images.unsplash.com/photo-1519869491916-8ca6f615d6bd?w=500&q=80',
  },
];

const SNACK_ITEMS = [
  {
    id: 1,
    name: 'Smoked Almonds',
    description: 'Hickory smoked almonds tossed with coarse sea salt and rosemary.',
    price: '$4.00',
    imageUrl: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500&q=80',
  },
  {
    id: 2,
    name: 'Artisan Croissant',
    description: 'Flaky, buttery pastry baked fresh daily in our ovens.',
    price: '$3.50',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80',
  },
  {
    id: 3,
    name: 'Charcoal Macarons',
    description: 'Activated charcoal shells filled with dark chocolate ganache.',
    price: '$5.50',
    imageUrl: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=500&q=80',
  },
  {
    id: 4,
    name: 'Savory Tart',
    description: 'Caramelized onion, thyme, and gruyere cheese tartlette.',
    price: '$6.00',
    imageUrl: 'https://images.unsplash.com/photo-1519915028121-7d3463d20eb4?w=500&q=80',
  },
];

export default function DarkMenuPage() {
  const scrollToMenu = () => {
    document.getElementById('menu-start')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neutral-50 selection:bg-amber-500/30 overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] w-full flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&q=80" 
            alt="Cafe ambiance" 
            className="h-full w-full object-cover opacity-20 object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center px-4 flex flex-col items-center"
        >
          <div className="mb-6 rounded-full bg-neutral-900/80 p-4 ring-1 ring-white/10 backdrop-blur-md">
            <Coffee className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-6xl sm:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-neutral-100 via-neutral-300 to-neutral-600 mb-6 drop-shadow-2xl">
            NOCTURNE
          </h1>
          <p className="text-lg sm:text-2xl text-neutral-400 font-light tracking-widest uppercase max-w-2xl mx-auto mb-12">
            Coffee <span className="text-amber-500 mx-2">•</span> Pastries <span className="text-amber-500 mx-2">•</span> Atmosphere
          </p>
          
          <motion.button 
            onClick={scrollToMenu}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex flex-col items-center text-neutral-500 hover:text-amber-500 transition-colors duration-300 group"
          >
            <span className="text-sm font-medium tracking-widest uppercase mb-2">Explore Menu</span>
            <ChevronDown className="h-6 w-6 animate-bounce" />
          </motion.button>
        </motion.div>
      </div>

      <div id="menu-start" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
        <MenuSection 
          title="Elixirs" 
          description="Crafted espresso beverages from single-origin beans, roasted locally."
          items={COFFEE_ITEMS} 
        />
        
        <MenuSection 
          title="Indulgences" 
          description="Decadent pastries and cakes baked fresh throughout the day."
          items={CAKE_ITEMS} 
        />
        
        <MenuSection 
          title="Bites" 
          description="Savory and sweet accompaniments perfectly paired with our brews."
          items={SNACK_ITEMS} 
        />

        <CafeInfo />
      </div>
    </main>
  );
}
