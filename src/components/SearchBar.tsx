
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { searchMovies } from '../services/movieService';
import { Movie } from '../types/movie';
import { Link } from 'react-router-dom';

interface SearchBarProps {
  onSearchResults?: (results: Movie[]) => void;
}

const SearchBar = ({ onSearchResults }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    if (query.trim().length > 2) {
      const searchResults = searchMovies(query);
      setResults(searchResults);
      if (onSearchResults) {
        onSearchResults(searchResults);
      }
      setIsOpen(true);
    } else {
      setResults([]);
      if (onSearchResults) {
        onSearchResults([]);
      }
      setIsOpen(false);
    }
  }, [query, onSearchResults]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    if (onSearchResults) {
      onSearchResults([]);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-secondary/50 border-0 pl-10 pr-10 py-6 w-full rounded-full"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-background border border-border rounded-lg shadow-lg z-50 max-h-[60vh] overflow-y-auto">
          {results.map((movie) => (
            <Link
              key={movie.id}
              to={`/movie/${movie.id}`}
              className="flex items-center p-3 hover:bg-secondary/20 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <img
                src={movie.posterPath}
                alt={movie.title}
                className="w-10 h-14 object-cover rounded mr-3"
              />
              <div>
                <h4 className="font-medium text-sm">{movie.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {movie.releaseDate.substring(0, 4)} • {movie.genres.slice(0, 2).join(', ')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
