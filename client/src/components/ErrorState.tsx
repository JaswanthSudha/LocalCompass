import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <Card>
        <CardContent className="pt-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-500 w-6 h-6" />
          </div>
          <h4 className="text-xl font-semibold text-slate-800 mb-2">
            Oops! Something went wrong
          </h4>
          <p className="text-slate-600 mb-6">
            {message}
          </p>
          <Button 
            onClick={onRetry}
            className="bg-primary text-white hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
