import { useState } from 'react';
import Header from '../components/Header';
import MovieCard from '../components/MovieCard';
import { getMoviesByCategory } from '../services/movieService';
import { Movie } from '../types/movie';

const Trending = () => {
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const trendingMovies = getMoviesByCategory('trending');
  
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 pt-32 pb-16">
        {searchResults.length > 0 ? (
          <>
            <h2 className="text-2xl font-semibold mb-6">Search Results</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {searchResults.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-6">Trending Movies</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {trendingMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </>
        )}
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

export default Trending;
