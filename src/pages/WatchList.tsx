import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { Movie } from '../types/movie';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getMovieById } from '../services/movieService';
import { 
  Bookmark, 
  Clock, 
  Play, 
  Star, 
  Trash2, 
  SlidersHorizontal, 
  ChevronDown,
  ChevronRight,
  Filter 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { getWatchlist, removeFromWatchlist } from '../utils/watchlistUtils';

type SortOption = 'title' | 'releaseDate' | 'voteAverage';
type SortOrder = 'asc' | 'desc';
type FilterGenre = string | 'all';

const WatchList = () => {
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterGenre, setFilterGenre] = useState<FilterGenre>('all');
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const { toast } = useToast();

  const loadWatchlist = () => {
    try {
      // Use the watchlistUtils function to get the watchlist
      const watchlistIds = getWatchlist();
      const movies = watchlistIds.map(id => getMovieById(id)).filter(Boolean) as Movie[];
      setWatchlistMovies(movies);
      
      // Extract all unique genres from the watchlist movies
      const genres = new Set<string>();
      movies.forEach(movie => {
        movie.genres.forEach(genre => genres.add(genre));
      });
      
      setAvailableGenres(Array.from(genres).sort());
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to load your watchlist",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
    
    // Set up event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'watchlist' || e.key === 'usersData') {
        loadWatchlist();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for watchlist changes within the app
    const handleWatchlistChange = () => {
      loadWatchlist();
    };
    
    window.addEventListener('watchlist-changed', handleWatchlistChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('watchlist-changed', handleWatchlistChange);
    };
  }, [toast]);

  const handleRemoveFromWatchlist = (movieId: number) => {
    try {
      // Use the watchlistUtils function to remove from watchlist
      removeFromWatchlist(movieId);
      
      // Update the UI
      setWatchlistMovies(watchlistMovies.filter(movie => movie.id !== movieId));
      
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('watchlist-changed'));
      
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
  
  const handleWatchMovie = (movie: Movie) => {
    if (movie.streamingUrls && movie.streamingUrls.length > 0) {
      // Open the first available streaming option
      window.open(movie.streamingUrls[0].url, '_blank');
      toast({
        title: `Opening ${movie.streamingUrls[0].provider}`,
        description: "Redirecting to streaming service...",
      });
    } else if (movie.trailerUrl) {
      // If no streaming options but trailer is available, open the trailer
      window.open(movie.trailerUrl, '_blank');
      toast({
        title: "Opening trailer",
        description: "No streaming options found. Opening trailer instead.",
      });
    } else {
      toast({
        title: "Not available",
        description: "This movie is not currently available for streaming.",
        variant: "destructive"
      });
    }
  };
  
  // Sort and filter movies
  const getSortedAndFilteredMovies = () => {
    let filteredMovies = [...watchlistMovies];
    
    // Apply genre filter if not 'all'
    if (filterGenre !== 'all') {
      filteredMovies = filteredMovies.filter(movie => 
        movie.genres.includes(filterGenre)
      );
    }
    
    // Apply sorting
    return filteredMovies.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'releaseDate':
          comparison = new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
          break;
        case 'voteAverage':
          comparison = a.voteAverage - b.voteAverage;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };
  
  const sortedAndFilteredMovies = getSortedAndFilteredMovies();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 text-transparent bg-clip-text">
            My Watchlist
          </h1>
          
          {watchlistMovies.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {/* Genre Filter */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-9 px-3 flex items-center gap-1">
                  <Filter className="h-4 w-4" /> 
                  <span>Genre:</span>
                </Badge>
                <Select value={filterGenre} onValueChange={(value) => setFilterGenre(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Genres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genres</SelectItem>
                    {availableGenres.map(genre => (
                      <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Sort Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Sort
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className={sortBy === 'title' ? 'bg-accent' : ''}
                    onClick={() => setSortBy('title')}
                  >
                    Title
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={sortBy === 'releaseDate' ? 'bg-accent' : ''}
                    onClick={() => setSortBy('releaseDate')}
                  >
                    Release Date
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={sortBy === 'voteAverage' ? 'bg-accent' : ''}
                    onClick={() => setSortBy('voteAverage')}
                  >
                    Rating
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Order</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className={sortOrder === 'asc' ? 'bg-accent' : ''}
                    onClick={() => setSortOrder('asc')}
                  >
                    Ascending
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={sortOrder === 'desc' ? 'bg-accent' : ''}
                    onClick={() => setSortOrder('desc')}
                  >
                    Descending
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : watchlistMovies.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bookmark className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Your watchlist is empty</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Browse movies and add them to your watchlist to keep track of what you want to watch.
            </p>
            <Button asChild>
              <Link to="/" className="bg-primary hover:bg-primary/90 text-white">
                Browse Movies
              </Link>
            </Button>
          </div>
        ) : sortedAndFilteredMovies.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-medium mb-2">No movies match your filter</h2>
            <p className="text-muted-foreground mb-4">
              Try changing your genre filter to see more movies.
            </p>
            <Button variant="outline" onClick={() => setFilterGenre('all')}>
              Show All Movies
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAndFilteredMovies.map((movie) => (
              <Card key={movie.id} className="overflow-hidden bg-card hover:shadow-lg transition-shadow">
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img 
                    src={movie.backdropPath || movie.posterPath} 
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white text-xl font-bold line-clamp-1">{movie.title}</h3>
                    <div className="flex items-center gap-3 text-white/80 text-sm mt-1">
                      <span>{movie.releaseDate.substring(0, 4)}</span>
                      {movie.runtime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span>{movie.voteAverage.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <CardContent className="pt-4">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {movie.genres.slice(0, 3).map(genre => (
                      <Badge key={genre} variant="secondary" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                    {movie.genres.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{movie.genres.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {movie.overview}
                  </p>
                  
                  {movie.streamingUrls && movie.streamingUrls.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {movie.streamingUrls.slice(0, 2).map((option, index) => (
                        <Badge key={index} variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          {option.provider}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="pt-0 flex gap-2">
                  <Button 
                    variant="default" 
                    className="flex-1 gap-1"
                    onClick={() => handleWatchMovie(movie)}
                  >
                    <Play className="h-4 w-4" /> Watch
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleRemoveFromWatchlist(movie.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="icon"
                    asChild
                  >
                    <Link to={`/movie/${movie.id}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <footer className="bg-background border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Movie Recommendation System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default WatchList;
