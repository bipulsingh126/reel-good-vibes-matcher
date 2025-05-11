
import { useEffect, useState } from 'react';
import { Movie } from '../types/movie';
import { getMoviesByCategory } from '../services/movieService';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

const Hero = () => {
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const topRatedMovies = getMoviesByCategory('topRated');
    if (topRatedMovies.length > 0) {
      setFeaturedMovie(topRatedMovies[0]);
    }
  }, []);

  if (!featuredMovie) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-movie-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] overflow-hidden">
      {/* Background Image */}
      <img
        src={featuredMovie.backdropPath}
        alt={featuredMovie.title}
        className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
          imageLoaded ? 'opacity-60' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
      
      {/* Content */}
      <div className="container mx-auto px-4 relative h-full flex items-center">
        <div className="max-w-2xl animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{featuredMovie.title}</h1>
          
          <div className="flex items-center mb-4 text-sm">
            <span className="bg-movie-accent text-white px-2 py-1 rounded-md font-bold mr-2">
              {featuredMovie.voteAverage.toFixed(1)}
            </span>
            <span className="text-muted-foreground mr-4">
              {featuredMovie.releaseDate.substring(0, 4)}
            </span>
            <span className="text-muted-foreground">
              {featuredMovie.genres.join(' • ')}
            </span>
          </div>
          
          <p className="text-lg mb-8 line-clamp-3">
            {featuredMovie.overview}
          </p>
          
          <div className="flex space-x-4">
            <Link to={`/movie/${featuredMovie.id}`}>
              <Button size="lg" className="bg-movie-accent hover:bg-movie-accent-hover gap-2">
                <Play className="h-5 w-5" /> Watch Now
              </Button>
            </Link>
            <Link to={`/movie/${featuredMovie.id}`}>
              <Button variant="outline" size="lg">
                More Info
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
