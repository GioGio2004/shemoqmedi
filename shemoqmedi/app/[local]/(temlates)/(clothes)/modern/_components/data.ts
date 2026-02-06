
import { 
  Globe, Zap, Cpu, TruckIcon, RotateCcw, 
  ShieldCheck, HeadphonesIcon 
} from "lucide-react";

export interface Category {
  id: string;
  name: string;
  sub: string[];
}

export interface Product {
  id: number;
  cat: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
  description?: string;
  features?: string[];
  specs?: { label: string; value: string }[];
  colors?: string[];
  sizes?: string[];
}

export interface BrandPillar {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

export interface TrustBadge {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  desc: string;
}

export interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
}

export interface Stat {
  value: string;
  label: string;
}

export const CATEGORIES: Category[] = [
  { id: "outerwear", name: "Outerwear", sub: ["Tech Shells", "Cyber Jackets"] },
  { id: "footwear", name: "Footwear", sub: ["Pulse Sneakers", "Matrix Boots"] },
  { id: "accessories", name: "Accessories", sub: ["AR Gear", "Utility Bags"] },
];

export const PRODUCTS: Product[] = [
  { 
    id: 1, 
    cat: "outerwear", 
    name: "Holo Jacket v1", 
    price: 299, 
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800", 
    rating: 4.8, 
    reviews: 124, 
    badge: "Bestseller",
    description: "The Holo Jacket v1 represents the pinnacle of tech-wear innovation. Combining traditional Georgian craftsmanship with cutting-edge nano-fabric technology, this jacket adapts to your environment while maintaining peak style. Water-resistant, breathable, and equipped with smart temperature regulation.",
    features: [
      "Nano-fabric technology with self-cleaning properties",
      "Integrated heating elements for climate control",
      "Multiple hidden pockets with RFID protection",
      "Reflective panels for night visibility",
      "Weather-resistant YKK zippers"
    ],
    specs: [
      { label: "Material", value: "65% Nano-Polyester, 35% Georgian Wool" },
      { label: "Weight", value: "680g" },
      { label: "Water Resistance", value: "20,000mm" },
      { label: "Breathability", value: "15,000g/m²/24h" },
      { label: "Origin", value: "Tbilisi, Georgia" }
    ],
    colors: ["Black", "Navy", "Charcoal"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"]
  },
  { 
    id: 2, 
    cat: "outerwear", 
    name: "Neon Windbreaker", 
    price: 189, 
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800", 
    rating: 4.6, 
    reviews: 89,
    description: "Light, fast, and impossibly stylish. The Neon Windbreaker brings cyberpunk aesthetics to everyday wear with reflective accents and premium materials.",
    features: [
      "Ultra-lightweight ripstop fabric",
      "360° reflective detailing",
      "Packable design fits in its own pocket",
      "Elastic cuffs and hem",
      "Mesh ventilation panels"
    ],
    specs: [
      { label: "Material", value: "100% Recycled Nylon" },
      { label: "Weight", value: "290g" },
      { label: "Water Resistance", value: "5,000mm" },
      { label: "Origin", value: "Tbilisi, Georgia" }
    ],
    colors: ["Neon Green", "Electric Blue", "Hot Pink"],
    sizes: ["S", "M", "L", "XL"]
  },
  { 
    id: 3, 
    cat: "outerwear", 
    name: "Cyber Shell", 
    price: 450, 
    image: "https://images.unsplash.com/photo-1706765779494-2705542ebe74?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8amFja2V0fGVufDB8fDB8fHww", 
    rating: 4.9, 
    reviews: 203, 
    badge: "New",
    description: "Our most advanced outerwear yet. The Cyber Shell features AI-optimized insulation that learns your preferences and adapts throughout the day.",
    features: [
      "AI-powered temperature regulation",
      "Graphene-enhanced insulation",
      "Built-in power bank pocket with cable routing",
      "Detachable hood with magnetic closure",
      "Laser-cut ventilation system"
    ],
    specs: [
      { label: "Material", value: "3-Layer Gore-Tex Pro" },
      { label: "Weight", value: "890g" },
      { label: "Insulation", value: "AI-Adaptive Down 800-fill" },
      { label: "Temperature Range", value: "-20°C to 15°C" },
      { label: "Origin", value: "Tbilisi, Georgia" }
    ],
    colors: ["Stealth Black", "Arctic White", "Digital Camo"],
    sizes: ["XS", "S", "M", "L", "XL"]
  },
  { 
    id: 4, 
    cat: "footwear", 
    name: "Pulse Sneakers", 
    price: 159, 
    image: "https://images.unsplash.com/photo-1606890658317-7d14490b76fd?q=80&w=800", 
    rating: 4.7, 
    reviews: 156,
    description: "Step into the future with Pulse Sneakers. Energy-returning foam meets Georgian design philosophy for all-day comfort.",
    features: [
      "Energy-return midsole technology",
      "Breathable mesh upper",
      "Reflective heel counter",
      "Antimicrobial insole",
      "Recycled rubber outsole"
    ],
    specs: [
      { label: "Upper", value: "Engineered Mesh + TPU" },
      { label: "Midsole", value: "Energy Foam 2.0" },
      { label: "Drop", value: "8mm" },
      { label: "Weight", value: "280g (per shoe)" },
      { label: "Origin", value: "Tbilisi, Georgia" }
    ],
    colors: ["Core Black", "Cloud White", "Volt Yellow"],
    sizes: ["7", "8", "9", "10", "11", "12"]
  },
  { 
    id: 5, 
    cat: "footwear", 
    name: "Matrix Boots", 
    price: 210, 
    image: "https://images.unsplash.com/photo-1699779328119-ff71af60a19b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGZ1dHVyaXN0aWMlMjBib290c3xlbnwwfHwwfHx8MA%3D%3D", 
    rating: 4.5, 
    reviews: 98, 
    badge: "Limited",
    description: "Built for urban exploration. Matrix Boots combine rugged durability with sleek aesthetics for the modern adventurer.",
    features: [
      "Full-grain leather construction",
      "Waterproof membrane",
      "Vibram Arctic Grip outsole",
      "Speed lacing system",
      "Cushioned collar and tongue"
    ],
    specs: [
      { label: "Material", value: "Premium Full-Grain Leather" },
      { label: "Lining", value: "Waterproof Membrane" },
      { label: "Sole", value: "Vibram Arctic Grip" },
      { label: "Height", value: "6 inches" },
      { label: "Origin", value: "Tbilisi, Georgia" }
    ],
    colors: ["Black", "Brown", "Olive"],
    sizes: ["7", "8", "9", "10", "11", "12"]
  },
  { 
    id: 6, 
    cat: "footwear", 
    name: "Quantum Runners", 
    price: 195, 
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=800", 
    rating: 4.8, 
    reviews: 167,
    description: "Designed for performance, crafted for style. Quantum Runners deliver unmatched responsiveness with every stride.",
    features: [
      "Carbon fiber plate for propulsion",
      "ZoomX foam cushioning",
      "Flyknit upper for lockdown fit",
      "Data-driven traction pattern",
      "Heel clip for stability"
    ],
    specs: [
      { label: "Upper", value: "Flyknit + TPU" },
      { label: "Midsole", value: "ZoomX + Carbon Plate" },
      { label: "Drop", value: "4mm" },
      { label: "Weight", value: "210g (per shoe)" },
      { label: "Origin", value: "Tbilisi, Georgia" }
    ],
    colors: ["Runner Blue", "Volt", "White/Black"],
    sizes: ["7", "8", "9", "10", "11", "12"]
  },
  { 
    id: 7, 
    cat: "accessories", 
    name: "Solar Backpack", 
    price: 199, 
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
    rating: 4.6, 
    reviews: 134,
    description: "Never run out of power. The Solar Backpack features integrated solar panels to charge your devices on the go.",
    features: [
      "20W solar panel system",
      "USB-C and USB-A outputs",
      "Water-resistant YKK zippers",
      "Laptop compartment (fits 15\")",
      "Anti-theft hidden pockets"
    ],
    specs: [
      { label: "Material", value: "Recycled Polyester + Solar Panels" },
      { label: "Capacity", value: "25L" },
      { label: "Solar Output", value: "20W" },
      { label: "Weight", value: "1.2kg" },
      { label: "Origin", value: "Tbilisi, Georgia" }
    ],
    colors: ["Black", "Urban Grey", "Forest Green"],
    sizes: ["One Size"]
  },
  { 
    id: 8, 
    cat: "accessories", 
    name: "AR Visor", 
    price: 599, 
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800", 
    rating: 4.9, 
    reviews: 276, 
    badge: "Featured",
    description: "Experience augmented reality in style. The AR Visor seamlessly blends digital and physical worlds with cutting-edge optics.",
    features: [
      "Micro-OLED displays (2K per eye)",
      "6DoF tracking system",
      "Hand gesture recognition",
      "8-hour battery life",
      "Prescription lens compatible"
    ],
    specs: [
      { label: "Display", value: "Micro-OLED 2K per eye" },
      { label: "Field of View", value: "50°" },
      { label: "Refresh Rate", value: "90Hz" },
      { label: "Weight", value: "85g" },
      { label: "Origin", value: "Tbilisi, Georgia" }
    ],
    colors: ["Matte Black", "Silver"],
    sizes: ["One Size"]
  },
  { 
    id: 9, 
    cat: "accessories", 
    name: "Neon Beanie", 
    price: 45, 
    image: "https://images.unsplash.com/photo-1576138089479-65056fda0f1a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGJlYW5pZXxlbnwwfHwwfHx8MA%3D%3D", 
    rating: 4.4, 
    reviews: 67,
    description: "Keep warm with style. Hand-knitted by Georgian artisans with reflective threads for visibility.",
    features: [
      "Hand-knitted by local artisans",
      "Reflective thread integration",
      "Merino wool blend",
      "One size fits most",
      "Double-layer construction"
    ],
    specs: [
      { label: "Material", value: "70% Merino Wool, 30% Acrylic" },
      { label: "Weight", value: "80g" },
      { label: "Care", value: "Hand wash only" },
      { label: "Origin", value: "Tbilisi, Georgia" }
    ],
    colors: ["Neon Pink", "Cyber Yellow", "Electric Blue", "Black"],
    sizes: ["One Size"]
  },
  { 
    id: 10, 
    cat: "accessories", 
    name: "Tech Utility Belt", 
    price: 85, 
    image: "https://images.unsplash.com/photo-1711443982852-b3df5c563448?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmVsdHxlbnwwfHwwfHx8MA%3D%3D", 
    rating: 4.7, 
    reviews: 91,
    description: "Organize your essentials with military-grade materials and modular attachment system.",
    features: [
      "MOLLE webbing system",
      "Quick-release buckle",
      "Hidden RFID-blocking pocket",
      "Adjustable from 28\" to 48\"",
      "Lifetime warranty"
    ],
    specs: [
      { label: "Material", value: "1000D Cordura Nylon" },
      { label: "Width", value: "2 inches" },
      { label: "Weight", value: "180g" },
      { label: "Length", value: "Adjustable 28\"-48\"" },
      { label: "Origin", value: "Tbilisi, Georgia" }
    ],
    colors: ["Black", "Coyote Brown", "Ranger Green"],
    sizes: ["One Size (Adjustable)"]
  },
];

export const BRAND_PILLARS: BrandPillar[] = [
  { title: "Digitalizing Craft", desc: "Traditional Georgian soul, imported to the digital world.", icon: Globe },
  { title: "The Voloopipeline", desc: "Automated seller imports with AI-optimized logistics.", icon: Zap },
  { title: "Nano-Fabric Tech", desc: "Smart materials designed for the modern explorer.", icon: Cpu }
];

export const TRUST_BADGES: TrustBadge[] = [
  { icon: TruckIcon, title: "Free Shipping", desc: "On orders over $100" },
  { icon: RotateCcw, title: "30-Day Returns", desc: "Hassle-free returns" },
  { icon: ShieldCheck, title: "Secure Checkout", desc: "256-bit SSL encryption" },
  { icon: HeadphonesIcon, title: "24/7 Support", desc: "Always here to help" },
];

export const TESTIMONIALS: Testimonial[] = [
  { name: "Alex Chen", role: "Tech Enthusiast", text: "The quality is unmatched. Every piece feels like it's from the future.", rating: 5, avatar: "AC" },
  { name: "Maya Rodriguez", role: "Designer", text: "Finally, a brand that understands the intersection of culture and tech.", rating: 5, avatar: "MR" },
  { name: "Jordan Kim", role: "Creative Director", text: "These aren't just clothes—they're a statement. Absolutely love the vision.", rating: 5, avatar: "JK" },
];

export const STATS: Stat[] = [
  { value: "50+", label: "Countries Shipped" },
  { value: "10K+", label: "Happy Customers" },
  { value: "4.8", label: "Average Rating" },
  { value: "100%", label: "Authentic Craft" },
];
