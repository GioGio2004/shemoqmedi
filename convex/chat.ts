/**
 * convex/chat.ts
 *
 * Multi-tenant AI chat — Convex queries & mutations.
 *
 * Data flow:
 *   1. On component mount the browser generates (or reads) a UUID from
 *      localStorage ("voloo_session_id") and passes it here as `sessionId`.
 *   2. `getMessages` streams the full conversation history to the client
 *      reactively — any new messages written by `sendMessage` are pushed
 *      to all connected subscribers automatically.
 *   3. `sendMessage` is called twice per exchange:
 *        a. Once for the user's message (role: "user")
 *        b. Once for the AI's reply  (role: "assistant")
 *      On the very first call it also upserts a row in `sessions` so we
 *      track when a chat session was created and when it expires.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Session TTL: 7 days in milliseconds */
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// ─── getMessages ──────────────────────────────────────────────────────────────

/**
 * Returns the full chat history for a given session + cafe combination,
 * ordered by `timestamp` ascending (oldest message first).
 *
 * This is a Convex *query*, meaning the client receives live updates any
 * time a new message is inserted — no polling needed.
 *
 * Usage in React:
 *   const messages = useQuery(api.chat.getMessages, { sessionId, cafeId });
 */
export const getMessages = query({
  args: {
    sessionId: v.string(), // UUID from localStorage
    cafeId:    v.string(), // tenant identifier, e.g. "voloo-coffee"
  },
  handler: async (ctx, { sessionId, cafeId }) => {
    return await ctx.db
      .query("messages")
      // Use the compound index for an efficient, index-only scan
      .withIndex("bySession", (q) =>
        q.eq("sessionId", sessionId).eq("cafeId", cafeId)
      )
      .order("asc") // oldest → newest, matching the chat UI scroll direction
      .collect();
  },
});

// ─── sendMessage ──────────────────────────────────────────────────────────────

/**
 * Inserts a single chat turn (user or assistant) into the `messages` table.
 *
 * On the first call for a brand-new session it also upserts the `sessions`
 * table so we have a record of when the session was created and when it
 * should expire (7 days from creation).
 *
 * Called from the Coffee3 component:
 *   - Once with role="user"  (the visitor's prompt)
 *   - Once with role="assistant" (Gemini's reply + productIds)
 *
 * Usage in React:
 *   const saveMsgMutation = useMutation(api.chat.sendMessage);
 *   await saveMsgMutation({ sessionId, cafeId, role, content, products });
 */
export const sendMessage = mutation({
  args: {
    sessionId: v.string(),
    cafeId:    v.string(),
    role:      v.union(v.literal("user"), v.literal("assistant")),
    content:   v.string(),
    /**
     * Optional array of integer product IDs.
     * Only relevant for assistant messages — populated from the Gemini
     * API's `productIds` field and used by the frontend to render
     * ProductCard recommendation rows.
     */
    products:  v.optional(v.array(v.number())),
  },
  handler: async (ctx, { sessionId, cafeId, role, content, products }) => {
    const now = Date.now();

    // ── 1. Upsert session record (only if this is the first message) ──────────
    //
    // We look up by `sessionId` using the index; if no record exists we
    // create one. We intentionally skip patching existing sessions so that
    // `createdAt` / `expiresAt` are immutable after first write.
    const existingSession = await ctx.db
      .query("sessions")
      .withIndex("bySessionId", (q) => q.eq("sessionId", sessionId))
      .first();

    if (!existingSession) {
      await ctx.db.insert("sessions", {
        sessionId,
        cafeId,
        createdAt: now,
        expiresAt: now + SESSION_TTL_MS,
      });
    }

    // ── 2. Insert the message ─────────────────────────────────────────────────
    await ctx.db.insert("messages", {
      sessionId,
      cafeId,
      role,
      content,
      // Only include the `products` field for assistant messages that have IDs;
      // we omit it entirely (undefined) for user messages to keep rows lean.
      ...(products && products.length > 0 ? { products } : {}),
      timestamp: now,
    });
  },
});
