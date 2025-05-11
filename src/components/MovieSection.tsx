
import { useState } from 'react';
import { MovieCategory } from '../types/movie';
import { getMoviesByCategory } from '../services/movieService';
import MovieCard from './MovieCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MovieSectionProps {
  title: string;
  category: MovieCategory;
}

const MovieSection = ({ title, category }: MovieSectionProps) => {
  const movies = getMoviesByCategory(category);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById(`scroll-container-${category}`);
    if (container) {
      const scrollAmount = 300;
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
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon"
            className="rounded-full"
            onClick={() => handleScroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className="rounded-full"
            onClick={() => handleScroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div 
        id={`scroll-container-${category}`}
        className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
      >
        {movies.map((movie) => (
          <div key={movie.id} className="flex-shrink-0 w-[180px]">
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieSection;
