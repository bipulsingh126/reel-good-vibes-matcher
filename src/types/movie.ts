
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
}

export type MovieCategory = 'trending' | 'topRated' | 'action' | 'comedy' | 'drama' | 'horror' | 'sciFi' | 'recommended';

export interface MovieFilter {
  genre?: string;
  year?: number;
  rating?: number;
  sortBy?: 'title' | 'releaseDate' | 'voteAverage';
  sortOrder?: 'asc' | 'desc';
}
