
export interface Shoe {
  id: number;
  name: string;
  price: number;
  image: string;
  brand: string;
  category: "lifestyle" | "running" | "basketball";
  colors: number;
  badge?: string;
}

export const SHOES: Shoe[] = [
  {
    id: 1,
    name: "Air Max Pulse",
    price: 159,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070",
    brand: "NIKE",
    category: "lifestyle",
    colors: 3,
    badge: "JUST DROPPED"
  },
  {
    id: 2,
    name: "Forum Low 84",
    price: 110,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012",
    brand: "ADIDAS",
    category: "lifestyle",
    colors: 5,
    badge: "BESTSELLER"
  },
  {
    id: 3,
    name: "RS-X Efekt",
    price: 120,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1974",
    brand: "PUMA",
    category: "lifestyle",
    colors: 2
  },
  {
    id: 4,
    name: "Gel-Kayano 14",
    price: 180,
    image: "https://images.unsplash.com/photo-1606890658317-7d14490b76fd?q=80&w=800",
    brand: "ASICS",
    category: "running",
    colors: 4,
    badge: "TRENDING"
  },
  {
    id: 5,
    name: "Jumpman Two Trey",
    price: 155,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1974",
    brand: "JORDAN",
    category: "basketball",
    colors: 6
  },
  {
    id: 6,
    name: "550 Retro",
    price: 120,
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=2071",
    brand: "NEW BALANCE",
    category: "lifestyle",
    colors: 8,
    badge: "LIMITED"
  },
  {
    id: 7,
    name: "Zig Kinetica 2.5",
    price: 130,
    image: "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?q=80&w=1935",
    brand: "REEBOK",
    category: "running",
    colors: 2
  },
  {
    id: 8,
    name: "Old Skool Stackform",
    price: 85,
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1996",
    brand: "VANS",
    category: "lifestyle",
    colors: 12
  }
];

export const CATEGORIES = [
  { id: "all", label: "All Kicks" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "running", label: "Running" },
  { id: "basketball", label: "Hoops" },
];
