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
});