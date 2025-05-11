import { useEffect, useState, useRef } from 'react';
import { Movie } from '../types/movie';
import { getMoviesByCategory } from '../services/movieService';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Play, Info, Star, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const Hero = () => {
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const topRatedMovies = getMoviesByCategory('topRated');
    if (topRatedMovies.length > 0) {
      setFeaturedMovies(topRatedMovies);
    }
  }, []);

  useEffect(() => {
    if (featuredMovies.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
      setImageLoaded(false);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [featuredMovies]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!parallaxRef.current) return;
      
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const moveX = (clientX - innerWidth / 2) / innerWidth * 15;
      const moveY = (clientY - innerHeight / 2) / innerHeight * 15;
      
      parallaxRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (featuredMovies.length === 0) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const featuredMovie = featuredMovies[currentIndex];

  return (
    <div className="relative h-[80vh] overflow-hidden">
      {/* Background Image with Parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          ref={parallaxRef}
          className="absolute inset-0 w-[calc(100%+30px)] h-[calc(100%+30px)] -translate-x-[15px] -translate-y-[15px] transition-transform duration-200"
        >
          <img
            src={featuredMovie.backdropPath}
            alt={featuredMovie.title}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 scale-105 ${
              imageLoaded ? 'opacity-60' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
      
      {/* Content */}
      <div className="container mx-auto px-4 relative h-full flex items-center">
        <motion.div 
          className="max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          key={featuredMovie.id}
        >
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 backdrop-blur-sm">Featured Movie</Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">{featuredMovie.title}</h1>
          
          <div className="flex items-center mb-6 text-sm space-x-4">
            <div className="flex items-center space-x-1 bg-background/40 backdrop-blur-sm px-2 py-1 rounded-md">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="font-medium">{featuredMovie.voteAverage.toFixed(1)}</span>
            </div>
            
            <div className="flex items-center space-x-1 bg-background/40 backdrop-blur-sm px-2 py-1 rounded-md">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{featuredMovie.runtime} min</span>
            </div>
            
            <span className="text-muted-foreground bg-background/40 backdrop-blur-sm px-2 py-1 rounded-md">
              {featuredMovie.releaseDate.substring(0, 4)}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {featuredMovie.genres.map((genre) => (
              <Badge key={genre} variant="outline" className="bg-background/40 backdrop-blur-sm">
                {genre}
              </Badge>
            ))}
          </div>
          
          <p className="text-lg mb-8 line-clamp-3 text-muted-foreground bg-background/40 backdrop-blur-sm p-4 rounded-lg border border-border/50">
            {featuredMovie.overview}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link to={`/movie/${featuredMovie.id}`}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2 rounded-full px-6">
                <Play className="h-5 w-5" /> Watch Now
              </Button>
            </Link>
            <Link to={`/movie/${featuredMovie.id}`}>
              <Button variant="outline" size="lg" className="gap-2 rounded-full px-6 border-border/50 bg-background/40 backdrop-blur-sm hover:bg-background/60">
                <Info className="h-5 w-5" /> More Info
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
      
      {/* Movie Carousel Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-primary w-8' : 'bg-white/30'
            }`}
            onClick={() => {
              setCurrentIndex(index);
              setImageLoaded(false);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;
