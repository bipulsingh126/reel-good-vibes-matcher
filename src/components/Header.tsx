
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Film, Bookmark } from 'lucide-react';
import SearchBar from './SearchBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getWatchlistCount } from '../utils/watchlistUtils';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [watchlistCount, setWatchlistCount] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Load watchlist count
    setWatchlistCount(getWatchlistCount());
    
    // Listen for watchlist changes
    const watchlistListener = () => {
      setWatchlistCount(getWatchlistCount());
    };
    
    window.addEventListener('storage', watchlistListener);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', watchlistListener);
    };
  }, []);

  // Refresh watchlist count when component is mounted or focused
  useEffect(() => {
    const handleFocus = () => {
      setWatchlistCount(getWatchlistCount());
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${isScrolled ? 'bg-background/95 backdrop-blur-sm shadow-md py-2' : 'bg-transparent py-4'}`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Film className="h-6 w-6 text-movie-accent" />
          <span className="font-bold text-xl">MovieMingle</span>
        </Link>
        
        <div className="hidden md:block">
          <SearchBar />
        </div>
        
        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-sm font-medium hover:text-movie-accent transition-colors">
              Home
            </Link>
            <Link to="/trending" className="text-sm font-medium hover:text-movie-accent transition-colors">
              Trending
            </Link>
            <Link to="/categories" className="text-sm font-medium hover:text-movie-accent transition-colors">
              Categories
            </Link>
            <Link to="/watchlist" className="text-sm font-medium hover:text-movie-accent transition-colors flex items-center">
              <span>Watchlist</span>
              {watchlistCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-primary text-white">
                  {watchlistCount}
                </Badge>
              )}
            </Link>
          </nav>
          
          <Link to="/watchlist" className="md:hidden relative">
            <Bookmark className="h-6 w-6" />
            {watchlistCount > 0 && (
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 bg-primary text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center p-0 rounded-full"
              >
                {watchlistCount}
              </Badge>
            )}
          </Link>
          
          <Button className="bg-movie-accent hover:bg-movie-accent-hover">
            Sign In
          </Button>
        </div>
      </div>
      
      <div className="md:hidden mt-2 px-4">
        <SearchBar />
      </div>
    </header>
  );
};

export default Header;
