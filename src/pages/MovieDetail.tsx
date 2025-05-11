
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieById, getRecommendedMovies } from '../services/movieService';
import Header from '../components/Header';
import { Movie } from '../types/movie';
import MovieCard from '../components/MovieCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Clock, Play, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [recommended, setRecommended] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (id) {
      const movieId = parseInt(id, 10);
      const foundMovie = getMovieById(movieId);
      
      if (foundMovie) {
        setMovie(foundMovie);
        setRecommended(getRecommendedMovies(movieId));
      }
      
      setLoading(false);
    }
  }, [id]);

  const handlePlayMovie = () => {
    toast({
      title: "Feature not available",
      description: "This is a demo version. Streaming is not available.",
      duration: 3000,
    });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-movie-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Movie not found</h1>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }
  
  return (
    <div>
      <Header />
      
      {/* Hero Section */}
      <div className="relative min-h-[80vh]">
        {/* Background Image */}
        <img
          src={movie.backdropPath}
          alt={movie.title}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${
            imageLoaded ? 'opacity-40' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        
        {/* Back Button */}
        <div className="absolute top-24 left-4 z-10">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 py-32 relative flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Movie Poster */}
          <div className="w-64 h-96 shrink-0 overflow-hidden rounded-lg shadow-2xl">
            <img 
              src={movie.posterPath}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Movie Details */}
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{movie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="flex items-center gap-1 bg-movie-accent/20 text-movie-accent px-2 py-1 rounded">
                <Star className="h-4 w-4 fill-movie-accent" /> {movie.voteAverage.toFixed(1)}
              </span>
              
              <span className="text-muted-foreground">
                {movie.releaseDate.substring(0, 4)}
              </span>
              
              {movie.runtime && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" /> {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </span>
              )}
              
              {movie.genres.map(genre => (
                <span 
                  key={genre} 
                  className="bg-secondary/50 px-2 py-1 rounded text-xs"
                >
                  {genre}
                </span>
              ))}
            </div>
            
            <p className="text-lg mb-6">{movie.overview}</p>
            
            {movie.director && (
              <p className="mb-1"><span className="text-muted-foreground">Director:</span> {movie.director}</p>
            )}
            
            {movie.cast && movie.cast.length > 0 && (
              <p className="mb-6">
                <span className="text-muted-foreground">Cast:</span> {movie.cast.join(', ')}
              </p>
            )}
            
            <Button onClick={handlePlayMovie} className="bg-movie-accent hover:bg-movie-accent-hover gap-2">
              <Play className="h-5 w-5" /> Watch Now
            </Button>
          </div>
        </div>
      </div>
      
      {/* Recommendations Section */}
      {recommended.length > 0 && (
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-semibold mb-6">You might also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recommended.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      )}
      
      <footer className="bg-movie-dark py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-movie-muted text-sm">
            © {new Date().getFullYear()} MovieMingle. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MovieDetail;
