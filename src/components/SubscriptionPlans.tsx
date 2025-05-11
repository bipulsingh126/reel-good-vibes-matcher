import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Check, Sparkles } from 'lucide-react';
import { upgradeSubscription, getCurrentUser, SUBSCRIPTION_PRICES } from '@/services/userService';
import { SubscriptionTier } from '@/types/movie';
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

interface SubscriptionPlansProps {
  onComplete?: () => void;
}

const SubscriptionPlans = ({ onComplete }: SubscriptionPlansProps) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>('premium');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const currentUser = getCurrentUser();
  const currentTier = currentUser.subscription.tier;
  
  const handleUpgrade = async () => {
    setIsProcessing(true);
    
    try {
      const success = upgradeSubscription(selectedPlan);
      
      if (success) {
        toast({
          title: "Subscription Upgraded",
          description: `You've successfully upgraded to the ${selectedPlan} plan.`,
          variant: "default",
        });
        setIsDialogOpen(false);
        if (onComplete) onComplete();
      } else {
        toast({
          title: "Upgrade Failed",
          description: "There was an issue processing your subscription. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upgrade Failed",
        description: "There was an issue processing your subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Unlock premium content with our subscription plans
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <Card className={`border ${currentTier === 'free' ? 'border-primary' : 'border-border'}`}>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Basic access to our platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-6">
              $0<span className="text-muted-foreground text-sm font-normal">/month</span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Access to free movies</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Create watchlists</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Basic recommendations</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              variant={currentTier === 'free' ? 'outline' : 'secondary'} 
              className="w-full"
              disabled={currentTier === 'free'}
            >
              {currentTier === 'free' ? 'Current Plan' : 'Downgrade'}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Basic Plan */}
        <Card className={`border ${currentTier === 'basic' ? 'border-primary' : 'border-border'}`}>
          <CardHeader>
            <CardTitle>Basic</CardTitle>
            <CardDescription>For casual movie enthusiasts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-6">
              ${SUBSCRIPTION_PRICES.basic}<span className="text-muted-foreground text-sm font-normal">/month</span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Everything in Free</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>HD streaming quality</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Discounted rentals</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Dialog open={isDialogOpen && selectedPlan === 'basic'} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (open) setSelectedPlan('basic');
            }}>
              <DialogTrigger asChild>
                <Button 
                  variant={currentTier === 'basic' ? 'outline' : 'default'} 
                  className="w-full"
                  disabled={currentTier === 'basic'}
                >
                  {currentTier === 'basic' ? 'Current Plan' : (
                    currentTier === 'premium' ? 'Downgrade' : 'Upgrade'
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upgrade to Basic Plan</DialogTitle>
                  <DialogDescription>
                    Enjoy HD streaming and discounted rentals for just ${SUBSCRIPTION_PRICES.basic}/month.
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
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpgrade} 
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : `Subscribe for $${SUBSCRIPTION_PRICES.basic}/month`}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
        
        {/* Premium Plan */}
        <Card className={`border ${currentTier === 'premium' ? 'border-primary' : 'border-border'} relative overflow-hidden`}>
          {currentTier !== 'premium' && (
            <div className="absolute top-0 right-0">
              <div className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium transform rotate-45 translate-x-2 translate-y-3">
                Best Value
              </div>
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Premium <Sparkles className="h-4 w-4 text-yellow-400" />
            </CardTitle>
            <CardDescription>For true movie lovers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-6">
              ${SUBSCRIPTION_PRICES.premium}<span className="text-muted-foreground text-sm font-normal">/month</span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Everything in Basic</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>4K streaming quality</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Access to all premium content</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Early access to new releases</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Dialog open={isDialogOpen && selectedPlan === 'premium'} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (open) setSelectedPlan('premium');
            }}>
              <DialogTrigger asChild>
                <Button 
                  variant={currentTier === 'premium' ? 'outline' : 'default'} 
                  className={`w-full ${currentTier !== 'premium' ? 'bg-primary hover:bg-primary/90' : ''}`}
                  disabled={currentTier === 'premium'}
                >
                  {currentTier === 'premium' ? 'Current Plan' : 'Upgrade'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upgrade to Premium Plan</DialogTitle>
                  <DialogDescription>
                    Get unlimited access to all premium content for just ${SUBSCRIPTION_PRICES.premium}/month.
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
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpgrade} 
                    disabled={isProcessing}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isProcessing ? 'Processing...' : `Subscribe for $${SUBSCRIPTION_PRICES.premium}/month`}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionPlans; 