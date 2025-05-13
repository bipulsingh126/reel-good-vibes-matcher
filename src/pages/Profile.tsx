import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/auth/AuthContext";
import Header from "../components/Header";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { CalendarDays, LogOut, Mail, User } from "lucide-react";
import { motion } from "framer-motion";

const Profile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/login");
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, navigate, isLoading]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-32 pb-16">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }).format(date);
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Unknown date";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-8">Your Profile</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Card className="bg-card/50 backdrop-blur-sm border-border/40">
                <CardHeader className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="text-2xl bg-primary/10">
                      {user.name ? user.name.charAt(0) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-2xl">{user.name || "User"}</CardTitle>
                  <CardDescription className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" /> {user.email || "No email"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Member</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Joined {user.createdAt ? formatDate(user.createdAt) : "Recently"}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card className="bg-card/50 backdrop-blur-sm border-border/40">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                        <p className="text-base">{user.name || "Not set"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-base">{user.email || "Not set"}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Account Activity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                        <p className="text-base">{user.createdAt ? formatDate(user.createdAt) : "Unknown"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                        <p className="text-base">Active</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => navigate("/preferences")}>
                    Movie Preferences
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/watchlist")}>
                    Your Watchlist
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

export default Profile; 