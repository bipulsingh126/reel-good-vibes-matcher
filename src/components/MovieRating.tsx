import { useState, useEffect } from 'react';
import { Star, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

interface Review {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
}

interface MovieRatingProps {
  movieId: number;
  initialRating?: number;
}

const MovieRating = ({ movieId, initialRating = 0 }: MovieRatingProps) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { toast } = useToast();

  // Load reviews from localStorage
  useEffect(() => {
    const savedReviews = localStorage.getItem(`movie-${movieId}-reviews`);
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    }
    
    // Check if user has already rated
    const userRating = localStorage.getItem(`movie-${movieId}-user-rating`);
    if (userRating) {
      setRating(parseFloat(userRating));
    }
  }, [movieId]);

  const handleRatingClick = (value: number) => {
    setRating(value);
    localStorage.setItem(`movie-${movieId}-user-rating`, value.toString());
    
    if (!showReviewForm) {
      setShowReviewForm(true);
    }
  };

  const handleSubmitReview = () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating before submitting",
        variant: "destructive",
      });
      return;
    }
    
    if (comment.trim().length < 3) {
      toast({
        title: "Review too short",
        description: "Please write a more detailed review",
        variant: "destructive",
      });
      return;
    }
    
    // Create new review
    const newReview: Review = {
      id: Date.now().toString(),
      userId: 'current-user', // In a real app, this would be the actual user ID
      username: 'You', // In a real app, this would be the actual username
      rating,
      comment,
      date: new Date().toISOString(),
    };
    
    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`movie-${movieId}-reviews`, JSON.stringify(updatedReviews));
    
    // Reset form
    setComment('');
    setShowReviewForm(false);
    
    toast({
      title: "Review submitted",
      description: "Thank you for your feedback!",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <h3 className="text-xl font-semibold">Rate this movie</h3>
        
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className="focus:outline-none"
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleRatingClick(value)}
            >
              <Star
                className={`w-8 h-8 transition-all ${
                  (hoverRating || rating) >= value
                    ? 'text-yellow-400 fill-yellow-400 scale-110'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        
        {rating > 0 && (
          <p className="text-sm text-muted-foreground">
            You rated this movie {rating} {rating === 1 ? 'star' : 'stars'}
          </p>
        )}
      </div>
      
      {showReviewForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-muted/30 backdrop-blur-sm rounded-lg p-4 border border-border"
        >
          <h3 className="text-lg font-medium mb-2">Write a review</h3>
          <Textarea
            placeholder="Share your thoughts about this movie..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[120px] mb-4"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowReviewForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview}>
              Submit Review
            </Button>
          </div>
        </motion.div>
      )}
      
      {!showReviewForm && (
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setShowReviewForm(true)}
          >
            <MessageCircle className="h-4 w-4" />
            Write a Review
          </Button>
          
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <span className="font-medium">{calculateAverageRating().toFixed(1)}</span>
              <span className="text-muted-foreground">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
            </div>
          )}
        </div>
      )}
      
      {reviews.length > 0 && (
        <div className="space-y-4 mt-8">
          <h3 className="text-xl font-semibold mb-4">User Reviews</h3>
          
          {reviews.map((review) => (
            <Card key={review.id} className="bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      {review.avatar && <AvatarImage src={review.avatar} />}
                      <AvatarFallback>{review.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{review.username}</CardTitle>
                      <CardDescription>{formatDate(review.date)}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{review.comment}</p>
              </CardContent>
              {review.userId === 'current-user' && (
                <CardFooter className="pt-0 flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      const updatedReviews = reviews.filter(r => r.id !== review.id);
                      setReviews(updatedReviews);
                      localStorage.setItem(`movie-${movieId}-reviews`, JSON.stringify(updatedReviews));
                    }}
                  >
                    Delete
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MovieRating; 