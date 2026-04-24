import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, productContext, conversationHistory = [] } = body;

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
    const systemInstruction = `
      You are the AI assistant for Shemoqmedi cafe. 
      BRAND VOICE: Minimalist, professional, and knowledgeable about our menu.
      
      PRODUCT CATALOG:
      ${productContext}
      
      INSTRUCTIONS:
      When users ask for recommendations or ask about specific items, find the most relevant items from the catalog. 
      Provide a brief, helpful text response, and include the exact integer IDs of the recommended products in the productIds array.
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
