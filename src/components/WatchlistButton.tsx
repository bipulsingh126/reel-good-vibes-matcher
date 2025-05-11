
import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '../utils/watchlistUtils';

interface WatchlistButtonProps {
  movieId: number;
  movieTitle: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const WatchlistButton = ({ 
  movieId, 
  movieTitle,
  variant = 'outline',
  size = 'default',
  className = ''
}: WatchlistButtonProps) => {
  const [inWatchlist, setInWatchlist] = useState(false);
  
  // Check if movie is in watchlist on mount
  useEffect(() => {
    setInWatchlist(isInWatchlist(movieId));
    
    // Listen for storage events to update button state
    const handleStorageChange = () => {
      setInWatchlist(isInWatchlist(movieId));
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [movieId]);
  
  const handleWatchlistClick = () => {
    if (inWatchlist) {
      const success = removeFromWatchlist(movieId);
      if (success) {
        setInWatchlist(false);
        toast({
          title: "Removed from watchlist",
          description: `${movieTitle} has been removed from your watchlist`
        });
        
        // Trigger storage event for other components
        window.dispatchEvent(new Event('storage'));
      } else {
        toast({
          title: "Error",
          description: "Failed to remove movie from watchlist",
          variant: "destructive"
        });
      }
    } else {
      const success = addToWatchlist(movieId);
      if (success) {
        setInWatchlist(true);
        toast({
          title: "Added to watchlist",
          description: `${movieTitle} has been added to your watchlist`
        });
        
        // Trigger storage event for other components
        window.dispatchEvent(new Event('storage'));
      } else {
        toast({
          title: "Error",
          description: "Failed to add movie to watchlist",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleWatchlistClick}
      className={className}
    >
      {inWatchlist ? (
        <>
          <BookmarkCheck className="mr-2 h-4 w-4" />
          <span>In Watchlist</span>
        </>
      ) : (
        <>
          <Bookmark className="mr-2 h-4 w-4" />
          <span>Add to Watchlist</span>
        </>
      )}
    </Button>
  );
};

export default WatchlistButton;
