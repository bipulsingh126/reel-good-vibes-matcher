
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import MovieCard from '../components/MovieCard';
import { getMoviesByCategory } from '../services/movieService';
import { Movie, MovieCategory, MovieFilter } from '../types/movie';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

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

// Available years for filtering (2000-2023)
const availableYears = Array.from({ length: 24 }, (_, i) => 2000 + i);

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
        {searchResults.length > 0 ? (
          <>
            <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-primary to-purple-400 text-transparent bg-clip-text">
              Search Results
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {searchResults.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-400 text-transparent bg-clip-text">
              Movie Categories
            </h2>
            
            {/* Filter panel */}
            <div className="bg-card rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Filter Movies</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Genre</label>
                  <Select
                    value={activeFilters.genre || ''}
                    onValueChange={(value) => 
                      setActiveFilters(prev => ({ ...prev, genre: value || undefined }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Genres</SelectItem>
                      <SelectItem value="action">Action</SelectItem>
                      <SelectItem value="adventure">Adventure</SelectItem>
                      <SelectItem value="comedy">Comedy</SelectItem>
                      <SelectItem value="drama">Drama</SelectItem>
                      <SelectItem value="horror">Horror</SelectItem>
                      <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                      <SelectItem value="thriller">Thriller</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Release Year</label>
                  <Select
                    value={activeFilters.year?.toString() || ''}
                    onValueChange={(value) => 
                      setActiveFilters(prev => ({ ...prev, year: value ? parseInt(value) : undefined }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Years</SelectItem>
                      {availableYears.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Min Rating: {activeFilters.rating || 0}
                  </label>
                  <Slider
                    defaultValue={[0]}
                    max={10}
                    step={1}
                    value={[activeFilters.rating || 0]}
                    onValueChange={(values) => 
                      setActiveFilters(prev => ({ ...prev, rating: values[0] || undefined }))
                    }
                  />
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Sort By</label>
                  <div className="flex gap-2">
                    <Select
                      value={activeFilters.sortBy || ''}
                      onValueChange={(value: string) => 
                        setActiveFilters(prev => ({ ...prev, sortBy: value as 'title' | 'releaseDate' | 'voteAverage' | undefined }))
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Default</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="releaseDate">Release Date</SelectItem>
                        <SelectItem value="voteAverage">Rating</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={activeFilters.sortOrder || 'asc'}
                      onValueChange={(value: string) => 
                        setActiveFilters(prev => ({ ...prev, sortOrder: value as 'asc' | 'desc' }))
                      }
                      disabled={!activeFilters.sortBy}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Asc</SelectItem>
                        <SelectItem value="desc">Desc</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={resetFilters} className="mr-2">
                  Reset Filters
                </Button>
              </div>
            </div>
            
            <Tabs 
              defaultValue="action" 
              value={activeCategory}
              onValueChange={handleCategoryChange}
              className="w-full"
            >
              <TabsList className="mb-8 w-full justify-start overflow-x-auto space-x-2">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category} className="px-4 py-2">
                    {categoryLabels[category]}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {categories.map((category) => (
                <TabsContent key={category} value={category}>
                  {filteredMovies[category]?.length === 0 ? (
                    <div className="text-center py-20">
                      <h2 className="text-xl font-semibold mb-4">No movies found</h2>
                      <p className="text-muted-foreground mb-6">
                        Try adjusting your filters to see more results
                      </p>
                      <Button variant="outline" onClick={resetFilters}>
                        Reset Filters
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                      {(filteredMovies[category] || []).map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                      ))}
                    </div>
                  )}
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
