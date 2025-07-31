import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

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

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful local discovery assistant that provides accurate recommendations for places and activities based on user queries and location. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.recommendations || !Array.isArray(result.recommendations)) {
      throw new Error("Invalid response format from OpenAI");
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
    console.error("Error getting recommendations from OpenAI:", error);
    throw new Error("Failed to get recommendations. Please try again.");
  }
}
