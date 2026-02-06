import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── CART OPERATIONS ───

export const getCart = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const cart = await ctx.db
      .query("carts")
      .withIndex("bySessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!cart) return [];

    // Fetch details for each item
    const itemsWithDetails = await Promise.all(
      cart.items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product) return null;
        return {
          ...product,
          id: product._id, // Ensure frontend compatibility
          quantity: item.quantity,
          selectedColor: item.selectedColor,
        };
      })
    );

    return itemsWithDetails.filter((item) => item !== null);
  },
});

export const syncCart = mutation({
  args: {
    sessionId: v.string(),
    items: v.array(v.object({
      productId: v.id("products"),
      quantity: v.number(),
      selectedColor: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("carts")
      .withIndex("bySessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { items: args.items });
    } else {
      await ctx.db.insert("carts", {
        sessionId: args.sessionId,
        items: args.items,
      });
    }
  },
});

export const clearCart = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("carts")
      .withIndex("bySessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

// ─── ORDER OPERATIONS ───

export const submitOrder = mutation({
  args: {
    customerDetails: v.object({
      email: v.string(),
      name: v.string(),
      address: v.string(),
      phone: v.string(),
    }),
    items: v.array(v.object({
      productId: v.id("products"),
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
      image: v.string(),
    })),
    total: v.number(),
    paymentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("orders", {
      ...args,
      status: "paid", // Simulating successful payment
    });
  },
});

export const getOrders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("orders").order("desc").take(20);
  },
});

// ─── PRODUCT MANAGEMENT (ADMIN) ───

export const createProduct = mutation({
  args: {
    name: v.string(),
    price: v.number(),
    category: v.string(),
    image: v.string(), // Cloudinary URL
    description: v.string(),
    rating: v.number(),
    reviews: v.number(),
    features: v.array(v.string()),
    colors: v.optional(v.array(v.string())),
    sizes: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("products", args);
  },
});

export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
