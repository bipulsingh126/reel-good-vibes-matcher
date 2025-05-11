import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieById, getRecommendedMovies } from '../services/movieService';
import Header from '../components/Header';
import { Movie } from '../types/movie';
import MovieCard from '../components/MovieCard';
import MovieRating from '../components/MovieRating';
import StreamingOptions from '../components/StreamingOptions';
import TrailerPlayer from '../components/TrailerPlayer';
import PurchaseOptions from '../components/PurchaseOptions';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Clock, Play, Star, Bookmark, BookmarkCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { isInWatchlist, addToWatchlist, removeFromWatchlist } from '../utils/watchlistUtils';

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [recommended, setRecommended] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (id) {
      const movieId = parseInt(id, 10);
      const foundMovie = getMovieById(movieId);
      
      if (foundMovie) {
        setMovie(foundMovie);
        setRecommended(getRecommendedMovies(movieId));
        setInWatchlist(isInWatchlist(movieId));
      }
      
      setLoading(false);
    }
  }, [id]);

  const handlePlayMovie = () => {
    if (movie?.streamingUrls && movie.streamingUrls.length > 0) {
      // Open the first available streaming option
      window.open(movie.streamingUrls[0].url, '_blank');
      toast({
        title: `Opening ${movie.streamingUrls[0].provider}`,
        description: "Redirecting to streaming service...",
        duration: 3000,
      });
    } else {
      toast({
        title: "Streaming Not Available",
        description: "This movie is not currently available for streaming.",
        duration: 3000,
      });
    }
  };
  
  const handleWatchlistToggle = () => {
    if (!movie) return;
    
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
      setInWatchlist(false);
      toast({
        title: "Removed from watchlist",
        description: `${movie.title} has been removed from your watchlist`,
      });
    } else {
      addToWatchlist(movie.id);
      setInWatchlist(true);
      toast({
        title: "Added to watchlist",
        description: `${movie.title} has been added to your watchlist`,
      });
    }
    
    // Trigger an event for the header to update the watchlist count
    window.dispatchEvent(new Event('storage'));
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Movie not found</h1>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }
  
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <div className="relative min-h-[70vh]">
        {/* Background Image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={movie.backdropPath}
            alt={movie.title}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${
              imageLoaded ? 'opacity-40' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-24 left-4 z-10">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-1 bg-background/50 backdrop-blur-sm hover:bg-background/70">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 pt-32 pb-16 relative flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Movie Poster */}
          <motion.div 
            className="w-64 h-96 shrink-0 overflow-hidden rounded-lg shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img 
              src={movie.posterPath}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          {/* Movie Details */}
          <motion.div 
            className="max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Badge className="mb-2 bg-primary/20 text-primary border-primary/30 backdrop-blur-sm">
              {movie.genres[0]}
            </Badge>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{movie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-1 bg-background/40 backdrop-blur-sm px-2 py-1 rounded-md">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{movie.voteAverage.toFixed(1)}</span>
              </div>
              
              <span className="text-muted-foreground bg-background/40 backdrop-blur-sm px-2 py-1 rounded-md">
                {movie.releaseDate.substring(0, 4)}
              </span>
              
              {movie.runtime && (
                <span className="flex items-center gap-1 text-muted-foreground bg-background/40 backdrop-blur-sm px-2 py-1 rounded-md">
                  <Clock className="h-4 w-4" /> {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres.map(genre => (
                <Badge 
                  key={genre} 
                  variant="outline"
                  className="bg-background/40 backdrop-blur-sm"
                >
                  {genre}
                </Badge>
              ))}
            </div>
            
            <p className="text-lg mb-6 bg-background/40 backdrop-blur-sm p-4 rounded-lg border border-border/50">
              {movie.overview}
            </p>
            
            <div className="space-y-2 mb-6">
              {movie.director && (
                <p className="flex gap-2">
                  <span className="text-muted-foreground min-w-[80px]">Director:</span> 
                  <span className="font-medium">{movie.director}</span>
                </p>
              )}
              
              {movie.cast && movie.cast.length > 0 && (
                <p className="flex gap-2">
                  <span className="text-muted-foreground min-w-[80px]">Cast:</span> 
                  <span>{movie.cast.join(', ')}</span>
                </p>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button onClick={handlePlayMovie} className="bg-primary hover:bg-primary/90 gap-2 rounded-full px-6">
                <Play className="h-5 w-5" /> Watch Now
              </Button>
              
              <Button 
                variant="outline" 
                className={`gap-2 rounded-full px-6 ${
                  inWatchlist 
                    ? 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/30' 
                    : 'bg-background/40 backdrop-blur-sm hover:bg-background/60'
                }`}
                onClick={handleWatchlistToggle}
              >
                {inWatchlist ? (
                  <>
                    <BookmarkCheck className="h-5 w-5" /> In Watchlist
                  </>
                ) : (
                  <>
                    <Bookmark className="h-5 w-5" /> Add to Watchlist
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Tabs Section */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="streaming" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="streaming">Watch</TabsTrigger>
            <TabsTrigger value="ratings">Ratings & Reviews</TabsTrigger>
            <TabsTrigger value="similar">Similar Movies</TabsTrigger>
          </TabsList>
          
          <TabsContent value="streaming" className="mt-6">
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <StreamingOptions 
                  streamingUrls={movie.streamingUrls} 
                  trailerUrl={movie.trailerUrl} 
                />
                
                {movie.isPremium && (
                  <div className="mt-6">
                    <PurchaseOptions 
                      movie={movie} 
                      onComplete={() => setMovie({...movie})}
                    />
                  </div>
                )}
              </div>
              
              {movie.trailerUrl && (
                <div>
                  <TrailerPlayer 
                    trailerUrl={movie.trailerUrl} 
                    thumbnailUrl={movie.backdropPath} 
                    title={movie.title} 
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="ratings" className="mt-6">
            <div className="max-w-3xl mx-auto">
              <MovieRating movieId={movie.id} />
            </div>
          </TabsContent>
          
          <TabsContent value="similar" className="mt-6">
            {recommended.length > 0 ? (
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {recommended.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </motion.div>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                No similar movies found.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <footer className="bg-background border-t border-border py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Movie Recommendation System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MovieDetail;
