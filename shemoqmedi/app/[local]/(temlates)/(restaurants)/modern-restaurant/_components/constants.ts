
import { 
  Zap, Disc, Atom, 
  Orbit, Gem, Aperture
} from "lucide-react";

export const MENU_CATEGORIES = [
  { id: "synthesis", name: "Synthesis (Starters)", icon: Atom },
  { id: "fusion", name: "Fusion (Mains)", icon: Disc },
  { id: "liquid", name: "Liquid Assets", icon: Zap },
];

export const DISHES = [
  // Synthesis
  { id: 1, cat: "synthesis", name: "Molecular Caprese", price: 24, image: "https://images.unsplash.com/photo-1551024601-569d6f44aa43?q=80&w=800", desc: "Spherified basil pesto, tomato foam, liquid mozzarella.", badge: "v2.0" },
  { id: 2, cat: "synthesis", name: "Zero-G Tartare", price: 28, image: "https://images.unsplash.com/photo-1546241072-48010ad28d5a?q=80&w=800", desc: "Suspended wagyu cubes, smoke infusion, nitrogen dust.", badge: "Signature" },
  { id: 3, cat: "synthesis", name: "Cyber Scallops", price: 32, image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=800", desc: "Seared scallops with bioluminescent plankton reduction." },
  
  // Fusion
  { id: 4, cat: "fusion", name: "Quantum Cod", price: 42, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800", desc: "Sous-vide black cod, miso-glaze algorithm, lotus chip.", badge: "Top Rated" },
  { id: 5, cat: "fusion", name: "Neon Duck", price: 38, image: "https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?q=80&w=800", desc: "Duck breast, ultraviolet berry reduction, synthetic mash." },
  { id: 6, cat: "fusion", name: "Titanium Steak", price: 65, image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=800", desc: "Charcoal-aged ribeye, metallic gold leaf, truffle gravity.", badge: "Premium" },

  // Liquid
  { id: 7, cat: "liquid", name: "Neural Link", price: 18, image: "https://images.unsplash.com/photo-1560512823-8db03e163b5c?q=80&w=800", desc: "Gin, butterfly pea extract, tonic activation.", badge: "Interactive" },
  { id: 8, cat: "liquid", name: "Plasma Shot", price: 14, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800", desc: "Spiced rum, blood orange, smoked rim." },
];

export const FEATURES = [
  { title: "Sensory Deprivation", desc: "Focus purely on taste with our noise-cancelling dining pods.", icon: Aperture },
  { title: "Molecular Labs", desc: "Our open kitchen resembles a chemistry lab, pushing culinary boundaries.", icon: Atom },
  { title: "AI Sommelier", desc: "Perfect wine pairings calculated by our proprietary algorithm.", icon: Gem }
];

export const SERVICES = [
  { title: "Private Pods", desc: "Soundproof glass pods for ultimate privacy.", price: "+$50" },
  { title: "Chef's Hologram", desc: "Virtual chef presentation at your table.", price: "Included" },
]
