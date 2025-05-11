import { 
  getUserWatchlist, 
  addToUserWatchlist, 
  removeFromUserWatchlist 
} from '../services/userService';

/**
 * Checks if a movie is in the watchlist
 * @param movieId The ID of the movie to check
 * @returns True if the movie is in the watchlist, false otherwise
 */
export const isInWatchlist = (movieId: number): boolean => {
  const watchlist = getWatchlist();
  return watchlist.includes(movieId);
};

/**
 * Gets the current watchlist from localStorage or user data
 * @returns Array of movie IDs in the watchlist
 */
export const getWatchlist = (): number[] => {
  // First try to get from user service (for logged in users)
  const userWatchlist = getUserWatchlist();
  
  // If user watchlist exists, return it
  if (userWatchlist && userWatchlist.length > 0) {
    return userWatchlist;
  }
  
  // Fall back to localStorage for anonymous users
  const watchlistStr = localStorage.getItem('watchlist');
  return watchlistStr ? JSON.parse(watchlistStr) : [];
};

/**
 * Gets the count of movies in the watchlist
 * @returns Number of movies in the watchlist
 */
export const getWatchlistCount = (): number => {
  return getWatchlist().length;
};

/**
 * Adds a movie to the watchlist
 * @param movieId The ID of the movie to add
 */
export const addToWatchlist = (movieId: number): void => {
  // Try to add to user watchlist first (for logged in users)
  const added = addToUserWatchlist(movieId);
  
  // If not added to user watchlist (not logged in), add to localStorage
  if (!added) {
    const watchlist = getWatchlist();
    if (!watchlist.includes(movieId)) {
      watchlist.push(movieId);
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
    }
  }
};

/**
 * Removes a movie from the watchlist
 * @param movieId The ID of the movie to remove
 */
export const removeFromWatchlist = (movieId: number): void => {
  // Try to remove from user watchlist first (for logged in users)
  const removed = removeFromUserWatchlist(movieId);
  
  // If not removed from user watchlist (not logged in), remove from localStorage
  if (!removed) {
    const watchlist = getWatchlist();
    const updatedWatchlist = watchlist.filter(id => id !== movieId);
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
  }
};

/**
 * Toggles a movie in the watchlist (adds if not present, removes if present)
 * @param movieId The ID of the movie to toggle
 * @returns True if the movie was added, false if it was removed
 */
export const toggleWatchlist = (movieId: number): boolean => {
  if (isInWatchlist(movieId)) {
    removeFromWatchlist(movieId);
    return false;
  } else {
    addToWatchlist(movieId);
    return true;
  }
};
