import { useState, useEffect, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Film,
  Bookmark,
  Moon,
  Sun,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import SearchBar from "./SearchBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getWatchlistCount } from "../utils/watchlistUtils";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "./auth/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Use passive event listener for better scroll performance
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Load watchlist count
    setWatchlistCount(getWatchlistCount());

    // Listen for watchlist changes
    const watchlistListener = () => {
      setWatchlistCount(getWatchlistCount());
    };

    window.addEventListener("storage", watchlistListener);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", watchlistListener);
    };
  }, []);

  // Refresh watchlist count when component is mounted or focused
  useEffect(() => {
    const handleFocus = () => {
      setWatchlistCount(getWatchlistCount());
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${
        isScrolled
          ? "bg-background/70 backdrop-blur-lg border-b border-border/40 shadow-lg shadow-black/5 py-2"
          : "bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Film className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
            Movie Recommendation System
          </span>
        </Link>

        <div className="hidden md:block max-w-md w-full">
          <SearchBar />
        </div>

        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              to="/trending"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Trending
            </Link>
            <Link
              to="/categories"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Categories
            </Link>
            {isAuthenticated && (
              <Link
                to="/watchlist"
                className="text-sm font-medium hover:text-primary transition-colors flex items-center"
              >
                <span>Watchlist</span>
                {watchlistCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-primary text-white"
                  >
                    {watchlistCount}
                  </Badge>
                )}
              </Link>
            )}
          </nav>

          {isAuthenticated && (
            <Link to="/watchlist" className="md:hidden relative">
              <Bookmark className="h-6 w-6" />
              {watchlistCount > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-2 -right-2 bg-primary text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center p-0 rounded-full"
                >
                  {watchlistCount}
                </Badge>
              )}
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                {theme === "dark" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10">
                      {user?.name.charAt(0) || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/preferences" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Preferences
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden mt-2 px-4">
        <SearchBar />
      </div>
    </header>
  );
};

export default memo(Header);
