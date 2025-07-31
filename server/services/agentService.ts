import { LocalDiscoveryAgent } from "../agents/searchAgent";
import { LocationRecommendation } from "./gemini";

// Version 2: Agent-powered local discovery service
export class AgentPoweredLocalService {
  private agent: LocalDiscoveryAgent;

  constructor() {
    this.agent = new LocalDiscoveryAgent();
  }

  async getLocalRecommendations(
    query: string,
    latitude: number,
    longitude: number,
    radius: number
  ): Promise<LocationRecommendation[]> {
    try {
      console.log(`🚀 Starting agent-powered search for: "${query}"`);
      
      // Use the intelligent agent to perform web search and analysis
      const recommendations = await this.agent.searchLocalRecommendations(
        query,
        latitude,
        longitude,
        radius
      );

      console.log(`🎯 Agent completed search with ${recommendations.length} results`);
      
      return recommendations;

    } catch (error) {
      console.error("AgentPoweredLocalService error:", error);
      
      // Fallback to basic error response
      throw new Error(`Search agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const agentService = new AgentPoweredLocalService();