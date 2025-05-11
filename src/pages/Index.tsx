
import { useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import MovieSection from '../components/MovieSection';
import { Movie } from '../types/movie';
import MovieCard from '../components/MovieCard';

const Index = () => {
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  
  return (
    <div className="min-h-screen">
      <Header />
      
      {searchResults.length > 0 ? (
        <div className="container mx-auto px-4 pt-32 pb-16">
          <h2 className="text-2xl font-semibold mb-6">Search Results</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {searchResults.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      ) : (
        <>
          <Hero />
          
          <div className="container mx-auto px-4 py-16">
            <MovieSection title="Trending Now" category="trending" />
            <MovieSection title="Top Rated" category="topRated" />
            <MovieSection title="Action Movies" category="action" />
            <MovieSection title="Drama" category="drama" />
            <MovieSection title="Sci-Fi" category="sciFi" />
            <MovieSection title="Comedy" category="comedy" />
          </div>
        </>
      )}
      
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

export default Index;
