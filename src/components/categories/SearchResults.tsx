
import { Movie } from '@/types/movie';
import MovieGrid from './MovieGrid';

interface SearchResultsProps {
  searchResults: Movie[];
}

const SearchResults = ({ searchResults }: SearchResultsProps) => {
  if (searchResults.length === 0) return null;
  
  return (
    <>
      <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-primary to-purple-400 text-transparent bg-clip-text">
        Search Results
      </h2>
      <MovieGrid movies={searchResults} />
    </>
  );
};

export default SearchResults;
