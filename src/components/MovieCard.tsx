
import { useState } from 'react';
import { Movie } from '../types/movie';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface MovieCardProps {
  movie: Movie;
  featured?: boolean;
}

const MovieCard = ({ movie, featured = false }: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (featured) {
    return (
      <div className="relative h-[400px] w-full overflow-hidden rounded-lg">
        <img 
          src={movie.backdropPath} 
          alt={movie.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h2 className="text-3xl font-bold mb-2 text-shadow">{movie.title}</h2>
          <div className="flex items-center mb-4">
            <span className="bg-movie-accent text-white px-2 py-1 rounded-md text-sm font-semibold mr-2">
              {movie.voteAverage.toFixed(1)}
            </span>
            <span className="text-movie-muted text-sm">
              {movie.releaseDate.substring(0, 4)} • {movie.genres.slice(0, 2).join(', ')}
            </span>
          </div>
          <p className="text-movie-text text-sm line-clamp-2 mb-4">{movie.overview}</p>
          <Link to={`/movie/${movie.id}`} className="bg-movie-accent hover:bg-movie-accent-hover text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors">
            View Details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Link to={`/movie/${movie.id}`}>
      <Card className="overflow-hidden movie-card-hover bg-movie-card border-0">
        <div className="relative aspect-[2/3] w-full">
          <img 
            src={movie.posterPath} 
            alt={movie.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-movie-card flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-movie-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm truncate">{movie.title}</h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-movie-muted">{movie.releaseDate.substring(0, 4)}</span>
            <span className="bg-movie-accent/20 text-movie-accent px-2 py-0.5 rounded text-xs font-semibold">
              {movie.voteAverage.toFixed(1)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default MovieCard;
