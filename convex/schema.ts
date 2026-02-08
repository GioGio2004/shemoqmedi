import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    externalId: v.string(),
    name: v.string(),
    email: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    userborded: v.optional(v.boolean()),
    profilePicture: v.optional(v.string()),
    lastname: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    preferredContactMethod: v.optional(v.string()),
    role: v.optional(v.string()), // user, admin, seller
    payementMethod: v.optional(v.string()),
  }).index("byExternalId", ["externalId"]),
  
  products: defineTable({
    name: v.string(),
    price: v.number(),
    category: v.string(),
    image: v.string(),
    rating: v.number(),
    reviews: v.number(),
    description: v.string(),
    features: v.array(v.string()),
    colors: v.optional(v.array(v.string())),
    sizes: v.optional(v.array(v.string())),
  }),
  carts: defineTable({
    sessionId: v.string(),
    items: v.array(v.object({
      productId: v.id("products"),
      quantity: v.number(),
      selectedColor: v.optional(v.string()), // For variants
    })),
  }).index("bySessionId", ["sessionId"]),
  orders: defineTable({
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
    status: v.string(), // pending, paid, shipped
    paymentId: v.optional(v.string()),
  }),

  userInteraction: defineTable({
    userId: v.id("users"),
    interactionType: v.string(),
    timestamp: v.number(),
    interests: v.array(v.string()),
    location: v.string(),
    deviceInfo: v.object({
      browser: v.string(),
      os: v.string(),
      deviceType: v.string(),
    }),
    accessInfo: v.object({
      city: v.string(),
      region: v.string(),
      country: v.string(),
      timezone: v.string(),
    }),
    firstVisit: v.boolean(),
    sessionId: v.string(),
    timespent: v.number(),
    
  })
});