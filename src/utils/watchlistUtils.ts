
export const addToWatchlist = (movieId: number): boolean => {
  try {
    // Get current watchlist from localStorage
    const savedWatchlist = localStorage.getItem('watchlist');
    let watchlistIds: number[] = [];
    
    if (savedWatchlist) {
      watchlistIds = JSON.parse(savedWatchlist);
    }
    
    // Check if movie is already in watchlist
    if (!watchlistIds.includes(movieId)) {
      // Add the movie ID to watchlist
      watchlistIds.push(movieId);
      // Save the updated watchlist
      localStorage.setItem('watchlist', JSON.stringify(watchlistIds));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to add to watchlist:', error);
    return false;
  }
};

export const removeFromWatchlist = (movieId: number): boolean => {
  try {
    // Get current watchlist
    const savedWatchlist = localStorage.getItem('watchlist');
    let watchlistIds: number[] = [];
    
    if (savedWatchlist) {
      watchlistIds = JSON.parse(savedWatchlist);
    }

    // Remove the movie ID if it exists
    const updatedWatchlist = watchlistIds.filter(id => id !== movieId);
    
    // Save the updated watchlist
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
    
    return true;
  } catch (error) {
    console.error('Failed to remove from watchlist:', error);
    return false;
  }
};

export const isInWatchlist = (movieId: number): boolean => {
  try {
    const savedWatchlist = localStorage.getItem('watchlist');
    if (!savedWatchlist) return false;
    
    const watchlistIds = JSON.parse(savedWatchlist) as number[];
    return watchlistIds.includes(movieId);
  } catch (error) {
    console.error('Failed to check watchlist status:', error);
    return false;
  }
};

export const getWatchlistCount = (): number => {
  try {
    const savedWatchlist = localStorage.getItem('watchlist');
    if (!savedWatchlist) return 0;
    
    const watchlistIds = JSON.parse(savedWatchlist) as number[];
    return watchlistIds.length;
  } catch (error) {
    console.error('Failed to get watchlist count:', error);
    return 0;
  }
};
