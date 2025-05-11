
import { useState } from 'react';
import Header from '../components/Header';
import MovieCard from '../components/MovieCard';
import { getMoviesByCategory } from '../services/movieService';
import { Movie, MovieCategory } from '../types/movie';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const categoryLabels: Record<MovieCategory, string> = {
  trending: 'Trending',
  topRated: 'Top Rated',
  action: 'Action',
  comedy: 'Comedy',
  drama: 'Drama',
  horror: 'Horror',
  sciFi: 'Sci-Fi',
  recommended: 'Recommended'
};

const Categories = () => {
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const categories: MovieCategory[] = ['action', 'comedy', 'drama', 'horror', 'sciFi', 'topRated'];
  
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
            <h2 className="text-2xl font-semibold mb-6">Movie Categories</h2>
            <Tabs defaultValue="action" className="w-full">
              <TabsList className="mb-8 w-full justify-start overflow-x-auto space-x-2">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category} className="px-4 py-2">
                    {categoryLabels[category]}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {categories.map((category) => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {getMoviesByCategory(category).map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
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

export default Categories;
