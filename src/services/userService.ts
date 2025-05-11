import { SubscriptionTier, UserSubscription, PurchasedMovie, RentedMovie } from '../types/movie';

// Mock user data
interface User {
  id: string;
  email: string;
  name: string;
  subscription: UserSubscription;
  purchasedMovies: PurchasedMovie[];
  rentedMovies: RentedMovie[];
  paymentMethods: PaymentMethod[];
  watchlist?: number[]; // Movie IDs in watchlist
  preferences?: UserPreferences;
}

interface UserPreferences {
  favoriteGenres: string[];
  contentRating: string;
  emailNotifications: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal';
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
}

// Subscription pricing
export const SUBSCRIPTION_PRICES = {
  free: 0,
  basic: 7.99,
  premium: 14.99
};

// Current logged in user (mock)
let currentUser: User = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Demo User',
  subscription: {
    tier: 'free',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    autoRenew: false
  },
  purchasedMovies: [],
  rentedMovies: [],
  paymentMethods: [
    {
      id: 'pm-1',
      type: 'credit_card',
      lastFour: '4242',
      expiryDate: '12/25',
      isDefault: true
    }
  ],
  watchlist: [],
  preferences: {
    favoriteGenres: [],
    contentRating: 'PG-13',
    emailNotifications: true
  }
};

// Get current user
export const getCurrentUser = (): User => {
  return { ...currentUser };
};

// Check if user has premium access
export const hasPremiumAccess = (): boolean => {
  return currentUser.subscription.tier === 'premium';
};

// Check if user can access a premium movie
export const canAccessPremiumMovie = (movieId: number): boolean => {
  if (hasPremiumAccess()) return true;
  
  // Check if movie is purchased
  if (currentUser.purchasedMovies.some(pm => pm.movieId === movieId)) return true;
  
  // Check if movie is rented and not expired
  const rentedMovie = currentUser.rentedMovies.find(rm => rm.movieId === movieId);
  if (rentedMovie && new Date(rentedMovie.expiryDate) > new Date()) return true;
  
  return false;
};

// Upgrade subscription
export const upgradeSubscription = (tier: SubscriptionTier): boolean => {
  try {
    // In a real app, this would handle payment processing
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 30); // 30 days subscription
    
    currentUser = {
      ...currentUser,
      subscription: {
        tier,
        startDate: today.toISOString(),
        endDate: endDate.toISOString(),
        autoRenew: true
      }
    };
    
    // Save user data to localStorage
    saveUserData(currentUser.id, currentUser);
    
    return true;
  } catch (error) {
    console.error('Failed to upgrade subscription:', error);
    return false;
  }
};

// Purchase a movie
export const purchaseMovie = (movieId: number, price: number): boolean => {
  try {
    // In a real app, this would handle payment processing
    const purchase: PurchasedMovie = {
      movieId,
      purchaseDate: new Date().toISOString(),
      price
    };
    
    currentUser = {
      ...currentUser,
      purchasedMovies: [...currentUser.purchasedMovies, purchase]
    };
    
    // Save user data to localStorage
    saveUserData(currentUser.id, currentUser);
    
    return true;
  } catch (error) {
    console.error('Failed to purchase movie:', error);
    return false;
  }
};

// Rent a movie
export const rentMovie = (movieId: number, price: number, durationHours: number = 48): boolean => {
  try {
    // In a real app, this would handle payment processing
    const now = new Date();
    const expiryDate = new Date(now.getTime() + durationHours * 60 * 60 * 1000);
    
    const rental: RentedMovie = {
      movieId,
      rentalDate: now.toISOString(),
      expiryDate: expiryDate.toISOString(),
      price
    };
    
    currentUser = {
      ...currentUser,
      rentedMovies: [...currentUser.rentedMovies, rental]
    };
    
    // Save user data to localStorage
    saveUserData(currentUser.id, currentUser);
    
    return true;
  } catch (error) {
    console.error('Failed to rent movie:', error);
    return false;
  }
};

// Check if movie is purchased
export const isMoviePurchased = (movieId: number): boolean => {
  return currentUser.purchasedMovies.some(pm => pm.movieId === movieId);
};

// Check if movie is currently rented
export const isMovieRented = (movieId: number): boolean => {
  const rental = currentUser.rentedMovies.find(rm => rm.movieId === movieId);
  if (!rental) return false;
  
  return new Date(rental.expiryDate) > new Date();
};

// Get rental expiry time
export const getRentalExpiryTime = (movieId: number): string | null => {
  const rental = currentUser.rentedMovies.find(rm => rm.movieId === movieId);
  if (!rental) return null;
  
  return rental.expiryDate;
};

// Add payment method
export const addPaymentMethod = (paymentMethod: Omit<PaymentMethod, 'id'>): boolean => {
  try {
    const newPaymentMethod: PaymentMethod = {
      ...paymentMethod,
      id: `pm-${currentUser.paymentMethods.length + 1}`
    };
    
    // If this is the first payment method or marked as default, update all others
    if (paymentMethod.isDefault || currentUser.paymentMethods.length === 0) {
      currentUser = {
        ...currentUser,
        paymentMethods: currentUser.paymentMethods.map(pm => ({
          ...pm,
          isDefault: false
        }))
      };
    }
    
    currentUser = {
      ...currentUser,
      paymentMethods: [...currentUser.paymentMethods, newPaymentMethod]
    };
    
    // Save user data to localStorage
    saveUserData(currentUser.id, currentUser);
    
    return true;
  } catch (error) {
    console.error('Failed to add payment method:', error);
    return false;
  }
};

// Save user data to localStorage
export const saveUserData = (userId: string, userData: User): void => {
  try {
    // Get all user data
    const allUserData = getUsersData();
    
    // Update or add this user's data
    allUserData[userId] = userData;
    
    // Save back to localStorage
    localStorage.setItem('usersData', JSON.stringify(allUserData));
    
    // Update current user if it's the same user
    if (currentUser.id === userId) {
      currentUser = { ...userData };
    }
  } catch (error) {
    console.error('Failed to save user data:', error);
  }
};

// Get user data from localStorage
export const getUserData = (userId: string): User | null => {
  try {
    const allUserData = getUsersData();
    return allUserData[userId] || null;
  } catch (error) {
    console.error('Failed to get user data:', error);
    return null;
  }
};

// Get all users data
export const getUsersData = (): Record<string, User> => {
  try {
    const usersDataStr = localStorage.getItem('usersData');
    return usersDataStr ? JSON.parse(usersDataStr) : {};
  } catch (error) {
    console.error('Failed to get users data:', error);
    return {};
  }
};

// Initialize user data from localStorage if available
export const initializeUserData = (userId: string): void => {
  try {
    const userData = getUserData(userId);
    if (userData) {
      currentUser = { ...userData };
    }
  } catch (error) {
    console.error('Failed to initialize user data:', error);
  }
};

// Add movie to watchlist
export const addToUserWatchlist = (movieId: number): boolean => {
  try {
    if (!currentUser.watchlist) {
      currentUser.watchlist = [];
    }
    
    // Check if movie is already in watchlist
    if (!currentUser.watchlist.includes(movieId)) {
      currentUser.watchlist.push(movieId);
      saveUserData(currentUser.id, currentUser);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to add movie to watchlist:', error);
    return false;
  }
};

// Remove movie from watchlist
export const removeFromUserWatchlist = (movieId: number): boolean => {
  try {
    if (!currentUser.watchlist) {
      return true;
    }
    
    currentUser.watchlist = currentUser.watchlist.filter(id => id !== movieId);
    saveUserData(currentUser.id, currentUser);
    
    return true;
  } catch (error) {
    console.error('Failed to remove movie from watchlist:', error);
    return false;
  }
};

// Get user watchlist
export const getUserWatchlist = (): number[] => {
  return currentUser.watchlist || [];
};

// Initialize on import
initializeUserData(currentUser.id); 