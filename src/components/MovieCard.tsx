import { useState, useEffect, memo, useCallback } from 'react';
import { Movie } from '../types/movie';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Star, Bookmark, BookmarkCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { isInWatchlist, toggleWatchlist } from '../utils/watchlistUtils';
import { useToast } from '@/components/ui/use-toast';

interface MovieCardProps {
  movie: Movie;
  featured?: boolean;
}

const MovieCard = ({ movie, featured = false }: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const { toast } = useToast();

  // Check watchlist status only once on mount
  useEffect(() => {
    setInWatchlist(isInWatchlist(movie.id));
  }, [movie.id]);

  const handleWatchlistToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const added = toggleWatchlist(movie.id);
    setInWatchlist(!inWatchlist);
    
    toast({
      title: added ? "Added to watchlist" : "Removed from watchlist",
      description: `${movie.title} has been ${added ? 'added to' : 'removed from'} your watchlist`,
      duration: 3000,
    });
    
    // Trigger an event for the header to update the watchlist count
    window.dispatchEvent(new Event('storage'));
  }, [movie.id, movie.title, inWatchlist, toast]);

  if (featured) {
    return (
      <div className="relative h-[400px] w-full overflow-hidden rounded-lg">
        <img 
          src={movie.backdropPath} 
          alt={movie.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-0 left-0 p-6">
          <h2 className="text-3xl font-bold mb-2">{movie.title}</h2>
          <div className="flex items-center mb-4">
            <div className="flex items-center bg-background/60 backdrop-blur-sm px-2 py-1 rounded-md mr-2">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
              <span className="text-sm font-medium">{movie.voteAverage.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground text-sm bg-background/60 backdrop-blur-sm px-2 py-1 rounded-md">
              {movie.releaseDate.substring(0, 4)} • {movie.genres.slice(0, 2).join(', ')}
            </span>
          </div>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 bg-background/60 backdrop-blur-sm p-2 rounded-md">{movie.overview}</p>
          <Link to={`/movie/${movie.id}`} className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold transition-colors inline-flex items-center">
            View Details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Link to={`/movie/${movie.id}`}>
      <Card className="overflow-hidden group relative border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <img 
            src={movie.posterPath} 
            alt={movie.title}
            className={`w-full h-full object-cover transition-all duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-105`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
            decoding="async"
          />
          
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Watchlist button */}
          <button
            className="absolute top-2 right-2 p-1.5 rounded-full bg-background/70 backdrop-blur-sm hover:bg-background/90 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
            onClick={handleWatchlistToggle}
            aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
          >
            {inWatchlist ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>
          
          {/* Rating badge */}
          <div className="absolute bottom-2 left-2 flex items-center bg-background/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-0.5" />
            <span className="font-medium">{movie.voteAverage.toFixed(1)}</span>
          </div>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <div className="p-3 relative">
          <h3 className="font-semibold text-sm truncate">{movie.title}</h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">{movie.releaseDate.substring(0, 4)}</span>
            {movie.genres[0] && (
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-primary/5 hover:bg-primary/10">
                {movie.genres[0]}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(MovieCard, (prevProps, nextProps) => {
  // Only re-render if the movie ID changes
  return prevProps.movie.id === nextProps.movie.id && prevProps.featured === nextProps.featured;
});
