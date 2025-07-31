import { useState } from 'react';
import { Search, MapPin, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useToast } from '@/hooks/use-toast';

interface SearchFormProps {
  onSearch: (query: string, latitude: number, longitude: number, radius: number) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [radius, setRadius] = useState([10]);
  const { location, loading: locationLoading, error: locationError, detectLocation } = useGeolocation();
  const { toast } = useToast();

  const handleSearch = () => {
    if (!query.trim()) {
      toast({
        title: "Query required",
        description: "Please enter what you're looking for.",
        variant: "destructive",
      });
      return;
    }

    if (!location) {
      toast({
        title: "Location required",
        description: "Please detect your location first.",
        variant: "destructive",
      });
      return;
    }

    onSearch(query, location.latitude, location.longitude, radius[0]);
  };

  const handleDetectLocation = () => {
    detectLocation();
    if (locationError) {
      toast({
        title: "Location Error",
        description: locationError,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 text-slate-800">
      <div className="space-y-6">
        {/* Natural Language Query Input */}
        <div>
          <Label htmlFor="query" className="block text-sm font-medium text-slate-700 mb-2">
            What are you looking for?
          </Label>
          <div className="relative">
            <Input 
              type="text" 
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., I want a cozy cafe to work from, or find fun weekend activities"
              className="w-full px-4 py-4 text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch}
              disabled={isLoading || !query.trim() || !location}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary text-white hover:bg-blue-700"
              size="sm"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Location Controls */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Current Location Display */}
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">
              Your Location
            </Label>
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <MapPin className="w-5 h-5 text-secondary" />
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-800">
                  {location ? (
                    location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                  ) : (
                    "Location not detected"
                  )}
                </div>
                {location && (
                  <div className="text-xs text-slate-500">
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </div>
                )}
              </div>
              <Button 
                onClick={handleDetectLocation}
                disabled={locationLoading}
                variant="ghost"
                size="sm"
                className="text-primary hover:text-blue-700"
                title="Detect my location"
              >
                <Crosshair className="w-4 h-4" />
              </Button>
            </div>
            {locationError && (
              <p className="text-xs text-red-600 mt-1">{locationError}</p>
            )}
          </div>

          {/* Search Radius Control */}
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">
              Search Radius: {radius[0]} km
            </Label>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <Slider
                value={radius}
                onValueChange={setRadius}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1km</span>
                <span>25km</span>
                <span>50km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <Button 
          onClick={handleSearch}
          disabled={isLoading || !query.trim() || !location}
          className="w-full bg-secondary text-white py-4 rounded-xl font-semibold text-lg hover:bg-emerald-600 h-auto"
        >
          <Search className="w-5 h-5 mr-2" />
          {isLoading ? 'Searching...' : 'Find Recommendations'}
        </Button>
      </div>
    </div>
  );
}
