
import { 
  Utensils, Coffee, Leaf,
  Wind, Award,
} from "lucide-react";

export const MENU_CATEGORIES = [
  { id: "starters", name: "Starters", icon: Leaf },
  { id: "mains", name: "Main Course", icon: Utensils },
  { id: "drinks", name: "Artisan Drinks", icon: Coffee },
];

export const DISHES = [
  { id: 1, cat: "starters", name: "Burrata & Heirloom", price: 18, image: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?q=80&w=800", desc: "Creamy burrata, sun-dried tomatoes, and wild pesto.", badge: "Farm Fresh" },
  { id: 2, cat: "starters", name: "Truffle Arancini", price: 16, image: "https://images.unsplash.com/photo-1541529086526-db283c563270?q=80&w=800", desc: "Wild mushroom risotto balls with truffle aioli.", badge: "Popular" },
  { id: 3, cat: "starters", name: "Carpaccio of Beef", price: 22, image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800", desc: "Thinly sliced aged beef with arugula and parmesan." },
  { id: 4, cat: "starters", name: "Smoked Salmon Tartare", price: 20, image: "https://images.unsplash.com/photo-1627308595216-439c00ade0fe?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c21va2VkJTIwc2FsbW9ufGVufDB8fDB8fHww", desc: "House-smoked salmon with avocado and caviar.", badge: "Chef's Pick" },
  { id: 5, cat: "starters", name: "Octopus Carpaccio", price: 24, image: "https://images.unsplash.com/photo-1768578987473-a194c94225ca?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8b2N0b3B1cyUyMGRpc2h8ZW58MHx8MHx8fDA%3D", desc: "Tender octopus with citrus vinaigrette and herbs." },
  { id: 6, cat: "starters", name: "Foie Gras Terrine", price: 28, image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=800", desc: "Classic terrine with fig compote and brioche." },
  
  { id: 7, cat: "mains", name: "Wild Forest Pasta", price: 26, image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=800", desc: "Handmade pappardelle with foraged mushrooms.", badge: "Handmade" },
  { id: 8, cat: "mains", name: "Pan-Seared Sea Bass", price: 34, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800", desc: "With lemon-butter reduction and spring asparagus." },
  { id: 9, cat: "mains", name: "Slow Roasted Lamb", price: 38, image: "https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=800", desc: "12-hour braised lamb with root mash.", badge: "Popular" },
  { id: 10, cat: "mains", name: "Dry-Aged Ribeye", price: 52, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800", desc: "45-day aged ribeye with roasted vegetables." },
  { id: 11, cat: "mains", name: "Duck Confit", price: 36, image: "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?q=80&w=800", desc: "Crispy duck leg with cherry gastrique and greens." },
  { id: 12, cat: "mains", name: "Lobster Risotto", price: 44, image: "https://images.unsplash.com/photo-1572406781543-c63cfe136bcf?q=80&w=1101&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", desc: "Creamy saffron risotto with fresh Atlantic lobster.", badge: "Signature" },
  { id: 13, cat: "mains", name: "Vegetable Wellington", price: 28, image: "https://images.unsplash.com/photo-1511910849309-0dffb8785146?q=80&w=800", desc: "Seasonal vegetables in puff pastry with red wine jus." },
  { id: 14, cat: "mains", name: "Grilled Salmon", price: 32, image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=800", desc: "Norwegian salmon with dill cream and asparagus." },
  
  { id: 15, cat: "drinks", name: "Botanical Gin Tonic", price: 14, image: "https://plus.unsplash.com/premium_photo-1669807973429-8ed3f63682eb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Qm90YW5pY2FsJTIwR2luJTIwVG9uaWN8ZW58MHx8MHx8fDA%3D", desc: "House-infused gin with rosemary and elderflower." },
  { id: 16, cat: "drinks", name: "Georgian Wine Selection", price: 18, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800", desc: "Curated natural wines from Kakheti region.", badge: "Local" },
  { id: 17, cat: "drinks", name: "Lavender Lemonade", price: 8, image: "https://plus.unsplash.com/premium_photo-1687871814573-b4c41bfdda3c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bGF2ZW5kZXIlMjBkcmlua3xlbnwwfHwwfHx8MA%3D%3D", desc: "Fresh-squeezed lemonade with lavender syrup." },
  { id: 18, cat: "drinks", name: "Espresso Martini", price: 16, image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800", desc: "Premium vodka, coffee liqueur, and fresh espresso." },
  { id: 19, cat: "drinks", name: "Herbal Tea Blend", price: 6, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800", desc: "Mountain herbs and flowers from local foragers." },
  { id: 20, cat: "drinks", name: "Old Fashioned", price: 15, image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=800", desc: "Bourbon, bitters, and orange with house-made syrup.", badge: "Classic" },
];

export const PHILOSOPHY = [
  { title: "Local Sourcing", desc: "We partner with Georgian farmers within a 50-mile radius, ensuring every ingredient is traceable to its origin.", icon: Leaf },
  { title: "Slow Food", desc: "Everything is prepared fresh, honoring traditional time-frames and artisanal techniques passed through generations.", icon: Wind },
  { title: "Chef's Vision", desc: "Merging modern culinary innovation with the rustic, timeless comfort of home-cooked meals.", icon: Award }
];

export const TESTIMONIALS = [
  { name: "Elena Tavadze", role: "Food Critic", quote: "AURA redefines Georgian fine dining with unmatched authenticity and elegance.", rating: 5 },
  { name: "Marcus Chen", role: "Travel Writer", quote: "A hidden gem that deserves a Michelin star. The forest pasta is transcendent.", rating: 5 },
  { name: "Natalia Beridze", role: "Regular Guest", quote: "My favorite place in Tbilisi. The atmosphere and food are simply magical.", rating: 5 },
];

export const OPENING_HOURS = [
  { day: "Monday", hours: "Closed", special: true },
  { day: "Tuesday", hours: "6:00 PM – 11:00 PM", special: false },
  { day: "Wednesday", hours: "6:00 PM – 11:00 PM", special: false },
  { day: "Thursday", hours: "6:00 PM – 11:00 PM", special: false },
  { day: "Friday", hours: "6:00 PM – 12:00 AM", special: false },
  { day: "Saturday", hours: "6:00 PM – 12:00 AM", special: false },
  { day: "Sunday", hours: "Closed", special: true },
];

export const SPECIAL_MENUS = [
  {
    title: "Sunday Supper Series",
    subtitle: "First Sunday of Every Month",
    time: "5:00 PM – 9:00 PM",
    description: "Join us for an exclusive family-style dining experience featuring a curated 5-course tasting menu that celebrates seasonal Georgian ingredients and traditional recipes passed down through generations.",
    price: "$85 per person",
    features: ["Wine Pairing Available", "Vegetarian Options", "Limited to 40 Guests"],
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800",
    badge: "Monthly Special"
  },
  {
    title: "Chef's Table Experience",
    subtitle: "Friday & Saturday Evenings",
    time: "7:00 PM – 10:30 PM",
    description: "An intimate 8-course journey through modern Georgian cuisine. Watch Chef Tornike and his team craft each dish in our open kitchen while enjoying wine pairings from our sommelier.",
    price: "$125 per person",
    features: ["8 Courses + Amuse-bouche", "Premium Wine Pairing", "Kitchen Counter Seating"],
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800",
    badge: "Signature Experience"
  }
];
