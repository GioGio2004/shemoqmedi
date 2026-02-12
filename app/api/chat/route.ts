

import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: /api/chat
 * Enhanced with product recommendation intelligence
 * Parses user queries and returns relevant product IDs
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      productContext,
      currentPage, 
      scrollPosition, 
      viewportCenter,
      conversationHistory = []
    } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not found in environment variables");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    // Build conversation context
    const conversationContext = conversationHistory
      .map((msg: any) => {
        let text = msg.content;
        // RECONSTRUCT TAGS so the model sees it "did" use them before
        if (msg.role === "assistant" && Array.isArray(msg.products) && msg.products.length > 0) {
           text += ` [PRODUCTS: ${msg.products.join(',')}]`;
        }
        return `${msg.role === "user" ? "User" : "Assistant"}: ${text}`;
      })
      .join("\n");

    // Enhanced system prompt with product intelligence
    const systemPrompt = `You are the AI assistant for Noir Coffee Shop, a premium dark-themed coffee experience brand.

BRAND VOICE:
- Sophisticated and knowledgeable about coffee craft
- Minimalist and concise (Keep responses under 60 words unless asked for detail)
- Dark/edgy aesthetic (embrace noir themes)
- Professional but approachable
- Authoritative on coffee expertise

PRODUCT CATALOG:
${productContext}

PRODUCT RECOMMENDATION INSTRUCTIONS:
When users ask for recommendations, suggestions, or "show me X", OR when discussing a specific product mentioned in context:
1. Recommend 2-4 relevant products from the catalog (or the single product being discussed)
2. Include product IDs in your response using this EXACT format: [PRODUCTS: 1,2,3]
3. The product IDs must be actual IDs from the catalog above
4. Place [PRODUCTS: ...] at the END of your response
5. CRITICAL: If the user asks a follow-up question about a product (e.g. "how much is it?", "tell me more"), you MUST include that product's ID again in the [PRODUCTS: ...] tag so strictly show the product card again.

Examples:
- User: "suggest something to drink" → Recommend drinks/coffee with [PRODUCTS: 5,6,7]
- User: "show me desserts" → Recommend bakery/cakes with [PRODUCTS: 9,10,12]
- User: "what's good for breakfast?" → Recommend coffee + bakery with [PRODUCTS: 1,9,11]
- User: "I want something sweet" → Recommend cakes/bakery with [PRODUCTS: 10,12,9]
- User: "cold drinks?" → Recommend cold beverages with [PRODUCTS: 4,5]
- User: "Tell me more about Obsidian Espresso" (ID: 1) → Answer details and append [PRODUCTS: 1]

CURRENT USER CONTEXT:
- Page: ${currentPage}
- Scroll Position: ${scrollPosition}px
- Viewport Center: ${JSON.stringify(viewportCenter)}

${conversationContext ? `CONVERSATION HISTORY:\n${conversationContext}\n` : ""}

Respond with expertise, maintaining the Noir brand voice. When making recommendations, be specific about why each product fits their request. Always include [PRODUCTS: ...] when recommending items or discussing specific products.`;

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: systemPrompt
                },
                {
                  text: `User Query: ${message}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error("Gemini API Error:", errorData);
      return NextResponse.json(
        { error: "Failed to get AI response", details: errorData },
        { status: geminiResponse.status }
      );
    }

    const geminiData = await geminiResponse.json();

    // Extract response text
    let aiResponse = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || 
                      "I apologize, but I couldn't generate a response. Please try again.";

    // Parse product IDs from response
    let productIds: number[] = [];
    const productMatch = aiResponse.match(/\[PRODUCTS:\s*([0-9,\s]+)\]/);
    
    if (productMatch) {
      // Extract and clean product IDs
      productIds = productMatch[1]
        .split(',')
        .map((id: string) => parseInt(id.trim()))
        .filter((id: number) => !isNaN(id) && id >= 1 && id <= 12);
      
      // Remove the [PRODUCTS: ...] tag from the response
      aiResponse = aiResponse.replace(/\[PRODUCTS:\s*[0-9,\s]+\]/g, '').trim();
    }

    return NextResponse.json({
      response: aiResponse,
      productIds: productIds,
      metadata: {
        model: "gemini-1.5-flash",
        timestamp: new Date().toISOString(),
        tokensUsed: geminiData?.usageMetadata,
        recommendedProducts: productIds.length
      }
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}