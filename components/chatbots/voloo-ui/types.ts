/**
 * A single chat turn — shape shared between the Convex `messages` table
 * and local optimistic state used for instant UI feedback.
 */
export interface Message {
  _id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  products?: number[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  color?: string;
  allergens?: string[];
  ingredients?: string;
  nutrition?: {
    calories?: number;
    carbs?: string;
    sugar?: string;
    fat?: string;
    sodium?: string;
    caffeine?: string;
    isGlutenFree: boolean;
  };
}

/**
 * Visual design tokens controlled by the cafe owner.
 * Every colour in the widget is derived from these values.
 */
export interface CafeTheme {
  primaryColor: string;
  primaryColorLight: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  accentGlow: string;
}

/**
 * Per-tenant configuration.
 */
export interface CafeConfig {
  cafeId: string;
  brandName: string;
  theme: CafeTheme;
}

/**
 * A single item in the user's order basket.
 */
export interface BasketItem {
  product: Product;
  quantity: number;
}
