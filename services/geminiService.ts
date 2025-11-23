import { GoogleGenAI, Type } from "@google/genai";
import { SupplierProduct } from "../types";

const apiKey = process.env.API_KEY || ''; // Ensure API key is available
const ai = new GoogleGenAI({ apiKey });

// Optimize a raw supplier product for the local storefront
export const optimizeProductListing = async (product: SupplierProduct): Promise<{ title: string; description: string; recommendedPrice: number }> => {
  if (!apiKey) {
    // Fallback if no API key is provided
    return {
      title: `Imported: ${product.rawTitle}`,
      description: "Generic description generated without AI.",
      recommendedPrice: product.wholesalePrice * 2
    };
  }

  try {
    const prompt = `
      You are an expert e-commerce copywriter for a high-end dropshipping store named 'Bob-Shop'.
      Take the following raw product data from a supplier and transform it into a compelling, professional product listing.
      
      Raw Title: ${product.rawTitle}
      Raw Description: ${product.rawDescription}
      Wholesale Price: ${product.wholesalePrice}
      
      Tasks:
      1. Create a catchy, SEO-friendly Title (max 60 chars).
      2. Write a persuasive Description (2-3 sentences highlighting benefits).
      3. Suggest a Retail Price (assume a 2.5x to 4x markup based on perceived value).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
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
      description: "Imported product.",
      recommendedPrice: product.wholesalePrice * 3
    };
  }
};

export const generateMarketingBlurb = async (category: string) => {
    if (!apiKey) return "Welcome to the future of shopping.";
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write a short, punchy 1-sentence marketing slogan for a dropshipping category: ${category}`
        });
        return response.text || `Best deals on ${category}`;
    } catch (e) {
        return `Top quality ${category} products.`;
    }
}
