import { GoogleGenAI, Type } from "@google/genai";
import { SupplierProduct } from "../types";

const apiKey = process.env.API_KEY || ''; // Ensure API key is available
const ai = new GoogleGenAI({ apiKey });

// Optimize a raw supplier product for the local storefront
export const optimizeProductListing = async (product: SupplierProduct): Promise<{ title: string; description: string; recommendedPrice: number }> => {
  if (!apiKey) {
    // Fallback if no API key is provided
    return {
      title: `Premium: ${product.rawTitle}`,
      description: "Discover our latest collection item, curated for quality and style.",
      recommendedPrice: product.wholesalePrice * 2
    };
  }

  try {
    const prompt = `
      You are an expert e-commerce copywriter for a high-end French/International lifestyle brand named 'Bob-Shop'.
      Take the following raw product data and transform it into a compelling, professional product listing.
      Do NOT mention 'dropshipping', 'supplier', or 'China'. Focus on quality, lifestyle, and benefits.
      
      Raw Title: ${product.rawTitle}
      Raw Description: ${product.rawDescription}
      Wholesale Price: ${product.wholesalePrice}
      
      Tasks:
      1. Create a catchy, SEO-friendly Title (max 60 chars).
      2. Write a persuasive Description (2-3 sentences highlighting benefits).
      3. Suggest a Retail Price (assume a 2.5x to 4x markup based on perceived value).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            recommendedPrice: { type: Type.NUMBER },
          },
          required: ["title", "description", "recommendedPrice"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Optimization failed:", error);
    return {
      title: product.rawTitle.substring(0, 50) + "...",
      description: "Exclusive product.",
      recommendedPrice: product.wholesalePrice * 3
    };
  }
};

export const generateMarketingBlurb = async (category: string) => {
    if (!apiKey) return "Experience the art of living.";
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Write a short, sophisticated 1-sentence marketing slogan for a retail category: ${category}. Do not use the word dropshipping.`,
            config: {
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });
        return response.text || `Discover our ${category} collection`;
    } catch (e) {
        return `Premium ${category} selection.`;
    }
}
