import { type User, type InsertUser, type Recommendation, type InsertRecommendation, type SearchQuery, type InsertSearchQuery } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;
  getRecommendationsByLocation(latitude: number, longitude: number, radius: number): Promise<Recommendation[]>;
  
  createSearchQuery(searchQuery: InsertSearchQuery): Promise<SearchQuery>;
  getSearchQuery(query: string, latitude: number, longitude: number, radius: number): Promise<SearchQuery | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private recommendations: Map<string, Recommendation>;
  private searchQueries: Map<string, SearchQuery>;

  constructor() {
    this.users = new Map();
    this.recommendations = new Map();
    this.searchQueries = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createRecommendation(insertRecommendation: InsertRecommendation): Promise<Recommendation> {
    const id = randomUUID();
    const recommendation: Recommendation = { 
      ...insertRecommendation, 
      id, 
      createdAt: new Date(),
      metadata: insertRecommendation.metadata || null,
      rating: insertRecommendation.rating ?? null,
      distance: insertRecommendation.distance ?? null,
      hours: insertRecommendation.hours ?? null,
      imageUrl: insertRecommendation.imageUrl ?? null,
      externalUrl: insertRecommendation.externalUrl ?? null
    };
    this.recommendations.set(id, recommendation);
    return recommendation;
  }

  async getRecommendationsByLocation(latitude: number, longitude: number, radius: number): Promise<Recommendation[]> {
    const recommendations = Array.from(this.recommendations.values());
    return recommendations.filter(rec => {
      const distance = this.calculateDistance(latitude, longitude, rec.latitude, rec.longitude);
      return distance <= radius;
    });
  }

  async createSearchQuery(insertSearchQuery: InsertSearchQuery): Promise<SearchQuery> {
    const id = randomUUID();
    const searchQuery: SearchQuery = { 
      ...insertSearchQuery, 
      id, 
      createdAt: new Date(),
      results: insertSearchQuery.results || null
    };
    const key = this.getSearchKey(insertSearchQuery.query, insertSearchQuery.latitude, insertSearchQuery.longitude, insertSearchQuery.radius);
    this.searchQueries.set(key, searchQuery);
    return searchQuery;
  }

  async getSearchQuery(query: string, latitude: number, longitude: number, radius: number): Promise<SearchQuery | undefined> {
    const key = this.getSearchKey(query, latitude, longitude, radius);
    return this.searchQueries.get(key);
  }

  private getSearchKey(query: string, latitude: number, longitude: number, radius: number): string {
    return `${query.toLowerCase()}-${latitude.toFixed(4)}-${longitude.toFixed(4)}-${radius}`;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }
}

export const storage = new MemStorage();
