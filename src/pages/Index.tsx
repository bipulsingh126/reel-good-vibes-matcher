import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import MovieSection from '../components/MovieSection';
import { Movie } from '../types/movie';
import MovieCard from '../components/MovieCard';
import PersonalRecommendations from '../components/PersonalRecommendations';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '../components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const { isAuthenticated, user } = useAuth();
  
  // Listen for search results from the Header component
  useEffect(() => {
    const handleSearchResults = (event: CustomEvent<Movie[]>) => {
      setSearchResults(event.detail);
    };
    
    window.addEventListener('searchResults' as any, handleSearchResults as any);
    
    return () => {
      window.removeEventListener('searchResults' as any, handleSearchResults as any);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      {searchResults.length > 0 ? (
        <div className="container mx-auto px-4 pt-32 pb-16">
          <h2 className="text-2xl font-semibold mb-6">Search Results</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {searchResults.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      ) : (
        <>
          <Hero />
          
          <div className="container mx-auto px-4 py-16">
            {isAuthenticated ? (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name.split(' ')[0]}!</h2>
                  <p className="text-muted-foreground">
                    Here are some personalized movie recommendations just for you.
                  </p>
                </div>
                <PersonalRecommendations />
              </>
            ) : (
              <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-lg p-8 mb-12">
                <h2 className="text-2xl font-bold mb-4">Get Personalized Recommendations</h2>
                <p className="text-muted-foreground mb-6">
                  Sign in to get personalized movie recommendations based on your preferences and viewing history.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild>
                    <Link to="/register">Create Account</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                </div>
              </div>
            )}
            
            <ScrollArea className="w-full">
              <div className="space-y-12">
                <MovieSection title="Trending Now" category="trending" />
                <MovieSection title="Top Rated" category="topRated" />
                <MovieSection title="Action Movies" category="action" />
                <MovieSection title="Drama" category="drama" />
                <MovieSection title="Sci-Fi" category="sciFi" />
                <MovieSection title="Comedy" category="comedy" />
              </div>
            </ScrollArea>
          </div>
        </>
      )}
      
      <footer className="bg-background border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Movie Recommendation System</h3>
              <p className="text-muted-foreground text-sm">
                Your personal movie recommendation platform. Discover new films and keep track of your favorites.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Explore</h3>
              <ul className="space-y-2">
                <li><a href="/trending" className="text-sm text-muted-foreground hover:text-primary transition-colors">Trending</a></li>
                <li><a href="/categories" className="text-sm text-muted-foreground hover:text-primary transition-colors">Categories</a></li>
                <li><a href="/watchlist" className="text-sm text-muted-foreground hover:text-primary transition-colors">Watchlist</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Movie Recommendation System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
