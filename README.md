# LocalBot - AI-Powered Local Discovery

An intelligent web application that uses Google Gemini AI to provide personalized local recommendations based on natural language queries.

## Features

- **Natural Language Search**: Ask for places in plain English (e.g., "cozy cafes to work from")
- **Location-Based Results**: Automatic GPS detection with adjustable search radius (1-50km)
- **AI-Powered Recommendations**: Google Gemini 2.5 Flash processes your queries
- **Mobile-First Design**: Responsive interface that works great on all devices
- **Smart Caching**: Reduces API calls by caching similar searches

## Current Data Limitations & Real-Time Integration

### Current Implementation
The app currently uses Google Gemini's knowledge base to suggest well-known, established businesses. While accurate for popular locations, this approach has limitations:

- **Not Real-Time**: Results are based on AI training data, not live web searches
- **No Current Hours**: Operating hours may not reflect current status
- **Limited New Businesses**: Recently opened places may not be included

### Integrating Real-Time Data
To enable real-time local business data, you can integrate these APIs:

#### Google Places API
```typescript
// Add to server/services/places.ts
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function searchNearbyPlaces(query: string, lat: number, lng: number, radius: number) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius * 1000}&keyword=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}`
  );
  return response.json();
}
```

#### Yelp Fusion API
```typescript
// Add to server/services/yelp.ts  
const YELP_API_KEY = process.env.YELP_API_KEY;

export async function searchYelpBusinesses(query: string, lat: number, lng: number, radius: number) {
  const response = await fetch(
    `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(query)}&latitude=${lat}&longitude=${lng}&radius=${Math.min(radius * 1000, 40000)}`,
    { headers: { 'Authorization': `Bearer ${YELP_API_KEY}` } }
  );
  return response.json();
}
```

## Getting Started

1. **Get API Keys**:
   - [Google Gemini API](https://aistudio.google.com/) (required)
   - [Google Places API](https://developers.google.com/places/web-service) (optional, for real-time data)
   - [Yelp Fusion API](https://www.yelp.com/developers) (optional, for real-time data)

2. **Set Environment Variables**:
   ```
   GEMINI_API_KEY=your_gemini_key_here
   GOOGLE_PLACES_API_KEY=your_places_key_here  # optional
   YELP_API_KEY=your_yelp_key_here  # optional
   ```

3. **Run the Application**:
   ```bash
   npm run dev
   ```

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript  
- **AI**: Google Gemini 2.5 Flash
- **Database**: In-memory storage (easily replaceable with PostgreSQL)
- **Build**: Vite for fast development and optimized production builds

## Future Enhancements

- [ ] Google Places API integration for real-time business data
- [ ] Yelp API integration for reviews and ratings
- [ ] User accounts and personalized recommendations
- [ ] Favorite places and search history
- [ ] Push notifications for nearby events
- [ ] Integration with mapping services for directions

## Contributing

This project is set up for easy extension. Key areas for contribution:

1. **Real-Time Data Sources**: Add new API integrations in `server/services/`
2. **UI Components**: Enhance the interface in `client/src/components/`
3. **Search Algorithms**: Improve recommendation logic in `server/services/gemini.ts`
4. **Mobile Features**: Add location-based notifications and offline support

The application follows modern full-stack patterns and is designed to be easily deployable and scalable.