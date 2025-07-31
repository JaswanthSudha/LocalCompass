import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { SearchForm } from '@/components/SearchForm';
import { RecommendationCard } from '@/components/RecommendationCard';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SearchResponse {
  recommendations: Array<{
    name: string;
    type: string;
    description: string;
    address: string;
    distance: number;
    formattedDistance: string;
    rating?: number;
    hours?: string;
    imageUrl?: string;
    externalUrl?: string;
  }>;
  query: string;
  location: { latitude: number; longitude: number };
  radius: number;
  count: number;
}

export default function Home() {
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: async (params: { query: string; latitude: number; longitude: number; radius: number }) => {
      const response = await apiRequest('POST', '/api/search', params);
      return response.json() as Promise<SearchResponse>;
    },
    onSuccess: (data) => {
      setSearchResults(data);
      setSearchQuery(data.query);
      toast({
        title: "Search completed",
        description: `Found ${data.count} recommendations near you.`,
      });
    },
    onError: (error) => {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: error.message || "Failed to get recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (query: string, latitude: number, longitude: number, radius: number) => {
    searchMutation.mutate({ query, latitude, longitude, radius });
  };

  const handleRetry = () => {
    if (searchResults) {
      handleSearch(
        searchResults.query,
        searchResults.location.latitude,
        searchResults.location.longitude,
        searchResults.radius
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-700 text-white py-12 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              Discover Amazing Places Near You
            </h2>
            <p className="text-lg lg:text-xl text-blue-100 max-w-2xl mx-auto">
              Tell us what you're looking for in plain English. Our AI will find local recommendations based on known places and businesses.
            </p>
            <div className="mt-4 p-3 bg-blue-600/30 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm text-blue-100">
                <strong>Note:</strong> Recommendations are based on AI knowledge of established businesses. For real-time hours and availability, please verify directly with the location.
              </p>
            </div>
          </div>

          <SearchForm onSearch={handleSearch} isLoading={searchMutation.isPending} />
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {searchMutation.isPending && <LoadingState />}
          
          {searchMutation.isError && (
            <ErrorState 
              message={searchMutation.error?.message || "An error occurred while searching for recommendations"}
              onRetry={handleRetry}
            />
          )}

          {searchResults && !searchMutation.isPending && (
            <>
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
                    Recommendations for: "{searchQuery}"
                  </h3>
                  <p className="text-slate-600">
                    Found {searchResults.count} great places within {searchResults.radius}km of your location
                  </p>
                </div>
              </div>

              {/* Recommendation Cards Grid */}
              {searchResults.recommendations.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.recommendations.map((recommendation, index) => (
                    <RecommendationCard key={index} recommendation={recommendation} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="text-slate-500 w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-semibold text-slate-800 mb-2">
                    No recommendations found
                  </h4>
                  <p className="text-slate-600">
                    Try adjusting your search query or increasing the search radius.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Bot className="text-white w-4 h-4" />
                </div>
                <h3 className="text-xl font-bold text-white">LocalBot</h3>
              </div>
              <p className="text-slate-400 max-w-md">
                Discover amazing places near you with the power of AI. Get personalized recommendations that match your interests and preferences.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">How it works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 mt-8 text-center text-slate-500">
            <p>&copy; 2024 LocalBot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
