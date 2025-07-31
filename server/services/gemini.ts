import { GoogleGenAI } from "@google/genai";
import { enhanceGeminiPrompt } from "./websearch";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface LocationRecommendation {
  name: string;
  type: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  hours?: string;
  imageUrl?: string;
  externalUrl?: string;
}

export async function getLocalRecommendations(
  query: string,
  latitude: number,
  longitude: number,
  radius: number
): Promise<LocationRecommendation[]> {
  try {
    const enhancedPrompt = enhanceGeminiPrompt(query, latitude, longitude);
    
    const prompt = `${enhancedPrompt}

Search Radius: ${radius} km

For each recommendation, provide:
1. Name of the place/business (must be real and currently operating)
2. Type (e.g., Restaurant, Cafe, Museum, Park, etc.)
3. Brief description based on what you know about real places in this area
4. Complete street address (real address that exists)
5. Accurate latitude and longitude coordinates
6. Realistic rating from review sites (1-5 scale)
7. Typical hours of operation for this type of business
8. Real website URL if you know it exists
9. Why it matches the user's query

Return only well-established places that you're confident actually exist. Limit to 6-8 recommendations.

Response format:
{
  "recommendations": [
    {
      "name": "Business Name",
      "type": "Category",
      "description": "Description here",
      "address": "Full address",
      "latitude": 0.0,
      "longitude": 0.0,
      "rating": 4.5,
      "hours": "Open until 9 PM",
      "imageUrl": "https://example.com/image.jpg",
      "externalUrl": "https://example.com"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string" },
                  description: { type: "string" },
                  address: { type: "string" },
                  latitude: { type: "number" },
                  longitude: { type: "number" },
                  rating: { type: "number" },
                  hours: { type: "string" },
                  imageUrl: { type: "string" },
                  externalUrl: { type: "string" }
                },
                required: ["name", "type", "description", "address", "latitude", "longitude"]
              }
            }
          },
          required: ["recommendations"]
        }
      },
      contents: prompt,
    });

    const result = JSON.parse(response.text || "{}");
    
    if (!result.recommendations || !Array.isArray(result.recommendations)) {
      throw new Error("Invalid response format from Gemini");
    }

    return result.recommendations.map((rec: any) => ({
      name: rec.name || "Unknown",
      type: rec.type || "Place",
      description: rec.description || "No description available",
      address: rec.address || "Address not available",
      latitude: parseFloat(rec.latitude) || latitude,
      longitude: parseFloat(rec.longitude) || longitude,
      rating: rec.rating ? parseFloat(rec.rating) : undefined,
      hours: rec.hours || undefined,
      imageUrl: rec.imageUrl || undefined,
      externalUrl: rec.externalUrl || undefined,
    }));

  } catch (error) {
    console.error("Error getting recommendations from Gemini:", error);
    throw new Error("Failed to get recommendations. Please try again.");
  }
}