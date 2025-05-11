import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';

type Genre = 'action' | 'comedy' | 'drama' | 'horror' | 'sciFi';

const genreOptions: { value: Genre; label: string }[] = [
  { value: 'action', label: 'Action' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'drama', label: 'Drama' },
  { value: 'horror', label: 'Horror' },
  { value: 'sciFi', label: 'Sci-Fi' },
];

const Preferences = () => {
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [minRating, setMinRating] = useState(7);
  const [releaseYearRange, setReleaseYearRange] = useState([1990, new Date().getFullYear()]);
  const { toast } = useToast();

  // Load preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('moviePreferences');
    if (savedPreferences) {
      setSelectedGenres(JSON.parse(savedPreferences));
    }
    
    const savedMinRating = localStorage.getItem('minRating');
    if (savedMinRating) {
      setMinRating(parseFloat(savedMinRating));
    }
    
    const savedYearRange = localStorage.getItem('releaseYearRange');
    if (savedYearRange) {
      setReleaseYearRange(JSON.parse(savedYearRange));
    }
  }, []);

  const handleGenreToggle = (genre: Genre) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      } else {
        return [...prev, genre];
      }
    });
  };

  const handleSavePreferences = () => {
    // Ensure at least one genre is selected
    if (selectedGenres.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one genre",
        variant: "destructive",
      });
      return;
    }
    
    localStorage.setItem('moviePreferences', JSON.stringify(selectedGenres));
    localStorage.setItem('minRating', minRating.toString());
    localStorage.setItem('releaseYearRange', JSON.stringify(releaseYearRange));
    
    toast({
      title: "Preferences saved",
      description: "Your movie preferences have been updated",
    });
    
    // Trigger an event for other components to know preferences changed
    window.dispatchEvent(new Event('preferencesUpdated'));
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-8">Movie Preferences</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Tabs defaultValue="genres" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="genres">Genres</TabsTrigger>
                  <TabsTrigger value="ratings">Ratings</TabsTrigger>
                  <TabsTrigger value="years">Release Years</TabsTrigger>
                </TabsList>
                
                <TabsContent value="genres" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Genre Preferences</CardTitle>
                      <CardDescription>
                        Select the movie genres you enjoy watching
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {genreOptions.map((genre) => (
                          <div key={genre.value} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`genre-${genre.value}`} 
                              checked={selectedGenres.includes(genre.value)}
                              onCheckedChange={() => handleGenreToggle(genre.value)}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <Label 
                              htmlFor={`genre-${genre.value}`}
                              className="cursor-pointer"
                            >
                              {genre.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="ratings" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Rating Preferences</CardTitle>
                      <CardDescription>
                        Set your minimum movie rating preference
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span>Minimum Rating</span>
                            <span className="font-medium">{minRating.toFixed(1)}</span>
                          </div>
                          <Slider
                            value={[minRating]}
                            min={0}
                            max={10}
                            step={0.1}
                            onValueChange={(value) => setMinRating(value[0])}
                            className="w-full"
                          />
                          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                            <span>0</span>
                            <span>5</span>
                            <span>10</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="years" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Release Year Preferences</CardTitle>
                      <CardDescription>
                        Set your preferred movie release year range
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span>Release Years</span>
                            <span className="font-medium">{releaseYearRange[0]} - {releaseYearRange[1]}</span>
                          </div>
                          <Slider
                            value={releaseYearRange}
                            min={1950}
                            max={new Date().getFullYear()}
                            step={1}
                            onValueChange={(value) => setReleaseYearRange([value[0], value[1]])}
                            className="w-full"
                          />
                          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                            <span>1950</span>
                            <span>{Math.floor((1950 + new Date().getFullYear()) / 2)}</span>
                            <span>{new Date().getFullYear()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Your Preferences</CardTitle>
                  <CardDescription>
                    Summary of your movie preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Selected Genres</h3>
                      {selectedGenres.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedGenres.map(genre => (
                            <span key={genre} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                              {genre.charAt(0).toUpperCase() + genre.slice(1)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No genres selected</p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-1">Minimum Rating</h3>
                      <p>{minRating.toFixed(1)} / 10</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-1">Release Years</h3>
                      <p>{releaseYearRange[0]} - {releaseYearRange[1]}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSavePreferences} 
                    className="w-full"
                  >
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Preferences; 