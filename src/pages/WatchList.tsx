
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import MovieCard from '../components/MovieCard';
import { Movie } from '../types/movie';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { getMovieById } from '../services/movieService';

const WatchList = () => {
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load watchlist from localStorage
    const loadWatchlist = () => {
      try {
        const savedWatchlist = localStorage.getItem('watchlist');
        if (savedWatchlist) {
          const watchlistIds = JSON.parse(savedWatchlist) as number[];
          const movies = watchlistIds.map(id => getMovieById(id)).filter(Boolean) as Movie[];
          setWatchlistMovies(movies);
        }
      } catch (error) {
        console.error('Failed to load watchlist:', error);
        toast({
          title: "Error",
          description: "Failed to load your watchlist",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadWatchlist();
  }, []);

  const removeFromWatchlist = (movieId: number) => {
    try {
      // Get current watchlist
      const savedWatchlist = localStorage.getItem('watchlist');
      let watchlistIds: number[] = [];
      
      if (savedWatchlist) {
        watchlistIds = JSON.parse(savedWatchlist);
      }

      // Remove the movie ID
      const updatedWatchlist = watchlistIds.filter(id => id !== movieId);
      
      // Save the updated watchlist
      localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
      
      // Update state
      setWatchlistMovies(watchlistMovies.filter(movie => movie.id !== movieId));
      
      toast({
        title: "Removed from watchlist",
        description: "Movie has been removed from your watchlist"
      });
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove movie from watchlist",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 text-transparent bg-clip-text">
            My Watchlist
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-slate-700 h-10 w-10"></div>
              <div className="flex-1 space-y-6 py-1">
                <div className="h-2 bg-slate-700 rounded"></div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-2 bg-slate-700 rounded col-span-2"></div>
                    <div className="h-2 bg-slate-700 rounded col-span-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : watchlistMovies.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4">Your watchlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Browse movies and add them to your watchlist to keep track of what you want to watch.
            </p>
            <Button asChild>
              <Link to="/" className="bg-primary hover:bg-primary/90 text-white">
                Browse Movies
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {watchlistMovies.map((movie) => (
                <div key={movie.id} className="relative group">
                  <MovieCard movie={movie} />
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeFromWatchlist(movie.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <footer className="bg-movie-dark py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-movie-muted text-sm">
            © {new Date().getFullYear()} MovieMingle. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default WatchList;
