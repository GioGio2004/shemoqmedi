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
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        selectedColor: v.optional(v.string()), // For variants
      }),
    ),
  }).index("bySessionId", ["sessionId"]),
  orders: defineTable({
    customerDetails: v.object({
      email: v.string(),
      name: v.string(),
      address: v.string(),
      phone: v.string(),
    }),
    items: v.array(
      v.object({
        productId: v.id("products"),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        image: v.string(),
      }),
    ),
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
  }),

  // ─────────────────────────────────────────────────────────────────────────────
  // MULTI-TENANT CHAT TABLES
  // These two tables power the "frictionless" AI chat widget.
  // No user login is required — sessions are identified by a UUID stored in
  // the visitor's localStorage, scoped to a specific cafeId tenant.
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * sessions — one document per anonymous chat session.
   *
   * Created the first time a visitor sends a message.
   * `expiresAt` is set to 7 days from creation (not actively cleaned up in
   * Phase 1, but available for future cron jobs or background actions).
   */
  sessions: defineTable({
    sessionId: v.string(), // crypto.randomUUID() generated on the client
    cafeId: v.string(), // tenant identifier, e.g. "voloo-coffee"
    createdAt: v.number(), // epoch ms
    expiresAt: v.number(), // epoch ms  (createdAt + 7 * 24 * 60 * 60 * 1000)
  })
    .index("bySessionId", ["sessionId"])
    .index("byCafeId", ["cafeId"]),

  /**
   * messages — one document per chat turn (user or assistant).
   *
   * Both turns of every exchange are stored here so Convex is the single
   * source of truth for the entire conversation history.
   *
   * `products` is an optional array of integer product IDs returned by the
   * Gemini API; the frontend maps these to the localizedProducts prop to
   * render recommendation cards.
   */
  messages: defineTable({
    sessionId: v.string(),
    cafeId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    products: v.optional(v.array(v.number())), // product IDs from AI
    timestamp: v.number(),
  }).index("bySession", ["sessionId", "cafeId"]),
});
