import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      productContext,
      conversationHistory = [],
      currentBasket = [],
      userAllergies = [],
      focusedItems = [],
    } = body;

    // ── Per-cafe context from query params ──────────────────────────────────
    // MenuAIBridge passes ?cafeName=...&currency=... so the system prompt can
    // reference the actual cafe name and currency instead of hardcoded values.
    const { searchParams } = new URL(request.url);
    const cafeName = searchParams.get("cafeName") || "this cafe";
    const currency = searchParams.get("currency") || "GEL";

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GENERATIVE_AI_API_KEY
    );

    // ── Structured JSON output schema ────────────────────────────────────────
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

    // ── Format conversation history for the SDK ──────────────────────────────
    const history = conversationHistory.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // ── Build context strings ────────────────────────────────────────────────

    const basketContext =
      currentBasket.length > 0
        ? `\nCURRENT ORDER BASKET: The user currently has these items: ${JSON.stringify(currentBasket)}.`
        : "";

    // CRITICAL SAFETY FILTER — allergen awareness
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

    // ── System Prompt — fully dynamic, cafe-aware ────────────────────────────
    //
    // KEY UPGRADE vs the old static prompt:
    //  - cafeName comes from the DB via MenuAIBridge query param
    //  - currency is the org's real currency code (GEL, USD, etc.)
    //  - The AI knows exactly which cafe it represents
    //
    const systemInstruction = `
      You are the AI assistant for "${cafeName}".
      IDENTITY: You represent ${cafeName} exclusively. Never mention other cafes or brands.
      BRAND VOICE: Warm, knowledgeable, and enthusiastic about ${cafeName}'s menu.
      CURRENCY: All prices are in ${currency}. Always use the ${currency} symbol or abbreviation when mentioning prices.
      You have access to exact nutritional macros, allergens, and tasting notes for every item.
      Use this data to accurately answer questions about calories, caffeine, or diet,
      but always prioritize the user's conversational flow over data dumps.

      PRODUCT CATALOG for ${cafeName} (Includes IDs, prices in ${currency}/100, allergens):
      ${productContext}

      ${basketContext}
      ${allergyContext}
      ${focusContext}

      RESPONSE RULES:
      1. When users ask for recommendations or ask about products, find the most relevant,
         SAFE items from the PRODUCT CATALOG above.
      2. Provide a brief, helpful text response in the language the user is speaking.
         If they write in Georgian (ქართული), respond in Georgian. If English, respond in English.
      3. CRITICAL: You must include the EXACT integer "ID:" from the PRODUCT CATALOG for
         the items you are recommending in the "productIds" JSON array.
         NEVER hallucinate or invent IDs. If you recommend "Honey Lavender" which has "ID: 1234567",
         you MUST return 1234567 in the array.
      4. Keep your response under 60 words — mobile users read in short bursts.
      5. If the user asks something unrelated to the menu or ${cafeName}, politely steer
         the conversation back to what you can help with: the menu, ingredients, and recommendations.
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

    // ── Send and parse guaranteed JSON ───────────────────────────────────────
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
      { status: 500 }
    );
  }
}
