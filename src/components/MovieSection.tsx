import { useState, useRef, useEffect } from 'react';
import { MovieCategory } from '../types/movie';
import { getMoviesByCategory } from '../services/movieService';
import MovieCard from './MovieCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface MovieSectionProps {
  title: string;
  category: MovieCategory;
}

const MovieSection = ({ title, category }: MovieSectionProps) => {
  const movies = getMoviesByCategory(category);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const checkButtons = () => {
      if (!containerRef.current) return;
      
      setShowLeftButton(scrollPosition > 0);
      setShowRightButton(
        containerRef.current.scrollWidth - containerRef.current.clientWidth > scrollPosition
      );
    };
    
    checkButtons();
    window.addEventListener('resize', checkButtons);
    
    return () => {
      window.removeEventListener('resize', checkButtons);
    };
  }, [scrollPosition]);
  
  const handleScroll = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.75;
      const newPosition = direction === 'left' 
        ? Math.max(scrollPosition - scrollAmount, 0)
        : Math.min(scrollPosition + scrollAmount, container.scrollWidth - container.clientWidth);
      
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      
      setScrollPosition(newPosition);
    }
  };

  return (
    <div className="mb-12 relative group">
      <div className="flex items-center justify-between mb-6">
        <motion.h2 
          className="text-2xl font-semibold flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-1 h-6 bg-primary rounded-full mr-3"></div>
          {title}
        </motion.h2>
      </div>
      
      <div className="relative">
        {/* Navigation buttons */}
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 transition-opacity duration-300 ${
          showLeftButton ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <Button 
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg bg-background/80 backdrop-blur-sm border border-border/50"
            onClick={() => handleScroll('left')}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
        
        <div className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 transition-opacity duration-300 ${
          showRightButton ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <Button 
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg bg-background/80 backdrop-blur-sm border border-border/50"
            onClick={() => handleScroll('right')}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Movies container */}
        <div 
          ref={containerRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
          onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
        >
          {movies.map((movie, index) => (
            <motion.div 
              key={movie.id} 
              className="flex-shrink-0 w-[180px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <MovieCard movie={movie} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieSection;
