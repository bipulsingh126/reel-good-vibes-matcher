
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';
import SearchBar from './SearchBar';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
          </nav>
          
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
