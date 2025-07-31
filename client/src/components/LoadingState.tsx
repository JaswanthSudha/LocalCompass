import { Bot } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function LoadingState() {
  return (
    <div className="py-12">
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
          <Bot className="text-white w-6 h-6 animate-pulse" />
        </div>
        <h4 className="text-xl font-semibold text-slate-800 mb-2">
          AI is searching for you...
        </h4>
        <p className="text-slate-600">
          Analyzing your request and finding the best local recommendations
        </p>
      </div>
      
      {/* Loading Skeleton Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {Array(3).fill(0).map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="h-32 bg-slate-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-slate-200 rounded mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    </div>
  );
}
