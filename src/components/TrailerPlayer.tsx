import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, X, AlertCircle } from 'lucide-react';

interface TrailerPlayerProps {
  trailerUrl: string;
  thumbnailUrl?: string;
  title: string;
}

const TrailerPlayer = ({ trailerUrl, thumbnailUrl, title }: TrailerPlayerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Extract video ID from YouTube URL if it's a YouTube video
  const getYouTubeEmbedUrl = useCallback((url: string) => {
    if (!url) return '';
    
    // Handle both youtube.com/embed and youtube.com/watch?v= formats
    if (url.includes('youtube.com/embed/')) {
      // Don't add autoplay parameter until dialog is opened
      return url;
    }
    
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      // Don't add autoplay parameter until dialog is opened
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    
    return url;
  }, []);

  const baseEmbedUrl = getYouTubeEmbedUrl(trailerUrl);
  
  // Add autoplay parameter only when dialog is open
  const embedUrl = isOpen ? `${baseEmbedUrl}?autoplay=1&rel=0&modestbranding=1` : baseEmbedUrl;

  // Handle dialog state changes
  useEffect(() => {
    if (isOpen) {
      setHasError(false);
      setIsLoading(true);
    } else if (!isOpen && iframeRef.current) {
      try {
        // When closing the dialog, reset the iframe src to stop video playback
        iframeRef.current.src = '';
      } catch (error) {
        console.error('Error resetting iframe src:', error);
      }
    }
    
    // Clean up function to ensure video stops playing when component unmounts
    return () => {
      if (iframeRef.current) {
        try {
          iframeRef.current.src = '';
        } catch (error) {
          // Ignore errors during unmount
        }
      }
    };
  }, [isOpen, baseEmbedUrl]);

  const handleIframeError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    console.error('Failed to load trailer video');
  }, []);
  
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative group cursor-pointer overflow-hidden rounded-lg">
          {thumbnailUrl ? (
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={thumbnailUrl} 
                alt={`${title} trailer`} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            </div>
          ) : (
            <div className="aspect-video w-full bg-muted flex items-center justify-center">
              <Play className="h-12 w-12 text-primary" />
            </div>
          )}
          
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 group-hover:bg-black/70 transition-colors">
            <Button variant="ghost" size="icon" className="h-16 w-16 rounded-full bg-primary/90 text-primary-foreground hover:bg-primary">
              <Play className="h-8 w-8" />
            </Button>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white font-medium">{title} - Official Trailer</p>
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[900px] p-0 bg-black border-none">
        <DialogHeader className="p-4 absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent">
          <DialogTitle className="text-white">{title} - Official Trailer</DialogTitle>
        </DialogHeader>
        
        <div className="relative pt-[56.25%] w-full">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 z-50 rounded-full bg-black/50 hover:bg-black/70 text-white"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {isLoading && isOpen && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {isOpen && !hasError && (
            <iframe
              ref={iframeRef}
              className="absolute top-0 left-0 w-full h-full"
              src={embedUrl}
              title={`${title} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onError={handleIframeError}
              onLoad={handleIframeLoad}
              loading="lazy"
            ></iframe>
          )}
          
          {hasError && (
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black/90 text-white">
              <AlertCircle className="h-12 w-12 mb-4 text-red-500" />
              <p className="text-lg font-medium">Failed to load trailer</p>
              <p className="text-sm text-gray-400 mt-2">Please try again later or watch on YouTube</p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => window.open(trailerUrl, '_blank')}
              >
                Open on YouTube
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default memo(TrailerPlayer); 