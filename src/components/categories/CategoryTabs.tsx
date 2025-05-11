
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Movie, MovieCategory } from '@/types/movie';
import { Button } from '@/components/ui/button';
import MovieGrid from './MovieGrid';

interface CategoryLabels {
  [key: string]: string;
}

interface CategoryTabsProps {
  categories: MovieCategory[];
  activeCategory: MovieCategory;
  handleCategoryChange: (category: string) => void;
  filteredMovies: Record<MovieCategory, Movie[]>;
  categoryLabels: CategoryLabels;
  resetFilters: () => void;
}

const CategoryTabs = ({ 
  categories, 
  activeCategory, 
  handleCategoryChange, 
  filteredMovies, 
  categoryLabels,
  resetFilters 
}: CategoryTabsProps) => {
  return (
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
            <MovieGrid movies={filteredMovies[category] || []} />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default CategoryTabs;
