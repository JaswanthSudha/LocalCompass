import { GoogleGenAI } from "@google/genai";
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { LocationRecommendation } from "../services/gemini";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface SearchTask {
  query: string;
  location: string;
  coordinates: { lat: number; lng: number };
  radius: number;
}

interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  content?: string;
}

export class LocalDiscoveryAgent {
  private async getCityFromCoordinates(lat: number, lng: number): Promise<string | null> {
    try {
      // Simple reverse geocoding using a free service
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      
      if (data && data.address) {
        const city = data.address.city || data.address.town || data.address.village;
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
  private async performWebSearch(searchQuery: string): Promise<WebSearchResult[]> {
    try {
      console.log(`🔍 Searching for: "${searchQuery}"`);
      
      // Use a more specific search with location context
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Search request failed: ${response.status}`);
      }
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const results: WebSearchResult[] = [];
      
      // Try multiple selectors for different search result formats
      const selectors = ['.result', '.results_links', '.web-result', '.result__body'];
      
      for (const selector of selectors) {
        $(selector).each((i, element) => {
          if (results.length >= 10) return false;
          
          const $element = $(element);
          const title = $element.find('a[href]').first().text().trim() || 
                       $element.find('.result__title a').text().trim() ||
                       $element.find('h3').text().trim();
          
          const url = $element.find('a[href]').first().attr('href') || 
                     $element.find('.result__title a').attr('href') || '';
          
          const snippet = $element.find('.result__snippet').text().trim() ||
                         $element.find('.snippet').text().trim() ||
                         $element.text().replace(title, '').trim().slice(0, 200);
          
          if (title && url && snippet && title.length > 3) {
            results.push({ title, url, snippet });
          }
        });
        
        if (results.length > 0) break; // If we got results with this selector, stop trying others
      }
      
      console.log(`📊 Found ${results.length} search results for "${searchQuery}"`);
      
      return results;
    } catch (error) {
      console.error('Web search error:', error);
      return [];
    }
  }

  private async scrapeWebsiteContent(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Remove scripts and styles
      $('script, style, nav, footer, header').remove();
      
      // Extract main content
      const content = $('main, article, .content, #content, .main').first().text() || 
                     $('body').text();
      
      return content.replace(/\s+/g, ' ').trim().slice(0, 2000); // Limit content
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      return '';
    }
  }

  private async analyzeSearchResults(searchResults: WebSearchResult[], task: SearchTask): Promise<LocationRecommendation[]> {
    try {
      const searchData = searchResults.map(result => ({
        title: result.title,
        snippet: result.snippet,
        url: result.url,
        content: result.content?.slice(0, 500) || ''
      }));

      const prompt = `You are an expert local discovery agent. I've gathered web search results for the query "${task.query}" near location "${task.location}" (${task.coordinates.lat}, ${task.coordinates.lng}) within ${task.radius}km radius.

SEARCH RESULTS DATA:
${JSON.stringify(searchData, null, 2)}

Your task is to analyze these real web search results and extract information about actual places, businesses, restaurants, activities, or attractions that match the user's query.

IMPORTANT INSTRUCTIONS:
1. Only extract information about places that are mentioned in the search results
2. Create realistic recommendations based on the actual data found
3. If you find specific business names, addresses, or details in the search results, use them
4. For missing information (rating, hours, exact coordinates), make reasonable estimates based on typical businesses of that type
5. Ensure all recommendations are within the specified radius of ${task.coordinates.lat}, ${task.coordinates.lng}
6. Focus on the most relevant and popular places mentioned in the search results

Return a JSON object with this exact structure:
{
  "recommendations": [
    {
      "name": "Business Name from search results",
      "type": "Category (Restaurant, Cafe, etc.)",
      "description": "Description based on search results information",
      "address": "Full address if found in search results, or estimated based on location",
      "latitude": number (near the search coordinates),
      "longitude": number (near the search coordinates),
      "rating": number (1-5 scale, estimated if not found),
      "hours": "Operating hours if mentioned, or typical hours for this type of business",
      "imageUrl": null,
      "externalUrl": "Website URL if found in search results"
    }
  ]
}

Extract 4-8 recommendations from the search results. If no relevant places are found in the search results, return an empty array.`;

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
        throw new Error("Invalid response format from analysis");
      }

      return result.recommendations.map((rec: any) => ({
        name: rec.name || "Unknown Business",
        type: rec.type || "Place",
        description: rec.description || "No description available",
        address: rec.address || "Address not available",
        latitude: parseFloat(rec.latitude) || task.coordinates.lat,
        longitude: parseFloat(rec.longitude) || task.coordinates.lng,
        rating: rec.rating ? parseFloat(rec.rating) : undefined,
        hours: rec.hours || undefined,
        imageUrl: rec.imageUrl || undefined,
        externalUrl: rec.externalUrl || undefined,
      }));

    } catch (error) {
      console.error("Error analyzing search results:", error);
      throw new Error("Failed to analyze search results");
    }
  }

  public async searchLocalRecommendations(
    query: string,
    latitude: number,
    longitude: number,
    radius: number
  ): Promise<LocationRecommendation[]> {
    try {
      console.log(`🤖 Agent starting search for: "${query}" near ${latitude}, ${longitude}`);
      
      const task: SearchTask = {
        query,
        location: `${latitude}, ${longitude}`,
        coordinates: { lat: latitude, lng: longitude },
        radius
      };

      // Step 1: Determine search queries with better location context
      const cityInfo = await this.getCityFromCoordinates(latitude, longitude);
      const locationString = cityInfo || `${latitude}, ${longitude}`;
      
      const searchQueries = [
        `${query} in ${locationString}`,
        `${query} near ${locationString}`,
        `best ${query} ${locationString}`,
        `${query} ${locationString} reviews`,
        `${query} ${locationString} yelp google maps`
      ];

      console.log(`🔍 Agent performing web searches...`);
      
      // Step 2: Perform web searches
      const allSearchResults: WebSearchResult[] = [];
      for (const searchQuery of searchQueries.slice(0, 3)) { // Try 3 searches for better coverage
        const results = await this.performWebSearch(searchQuery);
        allSearchResults.push(...results);
        
        // Add delay between searches to be respectful
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Remove duplicates based on URL
      const uniqueResults = allSearchResults.filter((result, index, self) => 
        index === self.findIndex(r => r.url === result.url)
      );

      console.log(`📊 Agent found ${uniqueResults.length} unique search results`);

      if (uniqueResults.length === 0) {
        // Fallback: provide some generic but helpful information
        console.log(`⚠️ No web search results found, providing fallback recommendations`);
        return await this.getFallbackRecommendations(query, latitude, longitude, radius);
      }

      // Step 3: Scrape content from top results (optional, for better data)
      const topResults = uniqueResults.slice(0, 5);
      for (const result of topResults) {
        if (result.url.includes('yelp.com') || 
            result.url.includes('google.com') || 
            result.url.includes('tripadvisor.com') ||
            result.url.includes('foursquare.com') ||
            result.url.includes('opentable.com')) {
          result.content = await this.scrapeWebsiteContent(result.url);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log(`🧠 Agent analyzing search results with Gemini...`);

      // Step 4: Analyze results with Gemini
      const recommendations = await this.analyzeSearchResults(uniqueResults, task);

      console.log(`✅ Agent generated ${recommendations.length} recommendations`);

      return recommendations;

    } catch (error) {
      console.error("LocalDiscoveryAgent error:", error);
      throw new Error(`Agent search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getFallbackRecommendations(
    query: string,
    latitude: number,
    longitude: number,
    radius: number
  ): Promise<LocationRecommendation[]> {
    try {
      // If web search fails, use Gemini's knowledge as fallback
      const prompt = `I need recommendations for "${query}" near coordinates ${latitude}, ${longitude} within ${radius}km.

Since web search is not available, please provide recommendations based on your knowledge of well-known establishments in this area.

Provide realistic recommendations for businesses that are likely to exist in this area. Include:
- Well-known chains that have locations in major cities
- Popular local establishments if you know the area
- Generic but realistic business information

Return a JSON response with 3-5 recommendations in this format:
{
  "recommendations": [
    {
      "name": "Business name",
      "type": "Category",
      "description": "Description",
      "address": "Estimated address near the coordinates",
      "latitude": ${latitude + (Math.random() - 0.5) * 0.01},
      "longitude": ${longitude + (Math.random() - 0.5) * 0.01},
      "rating": 4.2,
      "hours": "Typical hours for this type of business",
      "imageUrl": null,
      "externalUrl": null
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          responseMimeType: "application/json"
        },
        contents: prompt,
      });

      const result = JSON.parse(response.text || "{}");
      return result.recommendations || [];

    } catch (error) {
      console.error("Fallback recommendations error:", error);
      return [];
    }
  }
}