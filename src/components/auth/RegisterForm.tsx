import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for anonymous watchlist to notify user
  useEffect(() => {
    const watchlistStr = localStorage.getItem('watchlist');
    const anonymousWatchlist = watchlistStr ? JSON.parse(watchlistStr) : [];
    if (anonymousWatchlist.length > 0) {
      setSuccess(`Your watchlist with ${anonymousWatchlist.length} movies will be saved to your account`);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsSubmitting(false);
      return;
    }

    try {
      const success = await register(email, password, name);
      if (success) {
        // Check if watchlist was migrated
        const watchlistWasMigrated = !localStorage.getItem('watchlist');
        
        if (watchlistWasMigrated) {
          toast({
            title: "Account created successfully!",
            description: "Your watchlist has been saved to your new account.",
            duration: 3000,
          });
        } else {
          toast({
            title: "Account created successfully!",
            description: "Welcome to Movie Recommendation System.",
            duration: 3000,
          });
        }
        
        navigate("/");
      } else {
        setError("Registration failed. Email might already be in use.");
      }
    } catch (err) {
      setError("An error occurred during registration");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md mx-auto bg-card/50 backdrop-blur-sm border-border/40">
        <CardHeader>
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 border-primary/50 bg-primary/10">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary">{success}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default RegisterForm; 