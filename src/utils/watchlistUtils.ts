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
 * Gets the current watchlist from localStorage
 * @returns Array of movie IDs in the watchlist
 */
export const getWatchlist = (): number[] => {
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
  const watchlist = getWatchlist();
  if (!watchlist.includes(movieId)) {
    watchlist.push(movieId);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }
};

/**
 * Removes a movie from the watchlist
 * @param movieId The ID of the movie to remove
 */
export const removeFromWatchlist = (movieId: number): void => {
  const watchlist = getWatchlist();
  const updatedWatchlist = watchlist.filter(id => id !== movieId);
  localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
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
