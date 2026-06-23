import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex-helpers-api";

// ── Zod Schema ───────────────────────────────────────────────────────────
const chatPayloadSchema = z
  .object({
    message: z.string().min(1).max(1000),
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
    // Explicitly allowing other fields like scrollPosition to be stripped
    scrollPosition: z.number().optional(),
    language: z.string().optional(),
    productContext: z.any().optional(), // stripped internally
  })
  .strip();

// ── Upstash Redis Rate Limiting ──────────────────────────────────────────
// Gracefully fallback if credentials are missing
const isRedisConfigured =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

const ratelimit = isRedisConfigured
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
      analytics: true,
    })
  : null;

function hashId(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export async function POST(request: NextRequest) {
  try {
    // ── 1. Rate Limiting ──────────────────────────────────────────────────
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

    // ── 2. Payload Validation ──────────────────────────────────────────────
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
      conversationHistory,
      currentBasket,
      userAllergies,
      focusedItems,
    } = parsedBody.data;

    // ── 3. Server-Side Context ─────────────────────────────────────────────
    const { searchParams } = new URL(request.url);
    const cafeName = searchParams.get("cafeName") || "this cafe";
    const currency = searchParams.get("currency") || "GEL";
    const cafeId = searchParams.get("cafeId");

    if (!cafeId) {
      return NextResponse.json(
        { error: "Missing cafeId query parameter" },
        { status: 400 },
      );
    }

    // Securely fetch menu from Convex
    let productContext = "";
    try {
      const menuData = await fetchQuery(api.publicMenu.get, { slug: cafeId });

      // Build the product string strictly from trusted server data
      productContext = menuData.categories
        .map((category: any) => {
          const categoryName = category.name["en"] || Object.values(category.name)[0] || "Unknown Category";
          const itemsStr = category.items.map((p: any) => {
            const ingredientsStr = p.description
              ? `Description: ${typeof p.description === "string" ? p.description : p.description["en"] || Object.values(p.description)[0] || ""}.`
              : "";
            const allergenStr =
              p.tags && p.tags.length > 0
                ? `Allergens: ${p.tags.join(", ")}.`
                : "";
            const name = p.name["en"] || Object.values(p.name)[0] || "Unknown";
            return `  - ID: ${hashId(String(p._id))} | ${name} - ${currency}${(p.price / 100).toFixed(2)}: ${ingredientsStr} ${allergenStr}`;
          }).join("\n");
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

    // ── 4. Gemini API ──────────────────────────────────────────────────────
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 },
      );
    }

    const genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            response: {
              type: SchemaType.STRING,
              description:
                "Your conversational reply to the user. Keep it under 60 words.",
            },
            productIds: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.INTEGER },
              description:
                "Array of integer IDs for products you are recommending based on the context.",
            },
          },
          required: ["response", "productIds"],
        },
      },
    });

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

    // const systemInstruction = `
    //   You are the AI assistant for "${cafeName}".
    //   IDENTITY: You represent ${cafeName} exclusively. Never mention other cafes or brands.
    //   BRAND VOICE: Warm, knowledgeable, and enthusiastic about ${cafeName}'s menu.
    //   CURRENCY: All prices are in ${currency}. Always use the ${currency} symbol or abbreviation when mentioning prices.
    //   You have access to exact nutritional macros, allergens, and tasting notes for every item.
    //   Use this data to accurately answer questions about calories, caffeine, or diet,
    //   but always prioritize the user's conversational flow over data dumps.

    //   PRODUCT CATALOG for ${cafeName} (Includes IDs, prices, allergens):
    //   ${productContext}

    //   ${basketContext}
    //   ${allergyContext}
    //   ${focusContext}

    //   RESPONSE RULES:
    //   1. When users ask for recommendations or ask about products, find the most relevant,
    //      SAFE items from the PRODUCT CATALOG above.
    //   2. Provide a brief, helpful text response in the language the user is speaking.
    //      If they write in Georgian (ქართული), respond in Georgian. If English, respond in English.
    //   3. CRITICAL: You must include the EXACT integer "ID:" from the PRODUCT CATALOG for
    //      the items you are recommending in the "productIds" JSON array.
    //      NEVER hallucinate or invent IDs. If you recommend "Honey Lavender" which has "ID: 1234567",
    //      you MUST return 1234567 in the array.
    //   4. Keep your response under 60 words — mobile users read in short bursts.
    //   5. If the user asks something unrelated to the menu or ${cafeName}, politely steer
    //      the conversation back to what you can help with: the menu, ingredients, and recommendations.
    // `;

    // const systemInstruction = `
    //   You are the AI assistant for "${cafeName}".
    //   IDENTITY: You represent ${cafeName} exclusively. Never mention other cafes or brands.
    //   BRAND VOICE: Warm, knowledgeable, and enthusiastic about ${cafeName}'s menu.
    //   CURRENCY: All prices are in ${currency}. Always use the ${currency} symbol or abbreviation when mentioning prices.
    //   You have access to exact nutritional macros, allergens, and tasting notes for every item.
    //   Use this data to accurately answer questions about calories, caffeine, or diet,
    //   but always prioritize the user's conversational flow over data dumps.

    //   PRODUCT CATALOG for ${cafeName} (Includes IDs, prices, allergens):
    //   ${productContext}

    //   ${basketContext}
    //   ${allergyContext}
    //   ${focusContext}

    //   RESPONSE RULES:
    //   1. When users ask for recommendations or ask about products, find the most relevant,
    //      SAFE items from the PRODUCT CATALOG above.
    //   2. Provide a brief, helpful text response in the language the user is speaking.
    //      If they write in Georgian (ქართული), respond in Georgian. If English, respond in English.
    //   3. CRITICAL: You must include the EXACT integer "ID:" from the PRODUCT CATALOG for
    //      the items you are recommending in the "productIds" JSON array.
    //      NEVER hallucinate or invent IDs. If you recommend "Honey Lavender" which has "ID: 1234567",
    //      you MUST return 1234567 in the array.
    //   4. Keep your response under 60 words — mobile users read in short bursts.
    //   5. If the user asks something unrelated to the menu or ${cafeName}, politely steer
    //      the conversation back to what you can help with: the menu, ingredients, and recommendations.
    //   6. UPSELLING & ALLERGIES: When suggesting an item, naturally recommend one complementary pairing (e.g., "This pairs perfectly with our [Item]"). CRITICAL: The paired upsell MUST strictly respect all active ALLERGIES and dietary restrictions. Include the integer IDs for BOTH the primary item and the upsell item in your "productIds" array.
    // `;

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
    const chat = model.startChat({
      history: [
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
      ],
    });

    const result = await chat.sendMessage(message);
    const jsonText = result.response.text();
    const parsedData = JSON.parse(jsonText);

    return NextResponse.json({
      response: parsedData.response,
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
