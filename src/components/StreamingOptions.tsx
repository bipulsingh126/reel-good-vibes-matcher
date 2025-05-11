import { StreamingInfo } from '@/types/movie';
import { Button } from '@/components/ui/button';
import { ExternalLink, Play } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface StreamingOptionsProps {
  streamingUrls?: StreamingInfo[];
  trailerUrl?: string;
}

const StreamingOptions = ({ streamingUrls, trailerUrl }: StreamingOptionsProps) => {
  const { toast } = useToast();

  const handleStreamingClick = (provider: string, url: string) => {
    // In a real application, this could track analytics or handle authentication
    window.open(url, '_blank');
    
    toast({
      title: `Opening ${provider}`,
      description: "Redirecting to streaming service...",
      duration: 3000,
    });
  };
  
  const handlePlayTrailer = () => {
    if (!trailerUrl) {
      toast({
        title: "Trailer Unavailable",
        description: "Sorry, the trailer for this movie is not available.",
        duration: 3000,
      });
      return;
    }
    
    // Open trailer in a new tab
    window.open(trailerUrl, '_blank');
  };

  if (!streamingUrls || streamingUrls.length === 0) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border border-border">
        <h3 className="text-lg font-medium mb-2">Streaming Options</h3>
        <p className="text-muted-foreground">
          This movie is not currently available for streaming.
        </p>
        {trailerUrl && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePlayTrailer}
            className="mt-4 gap-2"
          >
            <Play className="h-4 w-4" /> Watch Trailer
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 bg-muted/30 rounded-lg border border-border">
      <h3 className="text-lg font-medium mb-4">Watch Now</h3>
      
      <div className="space-y-3">
        {streamingUrls.map((option, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-3 bg-background rounded-md border border-border hover:bg-accent/50 transition-colors"
          >
            <div>
              <h4 className="font-medium">{option.provider}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {option.quality && <span className="px-1.5 py-0.5 bg-primary/20 text-primary rounded text-xs">{option.quality}</span>}
                {option.subscriptionRequired && <span>Subscription</span>}
                {option.price && <span>${option.price.toFixed(2)}</span>}
              </div>
            </div>
            
            <Button 
              size="sm" 
              onClick={() => handleStreamingClick(option.provider, option.url)}
              className="gap-1"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Watch
            </Button>
          </div>
        ))}
      </div>
      
      {trailerUrl && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePlayTrailer}
            className="w-full gap-2"
          >
            <Play className="h-4 w-4" /> Watch Trailer
          </Button>
        </div>
      )}
    </div>
  );
};

export default StreamingOptions; 