import { mutation } from "./_generated/server";

// ─── DATA TO SEED ───
const MARBLE_COLLECTION = [
  {
    name: "Calacatta Gold Vase",
    price: 1250,
    category: "Decor",
    image: "https://images.unsplash.com/photo-1578749556935-ef8881d515d7?q=80&w=1000",
    rating: 5,
    reviews: 42,
    description: "Hand-carved from rare Calacatta Gold marble, this vase features dramatic grey and gold veining. A statement piece for any modern interior.",
    features: ["Solid Marble", "Hand-polished", "Italy Origin", "12kg Weight"],
    colors: ["Classic", "Matte"],
    sizes: ["Regular", "Large"]
  },
  {
    name: "Nebula Silk Lamp",
    price: 890,
    category: "Lighting",
    image: "https://images.unsplash.com/photo-1513506003013-d531625a020c?q=80&w=1000",
    rating: 4.8,
    reviews: 128,
    description: "Ethereally crafted silk stretched over a bamboo frame. The Nebula Lamp creates a soft, diffused light perfect for ambient calmness.",
    features: ["Organic Silk", "Dimmable LED", "Handmade", "5yr Warranty"],
    colors: ["Warm White", "Cool White"],
    sizes: ["Standard"]
  },
  {
    name: "Royal Velvet Armchair",
    price: 2100,
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=1000",
    rating: 4.9,
    reviews: 85,
    description: "Plush, deep-pile velvet upholstery meets a solid brass frame. Ergonomically designed for maximum comfort without sacrificing style.",
    features: ["Italian Velvet", "Brass Legs", "High Density Foam", "Stain Resistant"],
    colors: ["Deep Blue", "Emerald", "Onyx"],
    sizes: ["Standard"]
  },
  {
    name: "Chromium Abstract No. 5",
    price: 3500,
    category: "Art",
    image: "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1000",
    rating: 5,
    reviews: 12,
    description: "Original limited edition canvas. A study in chaos and order, featuring metallic chromium paints that react to room lighting.",
    features: ["Original Canvas", "Signed", "Framed", "Certificate of Authenticity"],
    colors: ["N/A"],
    sizes: ["100x120cm"]
  },
  {
    name: "Chronos Elite",
    price: 499,
    category: "Tech",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000",
    rating: 4.7,
    reviews: 310,
    description: "Titanium body with sapphire crystal glass. The Chronos Elite bridges the gap between luxury horology and smart technology.",
    features: ["Titanium Body", "ECG Monitor", "14-Day Battery", "Waterproof 50m"],
    colors: ["Titanium", "Black DLC", "Rose Gold"],
    sizes: ["42mm", "46mm"]
  },
    {
    name: "Heritage Leather Satchel",
    price: 320,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000",
    rating: 4.6,
    reviews: 205,
    description: "Full-grain vegetable tanned leather that ages beautifully. Features a dedicated laptop compartment and antique brass hardware.",
    features: ["Vegetable Tanned", "Laptop Sleeve", "Lifetime Warranty", "Hand-Stitched"],
    colors: ["Tan", "Chocolate", "Black"],
    sizes: ["One Size"]
  }
];

export const seedProducts = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("products").collect();
    if (existing.length > 0) return; // Already seeded

    for (const product of MARBLE_COLLECTION) {
      await ctx.db.insert("products", product);
    }
  },
});
