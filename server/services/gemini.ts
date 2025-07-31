import { GoogleGenAI } from "@google/genai";

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
    const prompt = `You are a local discovery AI assistant. Based on the user's query and location, provide recommendations for places, activities, restaurants, events, or attractions.

User Query: "${query}"
Location: Latitude ${latitude}, Longitude ${longitude}
Search Radius: ${radius} km

Please search for and recommend relevant places within the specified radius. For each recommendation, provide:

1. Name of the place/business
2. Type (e.g., Restaurant, Cafe, Museum, Park, etc.)
3. Brief description (2-3 sentences)
4. Full address
5. Approximate latitude and longitude coordinates
6. Rating (1-5 scale if available)
7. Hours of operation (if available)
8. Image URL (if available)
9. Website or booking URL (if available)

Return your response as a JSON object with an array of recommendations. Each recommendation should have these exact fields:
- name (string)
- type (string)
- description (string)
- address (string)
- latitude (number)
- longitude (number)
- rating (number, optional)
- hours (string, optional)
- imageUrl (string, optional)
- externalUrl (string, optional)

Focus on real, existing places that match the user's query. Prioritize popular, well-reviewed establishments. Limit to 6-8 recommendations.

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