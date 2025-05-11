export interface Movie {
  id: number;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  releaseDate: string;
  voteAverage: number;
  genres: string[];
  runtime?: number;
  director?: string;
  cast?: string[];
  streamingUrls?: StreamingInfo[];
  trailerUrl?: string;
  isPremium?: boolean;
  rentalPrice?: number;
  purchasePrice?: number;
}

export interface StreamingInfo {
  provider: string;
  url: string;
  quality?: 'SD' | 'HD' | '4K';
  price?: number; // For rental/purchase options
  subscriptionRequired?: boolean;
}

export type MovieCategory = 'trending' | 'topRated' | 'action' | 'comedy' | 'drama' | 'horror' | 'sciFi' | 'recommended' | 'premium';

export interface MovieFilter {
  genre?: string;
  year?: number;
  rating?: number;
  sortBy?: 'title' | 'releaseDate' | 'voteAverage';
  sortOrder?: 'asc' | 'desc';
}

// User subscription types
export type SubscriptionTier = 'free' | 'basic' | 'premium';

export interface UserSubscription {
  tier: SubscriptionTier;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

// Purchase and rental interfaces
export interface PurchasedMovie {
  movieId: number;
  purchaseDate: string;
  price: number;
}

export interface RentedMovie {
  movieId: number;
  rentalDate: string;
  expiryDate: string;
  price: number;
}
