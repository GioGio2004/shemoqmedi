import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, productContext, conversationHistory = [], currentBasket = [], userAllergies = [], focusedItems = [] } = body;

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 },
      );
    }

    const genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    );

    // 1. Force the model to output strict JSON matching your TypeScript interface
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

    // 2. Format the conversation history for the SDK
    const history = conversationHistory.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // 3. The Shemoqmedi-First System Prompt
    const basketContext = currentBasket.length > 0
        ? `\nCURRENT ORDER BASKET: The user currently has these items: ${JSON.stringify(currentBasket)}.`
        : "";

    // CRITICAL SAFETY FILTER
    const allergyContext = userAllergies.length > 0
        ? `\nCRITICAL DIETARY RESTRICTIONS: The user has marked that they are allergic to or avoiding: ${userAllergies.join(", ")}. \n    RULE 1: When making general recommendations, try to suggest safe items that do NOT contain these allergens.\n    RULE 2: If the user explicitly asks about an item that contains their allergen, DO NOT REFUSE TO DESCRIBE IT. Assume they might be ordering for a friend at the table. Describe the item beautifully, but append a polite, clear WARNING that it contains their allergen.`
        : "";

    const focusContext = focusedItems.length > 0
        ? `\nCURRENTLY FOCUSED ITEMS: The user has explicitly pinned these items to their screen: ${focusedItems.join(", ")}. If the user uses pronouns like "this", "it", or asks a vague question about a product, THEY ARE REFERRING TO THESE SPECIFIC ITEMS. Prioritize discussing these.`
        : "";

    const systemInstruction = `
      You are the AI assistant for Shemoqmedi cafe. 
      BRAND VOICE: Minimalist, professional, and knowledgeable about our menu.
      You have access to exact nutritional macros, allergens, and tasting notes. Use this data to accurately answer questions about calories, caffeine, or diet, but prioritize the user's conversational flow.
      
      PRODUCT CATALOG (Includes IDs and Allergens):
      ${productContext}
      
      ${basketContext}
      ${allergyContext}
      ${focusContext}
      
      INSTRUCTIONS:
      1. When users ask for recommendations or ask about products, find the most relevant, SAFE items from the PRODUCT CATALOG.
      2. Provide a brief, helpful text response in the language they are speaking.
      3. CRITICAL: You must include the EXACT integer "ID:" from the PRODUCT CATALOG for the items you are recommending in the "productIds" JSON array. NEVER hallucinate or invent IDs. If you recommend "Golden Tonic" which has "ID: 4", you MUST return 4 in the array.
    `;

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemInstruction }] },
        { role: "model", parts: [{ text: "Understood. I am ready." }] },
        ...history,
      ],
    });

    // 4. Send the message and parse the guaranteed JSON
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
