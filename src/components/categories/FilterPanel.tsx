
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { MovieFilter } from '@/types/movie';

// Available years for filtering (2000-2023)
const availableYears = Array.from({ length: 24 }, (_, i) => 2000 + i);

interface FilterPanelProps {
  activeFilters: MovieFilter;
  setActiveFilters: React.Dispatch<React.SetStateAction<MovieFilter>>;
  resetFilters: () => void;
}

const FilterPanel = ({ activeFilters, setActiveFilters, resetFilters }: FilterPanelProps) => {
  return (
    <div className="bg-card rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">Filter Movies</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Genre</label>
          <Select
            value={activeFilters.genre || 'all-genres'}
            onValueChange={(value) => 
              setActiveFilters(prev => ({ ...prev, genre: value === 'all-genres' ? undefined : value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-genres">All Genres</SelectItem>
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
            value={activeFilters.year?.toString() || 'all-years'}
            onValueChange={(value) => 
              setActiveFilters(prev => ({ ...prev, year: value === 'all-years' ? undefined : parseInt(value) }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-years">All Years</SelectItem>
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
              value={activeFilters.sortBy || 'default'}
              onValueChange={(value: string) => 
                setActiveFilters(prev => ({ ...prev, sortBy: value === 'default' ? undefined : value as 'title' | 'releaseDate' | 'voteAverage' }))
              }
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
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
  );
};

export default FilterPanel;
