import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeUserData, getUserData, saveUserData } from '../../services/userService';
import { SubscriptionTier } from '../../types/movie';

// Function to migrate anonymous watchlist to user account
const migrateAnonymousWatchlist = (userId: string) => {
  try {
    // Get anonymous watchlist from localStorage
    const watchlistStr = localStorage.getItem('watchlist');
    if (!watchlistStr) return;
    
    const anonymousWatchlist = JSON.parse(watchlistStr);
    if (!anonymousWatchlist.length) return;
    
    // Get user data
    const userData = getUserData(userId);
    if (!userData) return;
    
    // Merge watchlists (avoid duplicates)
    const userWatchlist = userData.watchlist || [];
    const mergedWatchlist = [...new Set([...userWatchlist, ...anonymousWatchlist])];
    
    // Save merged watchlist to user data
    saveUserData(userId, {
      ...userData,
      watchlist: mergedWatchlist
    });
    
    // Clear anonymous watchlist
    localStorage.removeItem('watchlist');
    
    console.log(`Migrated ${anonymousWatchlist.length} items from anonymous watchlist to user account`);
  } catch (error) {
    console.error('Failed to migrate anonymous watchlist:', error);
  }
};

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Initialize user data from localStorage
        initializeUserData(parsedUser.id);
        
        // Migrate anonymous watchlist to user account
        migrateAnonymousWatchlist(parsedUser.id);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Get registered users
      const usersStr = localStorage.getItem('registeredUsers');
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      // Find user with matching email
      const foundUser = users.find((u: any) => u.email === email);
      
      if (!foundUser) {
        throw new Error('User not found');
      }
      
      // Check password
      if (foundUser.password !== password) {
        throw new Error('Invalid password');
      }
      
      // Create user object (excluding password)
      const { password: _, ...userWithoutPassword } = foundUser;
      
      // Store user in state and localStorage
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      // Initialize user data from localStorage
      initializeUserData(userWithoutPassword.id);
      
      // Migrate anonymous watchlist to user account
      migrateAnonymousWatchlist(userWithoutPassword.id);
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Get existing users
      const usersStr = localStorage.getItem('registeredUsers');
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      // Check if user already exists
      if (users.some((u: any) => u.email === email)) {
        throw new Error('User with this email already exists');
      }
      
      // Generate a unique user ID
      const userId = crypto.randomUUID();
      
      // Create new user
      const newUser = {
        id: userId,
        email,
        password, // In a real app, this would be hashed
        name,
        createdAt: new Date().toISOString()
      };
      
      // Add to users array
      users.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(users));
      
      // Auto login after registration
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      // Get anonymous watchlist
      const watchlistStr = localStorage.getItem('watchlist');
      const anonymousWatchlist = watchlistStr ? JSON.parse(watchlistStr) : [];
      
      // Initialize default user data (watchlist, preferences, etc.)
      const defaultUserData = {
        id: userId,
        email,
        name,
        subscription: {
          tier: 'free' as SubscriptionTier,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          autoRenew: false
        },
        purchasedMovies: [],
        rentedMovies: [],
        watchlist: anonymousWatchlist, // Use anonymous watchlist as initial watchlist
        preferences: {
          favoriteGenres: [],
          contentRating: 'PG-13',
          emailNotifications: true
        },
        paymentMethods: []
      };
      
      // Save the user data
      saveUserData(userId, defaultUserData);
      
      // Clear anonymous watchlist after migration
      if (anonymousWatchlist.length > 0) {
        localStorage.removeItem('watchlist');
      }
      
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 