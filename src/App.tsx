import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MovieDetail from "./pages/MovieDetail";
import Trending from "./pages/Trending";
import Categories from "./pages/Categories";
import WatchList from "./pages/WatchList";
import Preferences from "./pages/Preferences";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "./components/auth/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useEffect } from "react";
import { suppressConsoleErrors } from "./utils/errorSuppress";

// Initialize query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Initialize window.z to prevent errors
if (typeof window !== 'undefined' && window.z === undefined) {
  window.z = {};
}

const App = () => {
  // Initialize error suppression
  useEffect(() => {
    // Initialize error handling
    suppressConsoleErrors();
    
    // Add backup error handler
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      // Handle z initialization issues
      if (message && message.toString().includes("z") && typeof window.z === 'undefined') {
        window.z = {};
        return true;
      }
      
      // Call original handler if it exists
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      
      return false;
    };
    
    return () => {
      window.onerror = originalOnError;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/movie/:id" element={<MovieDetail />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/watchlist" element={
                  <ProtectedRoute>
                    <WatchList />
                  </ProtectedRoute>
                } />
                <Route path="/preferences" element={
                  <ProtectedRoute>
                    <Preferences />
                  </ProtectedRoute>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
