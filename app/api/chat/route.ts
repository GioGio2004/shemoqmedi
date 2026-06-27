// app/api/chat/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Shemoqmedi Guest AI Chat — POST /api/chat
//
// Gemini 2.5 Flash endpoint powering the per-cafe AI concierge.
// Handles menu recommendations, allergy filtering, basket awareness,
// and language detection for multilingual guests.
//
// ── Nootype Framework ────────────────────────────────────────────────────────
// The system detects the guest's cognitive archetype (Nootype) from context
// clues and adapts its tone accordingly. This is stored as a telemetry signal
// for SFT training data quality filtering.
//
//   "form"       — Aesthetics, presentation, prestige, visual elegance.
//   "overcoming" — Challenge, intensity, bold flavors, pushing limits.
//   "relaxation" — Frictionless ease, zero cognitive load, comfort.
//   "management" — Control, data, exact macros, precise customisation.
//
// ── SFT Data Flywheel ────────────────────────────────────────────────────────
// After every Gemini response, a non-blocking harvest call ships the
// completed exchange to /api/ai/harvest which writes it to ai_training_logs.
// The main response is NEVER delayed — harvest is strictly fire-and-forget.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex-helpers-api";

// ── Zod Schema ────────────────────────────────────────────────────────────────
const chatPayloadSchema = z
  .object({
    message: z.string().min(1).max(1000),
    sessionId: z.string().optional(), // anonymous UUID from localStorage
    conversationHistory: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
          timestamp: z.number().optional(),
        }),
      )
      .optional()
      .default([]),
    currentBasket: z
      .array(
        z.object({
          name: z.string(),
          quantity: z.number(),
          price: z.number(),
        }),
      )
      .optional()
      .default([]),
    userAllergies: z.array(z.string()).optional().default([]),
    focusedItems: z.array(z.string()).optional().default([]),
    // Optional Nootype hint from the client (set by the Nootype classifier route)
    nootype: z.enum(["form", "overcoming", "relaxation", "management"]).optional(),
    // Explicitly stripped fields
    language: z.string().optional(),
  })
  .strip();

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const isRedisConfigured =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

const ratelimit = isRedisConfigured
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: true,
    })
  : null;

// ── Helpers ───────────────────────────────────────────────────────────────────
function hashId(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// ─────────────────────────────────────────────────────────────────────────────
// buildNootypeLayer
//
// Dynamically constructs the TONE INSTRUCTION block injected into the Gemini
// system prompt based on the active nootype (mood) parameter from the request.
//
// Priority:
//   1. nootype from request body  — client-selected mood (popup or switcher)
//   2. Absent / null              — baseline tone (no instruction appended)
//
// The exact phrasing of each block is intentional and tuned for Gemini SFT.
// Do not paraphrase without re-evaluating training data alignment.
// ─────────────────────────────────────────────────────────────────────────────
function buildNootypeLayer(nootype: string | undefined): string {
  switch (nootype) {
    case "form":
      return `
TONE INSTRUCTION: The user represents the "mania of form" nootype. Focus on the primacy of the "whole", localization, and the established present. Adopt an analytical tone driven by causal motivation. Emphasize traditional structure, consent, and duty. Keep it under 70 words.`;

    case "overcoming":
      return `
TONE INSTRUCTION: The user represents the "mania of overcoming" nootype. Focus on intensive divisibility, compression, and the contractible present. Adopt a highly reactive, sensible tone driven by causal-target motivation. Emphasize duty and equality. Keep it under 70 words.`;

    case "relaxation":
      return `
TONE INSTRUCTION: The user represents the "mania of relaxation" nootype. Focus on the primacy of "parts", flow, and the transient instantaneous present. Adopt a synthesized, impression-based tone driven by target motivation. Emphasize equality and freedom. Keep it under 60 words.`;

    case "management":
      return `
TONE INSTRUCTION: The user represents the "mania of management (ruling)" nootype. Focus on indivisible integrity, expansion, and the expanding intransitive present. Adopt an intuitive, situational tone driven by situational motivation. Emphasize freedom and consent. Keep it under 70 words.`;

    default:
      return ""; // No Nootype detected yet — use baseline tone
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// fireAndForgetHarvest
//
// Ships the completed AI exchange to the harvest endpoint as a non-blocking
// Promise. Errors are caught and logged — they NEVER propagate to the
// guest response or throw an unhandled rejection.
//
// Role translation: conversationHistory uses "assistant" (client convention)
// but Gemini SFT requires "model". We translate here.
// ─────────────────────────────────────────────────────────────────────────────
function fireAndForgetHarvest(payload: {
  cafeId: string;
  sessionId: string;
  systemInstruction: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  currentMessage: string;
  // Clean prose text (parsedData.response) — NOT the raw JSON blob
  modelResponseText: string;
  rawModelJson: string;
  nootype?: string;
}): void {
  const {
    cafeId, sessionId, systemInstruction,
    conversationHistory, currentMessage, modelResponseText, rawModelJson, nootype,
  } = payload;

  // Build the SFT-ready contents array:
  // 1. Translate prior history: "assistant" → "model"
  // 2. Append the current user message
  // 3. Append ONLY the clean prose text the guest sees — not the raw JSON
  const historyTurns = conversationHistory.map((msg) => ({
    role: (msg.role === "assistant" ? "model" : "user") as "user" | "model",
    parts: [{ text: msg.content }] as [{ text: string }],
  }));

  const contents: Array<{ role: "user" | "model"; parts: [{ text: string }] }> = [
    ...historyTurns,
    { role: "user",  parts: [{ text: currentMessage }] },
    { role: "model", parts: [{ text: modelResponseText }] }, // ← clean prose only
  ];

  // The contents array MUST start with "user" and alternate strictly.
  // Validate before sending — if malformed, skip quietly to protect uptime.
  for (let i = 0; i < contents.length; i++) {
    if (contents[i].role !== (i % 2 === 0 ? "user" : "model")) {
      console.error(
        `[Harvest] Skipping malformed turn array for session "${sessionId}" ` +
        `— turn[${i}].role="${contents[i].role}" violates alternation rule.`,
      );
      return; // Abort harvest silently
    }
  }

  const harvestUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/ai/harvest`;

  // Non-blocking: we do NOT await this Promise
  Promise.resolve().then(async () => {
    try {
      const res = await fetch(harvestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-harvest-secret": process.env.INTERNAL_HARVEST_SECRET ?? "",
        },
        body: JSON.stringify({
          cafeId,
          sessionId,
          systemInstruction,
          contents,
          rawModelJson,
          positiveSignal: false, // Default false; upgraded by PATCH when checkout fires
          nootype,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`[Harvest] Non-200 from harvest endpoint: ${res.status} — ${text}`);
      }
    } catch (err) {
      // Silently swallow — harvest must NEVER impact guest latency
      console.error("[Harvest] Fire-and-forget fetch failed:", err);
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST handler
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // ── 1. Rate Limiting ─────────────────────────────────────────────────────
    if (ratelimit) {
      const forwardedFor = request.headers.get("x-forwarded-for");
      const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
      const { success } = await ratelimit.limit(`ratelimit_chat_${ip}`);
      if (!success) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 },
        );
      }
    } else {
      console.warn("Upstash Redis is not configured. Bypassing rate limiting.");
    }

    // ── 2. Payload Validation ─────────────────────────────────────────────────
    const rawBody = await request.json();
    const parsedBody = chatPayloadSchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsedBody.error.format() },
        { status: 400 },
      );
    }

    const {
      message,
      sessionId,
      conversationHistory,
      currentBasket,
      userAllergies,
      focusedItems,
      nootype,
    } = parsedBody.data;

    // ── 3. Server-Side Context ────────────────────────────────────────────────
    const { searchParams } = new URL(request.url);
    const cafeName = searchParams.get("cafeName") || "this cafe";
    const currency  = searchParams.get("currency") || "GEL";
    const cafeId    = searchParams.get("cafeId");

    if (!cafeId) {
      return NextResponse.json(
        { error: "Missing cafeId query parameter" },
        { status: 400 },
      );
    }

    // Derive a session key for harvest grouping
    // If the client provides a sessionId, use it; otherwise fall back to a
    // consistent IP+cafeId hash so we can still group turns.
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    const effectiveSessionId =
      sessionId ?? `anon_${cafeId}_${Buffer.from(ip).toString("base64").slice(0, 12)}`;

    // ── 4. Menu Fetch (server-side, trusted) ──────────────────────────────────
    let productContext = "";
    try {
      const menuData = await fetchQuery(api.publicMenu.get, { slug: cafeId });

      productContext = menuData.categories
        .map((category: any) => {
          const categoryName =
            category.name["en"] ||
            Object.values(category.name)[0] ||
            "Unknown Category";
          const itemsStr = category.items
            .map((p: any) => {
              const ingredientsStr = p.description
                ? `Description: ${typeof p.description === "string" ? p.description : p.description["en"] || Object.values(p.description)[0] || ""}.`
                : "";
              const allergenStr =
                p.tags && p.tags.length > 0
                  ? `Allergens: ${p.tags.join(", ")}.`
                  : "";
              const name =
                p.name["en"] || Object.values(p.name)[0] || "Unknown";
              return `  - ID: ${hashId(String(p._id))} | ${name} - ${currency}${(p.price / 100).toFixed(2)}: ${ingredientsStr} ${allergenStr}`;
            })
            .join("\n");
          return `[CATEGORY: ${categoryName}]\n${itemsStr}`;
        })
        .join("\n\n");
    } catch (error) {
      console.error("Failed to fetch menu context:", error);
      return NextResponse.json(
        { error: "Failed to fetch cafe context" },
        { status: 500 },
      );
    }

    // ── 5. API Key Check ──────────────────────────────────────────────────────
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 },
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    // ── 6. Context Assembly ───────────────────────────────────────────────────
    const history = conversationHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const basketContext =
      currentBasket.length > 0
        ? `\nCURRENT ORDER BASKET: The user currently has these items: ${JSON.stringify(currentBasket)}.`
        : "";

    const allergyContext =
      userAllergies.length > 0
        ? `\nCRITICAL DIETARY RESTRICTIONS: The user has marked that they are allergic to or avoiding: ${userAllergies.join(", ")}.
    RULE 1: When making general recommendations, try to suggest safe items that do NOT contain these allergens.
    RULE 2: If the user explicitly asks about an item that contains their allergen, DO NOT REFUSE TO DESCRIBE IT. Assume they might be ordering for a friend at the table. Describe the item beautifully, but append a polite, clear WARNING that it contains their allergen.`
        : "";

    const focusContext =
      focusedItems.length > 0
        ? `\nCURRENTLY FOCUSED ITEMS: The user has explicitly pinned these items to their screen: ${focusedItems.join(", ")}. If the user uses pronouns like "this", "it", or asks a vague question about a product, THEY ARE REFERRING TO THESE SPECIFIC ITEMS. Prioritize discussing these.`
        : "";

    // Nootype adaptive layer — injected as an addendum to the base instruction
    const nootypeLayer = buildNootypeLayer(nootype);

    const systemInstruction = `
      You are the AI assistant for "${cafeName}".
      IDENTITY: You represent ${cafeName} exclusively. Never mention other cafes or brands.
      BRAND VOICE: Warm, knowledgeable, helpful, and never pushy. You provide a premium hospitality experience.
      CURRENCY: All prices are in ${currency}. Always use the ${currency} symbol or abbreviation when mentioning prices.
      
      You have access to exact nutritional macros, allergens, and tasting notes for every item.
      Use this data to accurately answer questions, but always prioritize a natural conversational flow.

      PRODUCT CATALOG for ${cafeName} (Includes IDs, prices, allergens):
      ${productContext}

      ${basketContext}
      ${allergyContext}
      ${focusContext}
      ${nootypeLayer}

      RESPONSE RULES:
      1. RANDOMIZED VARIETY: Do not suggest the exact same items every time. If a user asks for "meat", randomly pick 2 to 3 different, highly relevant items from that category each time. Show variety!
      2. CATEGORIES OVERVIEW: If the user asks "what do you have?" or "what are your categories?", you MUST list the available categories from the PRODUCT CATALOG (e.g., "We have Steaks, Georgian Food, Salads, etc.").
      3. BALANCED RECOMMENDATIONS: When asked to advise/recommend something generally, select 2 to 3 distinct items across different categories to give a broad choice.
      4. SUBTLE UPSELLING: Offer ONE complementary item (e.g., a side or a drink) but frame it softly. Use phrases like "These pair beautifully with..." Do not sound overly aggressive or "salesy."
      5. CRITICAL IDS: You must include the EXACT integer "ID:" from the PRODUCT CATALOG for ALL items you explicitly mention/recommend (both your primary recommendations AND your upsell) in the "productIds" JSON array. NEVER hallucinate IDs.
      6. LANGUAGE & TONE: Provide a brief, helpful text response in the language the user is speaking. Keep the text under 70 words. Mobile users read in short bursts.
      7. ALLERGIES: Every single recommendation MUST strictly respect all active ALLERGIES and dietary restrictions.
      8. OFF-TOPIC: If the user asks something unrelated to the menu, politely steer them back.
    `;

    // ── 7. Gemini Call ────────────────────────────────────────────────────────
    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemInstruction }] },
        {
          role: "model",
          parts: [
            {
              text: `Understood. I am the AI assistant for ${cafeName}, ready to help guests discover our menu.`,
            },
          ],
        },
        ...history,
        { role: "user", parts: [{ text: message }] },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            response: {
              type: Type.STRING,
              description:
                "Your raw conversational text reply to the user. Do NOT include JSON structures here. Keep it under 70 words.",
            },
            productIds: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER },
              description:
                "Array of integer IDs for products you are recommending based on the context.",
            },
            detected_nootype: {
              type: Type.STRING,
              enum: ["form", "overcoming", "relaxation", "management"],
              description:
                "Analyze the user prompt speed, tone, and complexity to determine their matching Nootype archetype. 'relaxation' for brief/low-effort prompts, 'form' for aesthetic inquiries, 'overcoming' for bold/adventurous requests, 'management' for detail-oriented/data-heavy questions.",
            },
          },
          required: ["response", "productIds", "detected_nootype"],
        },
      },
    });

    const jsonText = result.text || "{}";
    const parsedData = JSON.parse(jsonText);

    // ── 8. Fire-and-Forget Harvest ────────────────────────────────────────────
    // This is non-blocking. The NextResponse is returned immediately after.
    // The harvest Promise resolves in the background without blocking the guest.
    // nootype source priority:
    //   1. nootype from request body   — explicit client hint / mood override (highest priority)
    //   2. parsedData.detected_nootype — authoritative in-band classification (fallback)
    const effectiveNootype = nootype ?? parsedData.detected_nootype;

    fireAndForgetHarvest({
      cafeId,
      sessionId: effectiveSessionId,
      systemInstruction,
      conversationHistory: conversationHistory as Array<{ role: "user" | "assistant"; content: string }>,
      currentMessage: message,
      modelResponseText: parsedData.response, // clean prose for SFT contents
      rawModelJson: jsonText,                  // full JSON blob for debugging
      nootype: effectiveNootype,
    });

    // ── 9. Return Response ────────────────────────────────────────────────────
    return NextResponse.json({
      response:   parsedData.response,
      productIds: parsedData.productIds,
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
