import { useState, useEffect } from 'react';
import { Movie } from '../types/movie';
import { getMoviesByCategory } from '../services/movieService';
import MovieCard from './MovieCard';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

type Genre = 'action' | 'comedy' | 'drama' | 'horror' | 'sciFi';

const PersonalRecommendations = () => {
  const [preferences, setPreferences] = useState<Genre[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  // Load user preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('moviePreferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    } else {
      // Default preferences if none are saved
      const defaultPreferences: Genre[] = ['action', 'sciFi'];
      setPreferences(defaultPreferences);
      localStorage.setItem('moviePreferences', JSON.stringify(defaultPreferences));
    }
  }, []);

  // Generate recommendations based on preferences
  useEffect(() => {
    if (preferences.length === 0) return;
    
    generateRecommendations();
  }, [preferences]);

  const generateRecommendations = () => {
    setLoading(true);
    
    // Get movies from each preferred genre
    const allMovies: Movie[] = [];
    preferences.forEach(genre => {
      const moviesFromGenre = getMoviesByCategory(genre);
      allMovies.push(...moviesFromGenre);
    });
    
    // Remove duplicates
    const uniqueMovies = allMovies.filter((movie, index, self) =>
      index === self.findIndex((m) => m.id === movie.id)
    );
    
    // Sort by vote average and randomize a bit
    const sortedMovies = uniqueMovies
      .sort((a, b) => b.voteAverage - a.voteAverage)
      .sort(() => Math.random() > 0.7 ? 1 : -1);
    
    // Take top 6 movies
    setRecommendations(sortedMovies.slice(0, 6));
    setLoading(false);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">For You</h2>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={generateRecommendations}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {preferences.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {preferences.map(pref => (
            <span key={pref} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              {pref.charAt(0).toUpperCase() + pref.slice(1)}
            </span>
          ))}
        </div>
      )}
      
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-lg bg-muted animate-pulse"></div>
          ))}
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {recommendations.map((movie) => (
            <motion.div key={movie.id} variants={item}>
              <MovieCard movie={movie} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default PersonalRecommendations; 