import { Star, MapPin, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Recommendation {
  id?: string;
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
}

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const getTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('cafe') || lowerType.includes('coffee')) return 'bg-amber-100 text-amber-800';
    if (lowerType.includes('restaurant') || lowerType.includes('food')) return 'bg-green-100 text-green-800';
    if (lowerType.includes('museum') || lowerType.includes('gallery')) return 'bg-blue-100 text-blue-800';
    if (lowerType.includes('park') || lowerType.includes('outdoor')) return 'bg-emerald-100 text-emerald-800';
    if (lowerType.includes('music') || lowerType.includes('entertainment')) return 'bg-purple-100 text-purple-800';
    if (lowerType.includes('book') || lowerType.includes('shop')) return 'bg-indigo-100 text-indigo-800';
    return 'bg-slate-100 text-slate-800';
  };

  const handleViewDetails = () => {
    console.log('View details for:', recommendation.name);
    if (recommendation.externalUrl) {
      // Clean the URL and ensure it opens properly
      let url = recommendation.externalUrl;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // Search for the business on Google as fallback
      const searchQuery = encodeURIComponent(`${recommendation.name} ${recommendation.address}`);
      const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
      window.open(googleSearchUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {recommendation.imageUrl && (
        <img 
          src={recommendation.imageUrl}
          alt={recommendation.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="text-lg font-semibold text-slate-800 mb-1">
              {recommendation.name}
            </h4>
            <Badge className={`${getTypeColor(recommendation.type)} border-0`}>
              <span className="text-xs font-medium">
                {recommendation.type}
              </span>
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-slate-800">
              {recommendation.formattedDistance}
            </div>
            {recommendation.rating && (
              <div className="flex items-center text-amber-500">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs text-slate-600 ml-1">
                  {recommendation.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-slate-600 text-sm mb-4">
          {recommendation.description}
        </p>
        
        <div className="flex items-center text-sm text-slate-500 mb-4">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{recommendation.address}</span>
        </div>
        
        <div className="flex items-center justify-between">
          {recommendation.hours ? (
            <div className="flex items-center text-sm text-slate-600">
              <Clock className="w-4 h-4 mr-1" />
              <span>{recommendation.hours}</span>
            </div>
          ) : (
            <div></div>
          )}
          
          <Button 
            onClick={handleViewDetails}
            className="bg-primary text-white hover:bg-blue-700"
            size="sm"
          >
            {recommendation.externalUrl ? (
              <>
                <ExternalLink className="w-4 h-4 mr-1" />
                View Details
              </>
            ) : (
              'View Details'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
