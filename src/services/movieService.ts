
import { Movie, MovieCategory } from '../types/movie';

// Mock movie data
const movies: Movie[] = [
  {
    id: 1,
    title: "Inception",
    overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    posterPath: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
    releaseDate: "2010-07-16",
    voteAverage: 8.4,
    genres: ["Action", "Sci-Fi", "Thriller"],
    runtime: 148,
    director: "Christopher Nolan",
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page", "Tom Hardy"]
  },
  {
    id: 2,
    title: "The Dark Knight",
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    posterPath: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg",
    releaseDate: "2008-07-18",
    voteAverage: 9.0,
    genres: ["Action", "Crime", "Drama"],
    runtime: 152,
    director: "Christopher Nolan",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine"]
  },
  {
    id: 3,
    title: "Interstellar",
    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    posterPath: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg",
    releaseDate: "2014-11-07",
    voteAverage: 8.6,
    genres: ["Adventure", "Drama", "Sci-Fi"],
    runtime: 169,
    director: "Christopher Nolan",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"]
  },
  {
    id: 4,
    title: "The Avengers",
    overview: "Earth's mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki and his alien army from enslaving humanity.",
    posterPath: "https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg",
    releaseDate: "2012-05-04",
    voteAverage: 8.0,
    genres: ["Action", "Adventure", "Sci-Fi"],
    runtime: 143,
    director: "Joss Whedon",
    cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth"]
  },
  {
    id: 5,
    title: "Parasite",
    overview: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    posterPath: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg",
    releaseDate: "2019-10-11",
    voteAverage: 8.5,
    genres: ["Comedy", "Drama", "Thriller"],
    runtime: 132,
    director: "Bong Joon-ho",
    cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik"]
  },
  {
    id: 6,
    title: "The Shawshank Redemption",
    overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    posterPath: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
    releaseDate: "1994-10-14",
    voteAverage: 8.7,
    genres: ["Drama"],
    runtime: 142,
    director: "Frank Darabont",
    cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"]
  },
  {
    id: 7,
    title: "The Godfather",
    overview: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    posterPath: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", 
    backdropPath: "https://image.tmdb.org/t/p/original/rSPw7tgCH9c6NqICZef4kZjFOQ5.jpg",
    releaseDate: "1972-03-24",
    voteAverage: 8.7,
    genres: ["Crime", "Drama"],
    runtime: 175,
    director: "Francis Ford Coppola",
    cast: ["Marlon Brando", "Al Pacino", "James Caan"]
  },
  {
    id: 8,
    title: "Pulp Fiction",
    overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    posterPath: "https://image.tmdb.org/t/p/w500/plnlrtBUULT0rh3Xsjmpubiso3L.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    releaseDate: "1994-10-14",
    voteAverage: 8.5,
    genres: ["Crime", "Drama", "Thriller"],
    runtime: 154,
    director: "Quentin Tarantino",
    cast: ["John Travolta", "Uma Thurman", "Samuel L. Jackson"]
  },
  {
    id: 9,
    title: "The Matrix",
    overview: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    posterPath: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg",
    releaseDate: "1999-03-31",
    voteAverage: 8.2,
    genres: ["Action", "Sci-Fi"],
    runtime: 136,
    director: "Lana Wachowski",
    cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"]
  },
  {
    id: 10,
    title: "Joker",
    overview: "In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society. He then embarks on a downward spiral of revolution and bloody crime. This path brings him face-to-face with his alter-ego: the Joker.",
    posterPath: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/n6bUvigpRFqSwmPp1m2YADdbRBc.jpg",
    releaseDate: "2019-10-04",
    voteAverage: 8.2,
    genres: ["Crime", "Drama", "Thriller"],
    runtime: 122,
    director: "Todd Phillips",
    cast: ["Joaquin Phoenix", "Robert De Niro", "Zazie Beetz"]
  },
  {
    id: 11,
    title: "Get Out",
    overview: "A young African-American visits his white girlfriend's parents for the weekend, where his simmering uneasiness about their reception of him eventually reaches a boiling point.",
    posterPath: "https://image.tmdb.org/t/p/w500/qbaIHiCXpj9jY2uQvWI9PBzlG8h.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/tXfGiJSuLEOfQDNRGQWiJjXQfJ2.jpg",
    releaseDate: "2017-02-24",
    voteAverage: 7.7,
    genres: ["Horror", "Mystery", "Thriller"],
    runtime: 104,
    director: "Jordan Peele",
    cast: ["Daniel Kaluuya", "Allison Williams", "Bradley Whitford"]
  },
  {
    id: 12,
    title: "La La Land",
    overview: "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.",
    posterPath: "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/nadTlnTE6DdgmYsN4iWc2a2wiaI.jpg",
    releaseDate: "2016-12-09",
    voteAverage: 8.0,
    genres: ["Comedy", "Drama", "Romance", "Music"],
    runtime: 128,
    director: "Damien Chazelle",
    cast: ["Ryan Gosling", "Emma Stone", "John Legend"]
  }
];

export const getMoviesByCategory = (category: MovieCategory): Movie[] => {
  switch (category) {
    case 'trending':
      return [...movies].sort(() => 0.5 - Math.random()).slice(0, 5);
    case 'topRated':
      return [...movies].sort((a, b) => b.voteAverage - a.voteAverage).slice(0, 5);
    case 'action':
      return movies.filter(movie => movie.genres.includes('Action')).slice(0, 5);
    case 'comedy':
      return movies.filter(movie => movie.genres.includes('Comedy')).slice(0, 5);
    case 'drama':
      return movies.filter(movie => movie.genres.includes('Drama')).slice(0, 5);
    case 'horror':
      return movies.filter(movie => movie.genres.includes('Horror')).slice(0, 5);
    case 'sciFi':
      return movies.filter(movie => movie.genres.includes('Sci-Fi')).slice(0, 5);
    default:
      return movies.slice(0, 5);
  }
};

export const getMovieById = (id: number): Movie | undefined => {
  return movies.find(movie => movie.id === id);
};

export const searchMovies = (query: string): Movie[] => {
  const lowercaseQuery = query.toLowerCase();
  return movies.filter(movie => 
    movie.title.toLowerCase().includes(lowercaseQuery) || 
    movie.overview.toLowerCase().includes(lowercaseQuery) ||
    movie.genres.some(genre => genre.toLowerCase().includes(lowercaseQuery))
  );
};

export const getRecommendedMovies = (movieId: number): Movie[] => {
  const movie = getMovieById(movieId);
  if (!movie) return [];
  
  // Get movies with similar genres
  const similarGenreMovies = movies.filter(m => 
    m.id !== movieId && 
    m.genres.some(genre => movie.genres.includes(genre))
  );
  
  // Sort by number of matching genres and vote average
  return similarGenreMovies
    .sort((a, b) => {
      const aMatchingGenres = a.genres.filter(genre => movie.genres.includes(genre)).length;
      const bMatchingGenres = b.genres.filter(genre => movie.genres.includes(genre)).length;
      
      if (bMatchingGenres !== aMatchingGenres) {
        return bMatchingGenres - aMatchingGenres;
      }
      
      return b.voteAverage - a.voteAverage;
    })
    .slice(0, 4);
};
