
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { getMoviesByCategory } from '../services/movieService';
import { Movie, MovieCategory, MovieFilter } from '../types/movie';
import FilterPanel from '../components/categories/FilterPanel';
import CategoryTabs from '../components/categories/CategoryTabs';
import SearchResults from '../components/categories/SearchResults';

const categoryLabels: Record<MovieCategory, string> = {
  trending: 'Trending',
  topRated: 'Top Rated',
  action: 'Action',
  comedy: 'Comedy',
  drama: 'Drama',
  horror: 'Horror',
  sciFi: 'Sci-Fi',
  recommended: 'Recommended',
  premium: 'Premium'
};

const Categories = () => {
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Record<MovieCategory, Movie[]>>({} as Record<MovieCategory, Movie[]>);
  const [activeFilters, setActiveFilters] = useState<MovieFilter>({});
  const categories: MovieCategory[] = ['action', 'comedy', 'drama', 'horror', 'sciFi', 'topRated'];
  const [activeCategory, setActiveCategory] = useState<MovieCategory>('action');
  
  // Initialize movie data
  useEffect(() => {
    const initialMovies: Record<MovieCategory, Movie[]> = {} as Record<MovieCategory, Movie[]>;
    categories.forEach(category => {
      initialMovies[category] = getMoviesByCategory(category);
    });
    setFilteredMovies(initialMovies);
  }, []);
  
  const applyFilters = (category: MovieCategory) => {
    let movies = getMoviesByCategory(category);
    
    // Apply genre filter
    if (activeFilters.genre) {
      movies = movies.filter(movie => 
        movie.genres.some(g => g.toLowerCase() === activeFilters.genre?.toLowerCase())
      );
    }
    
    // Apply year filter
    if (activeFilters.year) {
      movies = movies.filter(movie => {
        const movieYear = new Date(movie.releaseDate).getFullYear();
        return movieYear === activeFilters.year;
      });
    }
    
    // Apply rating filter
    if (activeFilters.rating) {
      movies = movies.filter(movie => 
        Math.floor(movie.voteAverage) >= activeFilters.rating!
      );
    }
    
    // Apply sorting
    if (activeFilters.sortBy) {
      movies.sort((a, b) => {
        const sortOrder = activeFilters.sortOrder === 'desc' ? -1 : 1;
        
        switch (activeFilters.sortBy) {
          case 'title':
            return sortOrder * a.title.localeCompare(b.title);
          case 'releaseDate':
            return sortOrder * (new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
          case 'voteAverage':
            return sortOrder * (a.voteAverage - b.voteAverage);
          default:
            return 0;
        }
      });
    }
    
    setFilteredMovies(prev => ({ ...prev, [category]: movies }));
  };
  
  // Apply filters when category or filters change
  useEffect(() => {
    if (activeCategory) {
      applyFilters(activeCategory);
    }
  }, [activeCategory, activeFilters]);
  
  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category as MovieCategory);
  };
  
  const resetFilters = () => {
    setActiveFilters({});
  };
  
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 pt-32 pb-16">
        <SearchResults searchResults={searchResults} />
        
        {searchResults.length === 0 && (
          <>
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-400 text-transparent bg-clip-text">
              Movie Categories
            </h2>
            
            <FilterPanel 
              activeFilters={activeFilters}
              setActiveFilters={setActiveFilters}
              resetFilters={resetFilters}
            />
            
            <CategoryTabs 
              categories={categories}
              activeCategory={activeCategory}
              handleCategoryChange={handleCategoryChange}
              filteredMovies={filteredMovies}
              categoryLabels={categoryLabels}
              resetFilters={resetFilters}
            />
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

export default Categories;
