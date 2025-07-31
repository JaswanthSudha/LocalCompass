import { LocalDiscoveryAgent } from "../agents/searchAgent";
import { EnhancedLocalDiscoveryAgent } from "../agents/enhancedSearchAgent";
import { LocationRecommendation } from "./gemini";

// Version 2: Agent-powered local discovery service with enhanced recommendations
export class AgentPoweredLocalService {
  private agent: LocalDiscoveryAgent;
  private enhancedAgent: EnhancedLocalDiscoveryAgent;

  constructor() {
    this.agent = new LocalDiscoveryAgent();
    this.enhancedAgent = new EnhancedLocalDiscoveryAgent();
  }

  async getLocalRecommendations(
    query: string,
    latitude: number,
    longitude: number,
    radius: number
  ): Promise<LocationRecommendation[]> {
    try {
      console.log(`🚀 Starting enhanced agent search for: "${query}"`);
      
      // First try the web search agent
      let recommendations: LocationRecommendation[] = [];
      
      try {
        recommendations = await this.agent.searchLocalRecommendations(
          query,
          latitude,
          longitude,
          radius
        );
      } catch (webSearchError) {
        console.log(`⚠️ Web search agent failed, using enhanced agent`);
        recommendations = [];
      }
      
      // If web search didn't return enough results, use enhanced agent for comprehensive recommendations
      if (recommendations.length < 8) {
        console.log(`📈 Getting comprehensive recommendations (current: ${recommendations.length})`);
        const enhancedRecommendations = await this.enhancedAgent.searchLocalRecommendations(
          query,
          latitude,
          longitude,
          radius
        );
        
        // Combine and deduplicate by name
        const allRecommendations = [...recommendations, ...enhancedRecommendations];
        const uniqueRecommendations = allRecommendations.filter((rec, index, self) => 
          index === self.findIndex(r => r.name.toLowerCase() === rec.name.toLowerCase())
        );
        
        recommendations = uniqueRecommendations;
      }

      console.log(`🎯 Agent service completed with ${recommendations.length} total recommendations`);
      
      return recommendations;

    } catch (error) {
      console.error("AgentPoweredLocalService error:", error);
      
      // Fallback to enhanced agent only
      try {
        console.log(`🔄 Fallback to enhanced agent only`);
        return await this.enhancedAgent.searchLocalRecommendations(query, latitude, longitude, radius);
      } catch (fallbackError) {
        throw new Error(`All search agents failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }
}

export const agentService = new AgentPoweredLocalService();