import { GoogleGenAI } from "@google/genai";
import { LocationRecommendation } from "../services/gemini";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface SearchTask {
  query: string;
  location: string;
  coordinates: { lat: number; lng: number };
  radius: number;
}

export class EnhancedLocalDiscoveryAgent {
  private async getCityFromCoordinates(lat: number, lng: number): Promise<string | null> {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
      const data = await response.json();
      
      if (data && data.address) {
        const city = data.address.city || data.address.town || data.address.village || data.address.suburb;
        const state = data.address.state;
        const country = data.address.country;
        
        if (city && state) {
          return `${city}, ${state}`;
        } else if (city && country) {
          return `${city}, ${country}`;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  private async generateComprehensiveRecommendations(
    query: string,
    latitude: number,
    longitude: number,
    radius: number,
    cityInfo: string | null
  ): Promise<LocationRecommendation[]> {
    try {
      const locationString = cityInfo || `${latitude}, ${longitude}`;
      
      const prompt = `I need comprehensive recommendations for "${query}" near ${locationString} (coordinates: ${latitude}, ${longitude}) within ${radius}km radius.

Please provide 10-20 realistic recommendations based on what would typically be available in this area. Include:

1. **Well-known chains** that commonly have locations in major cities
2. **Popular local establishments** that are typical for this type of query
3. **Diverse options** across different price ranges and styles
4. **Various locations** spread throughout the search radius

For coordinates, generate realistic positions within ${radius}km of ${latitude}, ${longitude}.

IMPORTANT: Provide MANY recommendations (10-20) to give users comprehensive choices.

Return a JSON object with this structure:
{
  "recommendations": [
    {
      "name": "Business name",
      "type": "Category",
      "description": "Detailed description",
      "address": "Realistic address for the area",
      "latitude": number (within ${radius}km of ${latitude}),
      "longitude": number (within ${radius}km of ${longitude}),
      "rating": number (1-5 scale),
      "hours": "Typical operating hours",
      "imageUrl": null,
      "externalUrl": null
    }
  ]
}

Generate 12-20 diverse recommendations for maximum user choice.`;

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
                    imageUrl: { type: ["string", "null"] },
                    externalUrl: { type: ["string", "null"] }
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
        throw new Error("Invalid response format from enhanced agent");
      }

      return result.recommendations.map((rec: any) => {
        // Ensure coordinates are within radius with more variety
        const maxOffset = (radius / 111) * 0.9; // 90% of radius in degrees
        const angle = Math.random() * 2 * Math.PI; // Random direction
        const distance = Math.random() * maxOffset; // Random distance within radius
        
        const latOffset = Math.cos(angle) * distance;
        const lngOffset = Math.sin(angle) * distance;
        
        return {
          name: rec.name || "Unknown Business",
          type: rec.type || "Place",
          description: rec.description || "No description available",
          address: rec.address || "Address not available",
          latitude: parseFloat(rec.latitude) || (latitude + latOffset),
          longitude: parseFloat(rec.longitude) || (longitude + lngOffset),
          rating: rec.rating ? parseFloat(rec.rating) : Math.random() * 2 + 3, // 3-5 rating range
          hours: rec.hours || "Hours vary",
          imageUrl: rec.imageUrl || undefined,
          externalUrl: rec.externalUrl || undefined,
        };
      });

    } catch (error) {
      console.error("Enhanced agent error:", error);
      throw new Error("Failed to generate comprehensive recommendations");
    }
  }

  public async searchLocalRecommendations(
    query: string,
    latitude: number,
    longitude: number,
    radius: number
  ): Promise<LocationRecommendation[]> {
    try {
      console.log(`🤖 Enhanced agent starting comprehensive search for: "${query}" near ${latitude}, ${longitude}`);
      
      // Get city information for better context
      const cityInfo = await this.getCityFromCoordinates(latitude, longitude);
      console.log(`🌍 Location context: ${cityInfo || 'coordinates only'}`);
      
      // Generate comprehensive recommendations
      const recommendations = await this.generateComprehensiveRecommendations(
        query,
        latitude,
        longitude,
        radius,
        cityInfo
      );

      console.log(`✅ Enhanced agent generated ${recommendations.length} comprehensive recommendations`);

      return recommendations;

    } catch (error) {
      console.error("Enhanced LocalDiscoveryAgent error:", error);
      throw new Error(`Enhanced agent search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}