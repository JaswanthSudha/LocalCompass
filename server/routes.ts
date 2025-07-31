import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchRequestSchema } from "@shared/schema";
import { getLocalRecommendations } from "./services/gemini";
import { calculateDistance, isValidCoordinates, formatDistance } from "./services/location";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Search for local recommendations
  app.post("/api/search", async (req, res) => {
    try {
      const validatedData = searchRequestSchema.parse(req.body);
      const { query, latitude, longitude, radius } = validatedData;

      if (!isValidCoordinates(latitude, longitude)) {
        return res.status(400).json({ 
          message: "Invalid coordinates provided" 
        });
      }

      // Check for cached results
      const cachedQuery = await storage.getSearchQuery(query, latitude, longitude, radius);
      if (cachedQuery && cachedQuery.results) {
        return res.json(cachedQuery.results);
      }

      // Get recommendations from OpenAI
      const recommendations = await getLocalRecommendations(query, latitude, longitude, radius);
      
      // Calculate distances and filter by radius
      const enrichedRecommendations = recommendations
        .map(rec => {
          const distance = calculateDistance(latitude, longitude, rec.latitude, rec.longitude);
          return {
            ...rec,
            distance: parseFloat(distance.toFixed(1)),
            formattedDistance: formatDistance(distance)
          };
        })
        .filter(rec => rec.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

      const result = {
        recommendations: enrichedRecommendations,
        query,
        location: { latitude, longitude },
        radius,
        count: enrichedRecommendations.length
      };

      // Cache the results
      await storage.createSearchQuery({
        query,
        latitude,
        longitude,
        radius,
        results: result
      });

      // Store recommendations in storage
      for (const rec of enrichedRecommendations) {
        await storage.createRecommendation({
          name: rec.name,
          type: rec.type,
          description: rec.description,
          address: rec.address,
          latitude: rec.latitude,
          longitude: rec.longitude,
          rating: rec.rating,
          distance: rec.distance,
          hours: rec.hours,
          imageUrl: rec.imageUrl,
          externalUrl: rec.externalUrl,
          metadata: null
        });
      }

      res.json(result);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "An error occurred while searching for recommendations" 
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
