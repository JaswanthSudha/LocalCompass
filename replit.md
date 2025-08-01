# LocalBot - AI-Powered Local Discovery Application

## Overview

LocalBot is a responsive web application that leverages Large Language Models (LLMs) to provide personalized local recommendations. Users can search for places, activities, restaurants, and events using natural language queries, with results filtered by location and distance. The application features a modern, mobile-first design built with React and Express.

## User Preferences

Preferred communication style: Simple, everyday language.
AI Model Preference: Google Gemini (switched from OpenAI per user request)

## Recent Changes

**2025-07-31**: Switched from OpenAI to Google Gemini 2.5 Flash model
- Replaced OpenAI integration with Google Gemini API
- Updated prompts for better real place recommendations  
- Added documentation about data limitations and real-time integration options
- Added user disclaimer about data accuracy and verification needs

**2025-07-31 (Version 2)**: Implemented intelligent search agent system
- Created LocalDiscoveryAgent that performs real web searches using DuckDuckGo
- Agent automatically searches the internet for local businesses based on location
- Gemini now acts as a mediator to analyze and structure web search results
- Added web scraping capabilities for enhanced data gathering
- System now provides real-time business information rather than static AI knowledge

**2025-07-31 (Enhanced)**: Increased recommendation capacity and accuracy
- Added EnhancedLocalDiscoveryAgent for comprehensive recommendations (10-20 results)
- Improved radius accuracy with precise distance calculations
- Enhanced view button functionality with Google search fallback
- Fixed coordinate generation to ensure all places are within specified radius
- Combined web search and enhanced agents for maximum recommendation coverage

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API**: RESTful endpoints with JSON responses
- **Middleware**: Express JSON parsing, custom logging, error handling
- **Development**: Vite integration for HMR and development server

### Database & ORM
- **Database**: PostgreSQL (configured via Drizzle)
- **ORM**: Drizzle ORM with Zod schema validation
- **Connection**: Neon Database serverless PostgreSQL
- **Storage Abstraction**: In-memory storage implementation with interface for database migration

## Key Components

### Search & Recommendation Engine
- **LLM Integration**: Google Gemini 2.5 Flash for processing natural language queries
- **Location Services**: Browser geolocation API with manual location input fallback
- **Distance Calculation**: Haversine formula for accurate distance calculations
- **Caching**: Query result caching to improve performance and reduce API calls

### User Interface Components
- **SearchForm**: Location detection, query input, and radius selection
- **RecommendationCard**: Displays recommendation details with ratings, distance, and links
- **LoadingState**: Animated loading indicators with skeleton cards
- **ErrorState**: User-friendly error handling with retry functionality
- **Header**: Responsive navigation with mobile menu

### Data Models
- **Users**: Basic user authentication schema
- **Recommendations**: Place details with coordinates, ratings, and metadata
- **SearchQueries**: Cached search results with location and parameters

## Data Flow

1. **User Input**: User enters natural language query and location is detected/confirmed
2. **Validation**: Request validated using Zod schemas before processing
3. **Cache Check**: System checks for existing cached results for the same query/location
4. **LLM Processing**: If no cache, query sent to Google Gemini for recommendation generation
5. **Location Filtering**: Results filtered by distance and sorted by proximity
6. **Response**: Structured recommendations returned with distance calculations
7. **Caching**: Results cached for future similar queries
8. **UI Update**: Frontend displays recommendations in responsive card layout

## External Dependencies

### Core Dependencies
- **Google Gemini API**: For natural language processing and recommendation generation
- **Neon Database**: Serverless PostgreSQL hosting
- **Geolocation API**: Browser-based location detection

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **TanStack Query**: Data fetching and caching

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and development experience
- **Drizzle Kit**: Database schema management and migrations

## Deployment Strategy

### Development
- **Hot Module Replacement**: Vite dev server with Express integration
- **Environment Variables**: Google Gemini API key and database URL configuration
- **Type Checking**: TypeScript compilation without emit for development

### Production Build
- **Frontend**: Vite builds optimized React bundle
- **Backend**: esbuild compiles TypeScript to ESM for Node.js
- **Static Assets**: Frontend built to `dist/public` directory
- **Server**: Express serves static files and API routes

### Database Management
- **Schema**: Defined in `shared/schema.ts` with Drizzle ORM
- **Migrations**: Generated in `migrations/` directory
- **Push**: Direct schema push to database via `drizzle-kit push`

### Error Handling
- **API Errors**: Structured error responses with status codes
- **Frontend**: Toast notifications and error state components
- **Location**: Fallback handling for geolocation failures
- **Network**: Retry mechanisms and loading states

The application is designed to be scalable, maintainable, and provide an excellent user experience across all device types, with particular attention to mobile responsiveness and performance optimization.