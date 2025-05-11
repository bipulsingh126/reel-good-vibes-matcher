import { useState } from 'react';
import { Movie } from '@/types/movie';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Clock, Check, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  isMoviePurchased, 
  isMovieRented, 
  purchaseMovie, 
  rentMovie, 
  getRentalExpiryTime,
  hasPremiumAccess
} from '@/services/userService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow } from 'date-fns';

interface PurchaseOptionsProps {
  movie: Movie;
  onComplete?: () => void;
}

const PurchaseOptions = ({ movie, onComplete }: PurchaseOptionsProps) => {
  const [isRentDialogOpen, setIsRentDialogOpen] = useState(false);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const isPurchased = isMoviePurchased(movie.id);
  const isRented = isMovieRented(movie.id);
  const hasAccess = hasPremiumAccess() || isPurchased || isRented;
  const rentalExpiryTime = getRentalExpiryTime(movie.id);
  
  const handleRent = async () => {
    setIsProcessing(true);
    
    try {
      const success = rentMovie(movie.id, movie.rentalPrice || 4.99);
      
      if (success) {
        toast({
          title: "Movie Rented",
          description: `You've successfully rented "${movie.title}" for 48 hours.`,
          variant: "default",
        });
        setIsRentDialogOpen(false);
        if (onComplete) onComplete();
      } else {
        toast({
          title: "Rental Failed",
          description: "There was an issue processing your rental. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Rental Failed",
        description: "There was an issue processing your rental. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handlePurchase = async () => {
    setIsProcessing(true);
    
    try {
      const success = purchaseMovie(movie.id, movie.purchasePrice || 14.99);
      
      if (success) {
        toast({
          title: "Movie Purchased",
          description: `You've successfully purchased "${movie.title}". Enjoy watching anytime!`,
          variant: "default",
        });
        setIsPurchaseDialogOpen(false);
        if (onComplete) onComplete();
      } else {
        toast({
          title: "Purchase Failed",
          description: "There was an issue processing your purchase. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "There was an issue processing your purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const formatRentalExpiry = () => {
    if (!rentalExpiryTime) return '';
    
    try {
      return formatDistanceToNow(new Date(rentalExpiryTime), { addSuffix: true });
    } catch (error) {
      return 'soon';
    }
  };
  
  if (!movie.isPremium) {
    return null;
  }
  
  if (isPurchased) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border border-border">
        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
          <Check className="h-5 w-5 text-green-500" /> Purchased
        </h3>
        <p className="text-muted-foreground">
          You own this movie and can watch it anytime.
        </p>
      </div>
    );
  }
  
  if (isRented) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border border-border">
        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" /> Rental Active
        </h3>
        <p className="text-muted-foreground">
          Your rental expires {formatRentalExpiry()}.
        </p>
      </div>
    );
  }
  
  if (hasPremiumAccess()) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border border-border">
        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
          <Check className="h-5 w-5 text-green-500" /> Premium Access
        </h3>
        <p className="text-muted-foreground">
          Included with your premium subscription.
        </p>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-muted/30 rounded-lg border border-border">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <Lock className="h-5 w-5 text-primary" /> Premium Content
      </h3>
      
      <div className="space-y-4">
        {/* Rent Option */}
        <Dialog open={isRentDialogOpen} onOpenChange={setIsRentDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between"
            >
              <span>Rent for 48 hours</span>
              <span className="font-semibold">${movie.rentalPrice?.toFixed(2) || '4.99'}</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rent "{movie.title}"</DialogTitle>
              <DialogDescription>
                You'll have access to this movie for 48 hours after rental.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <h4 className="font-medium mb-2">Payment Method</h4>
              <RadioGroup defaultValue="card-1" className="space-y-3">
                <div className="flex items-center space-x-2 border p-3 rounded-md">
                  <RadioGroupItem value="card-1" id="card-1" />
                  <Label htmlFor="card-1" className="flex-1">Credit Card ending in 4242</Label>
                  <span className="text-sm text-muted-foreground">Expires 12/25</span>
                </div>
              </RadioGroup>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRentDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRent} 
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? 'Processing...' : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Pay ${movie.rentalPrice?.toFixed(2) || '4.99'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Purchase Option */}
        <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="w-full justify-between"
            >
              <span>Buy and own forever</span>
              <span className="font-semibold">${movie.purchasePrice?.toFixed(2) || '14.99'}</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Purchase "{movie.title}"</DialogTitle>
              <DialogDescription>
                Buy this movie once and own it forever in your library.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <h4 className="font-medium mb-2">Payment Method</h4>
              <RadioGroup defaultValue="card-1" className="space-y-3">
                <div className="flex items-center space-x-2 border p-3 rounded-md">
                  <RadioGroupItem value="card-1" id="card-1" />
                  <Label htmlFor="card-1" className="flex-1">Credit Card ending in 4242</Label>
                  <span className="text-sm text-muted-foreground">Expires 12/25</span>
                </div>
              </RadioGroup>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPurchaseDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handlePurchase} 
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? 'Processing...' : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Pay ${movie.purchasePrice?.toFixed(2) || '14.99'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PurchaseOptions; 