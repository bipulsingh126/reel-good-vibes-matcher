import { Movie, MovieCategory, StreamingInfo } from '../types/movie';
import { getUserData } from './userService';

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
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page", "Tom Hardy"],
    streamingUrls: [
      { provider: "Netflix", url: "https://www.netflix.com/title/70131314", quality: "HD", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/Inception-Leonardo-DiCaprio/dp/B0047WJ11G", quality: "4K", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/YoHD9XEInc0"
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
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine"],
    streamingUrls: [
      { provider: "HBO Max", url: "https://www.hbomax.com/the-dark-knight", quality: "4K", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/Dark-Knight-Christian-Bale/dp/B001QOGYBI", quality: "HD", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/EXeTwQWrcwY"
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
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
    streamingUrls: [
      { provider: "Paramount+", url: "https://www.paramountplus.com/movies/interstellar/", quality: "4K", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/Interstellar-Matthew-McConaughey/dp/B00TU9UFTS", quality: "4K", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/zSWdZVtXT7E"
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
    cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth"],
    streamingUrls: [
      { provider: "Disney+", url: "https://www.disneyplus.com/movies/marvel-studios-the-avengers/2h6PcHFDbsPy", quality: "4K", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/Marvels-Avengers-Robert-Downey-Jr/dp/B009GEEMLY", quality: "HD", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/eOrNdBpGMv8"
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
    cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik"],
    streamingUrls: [
      { provider: "Hulu", url: "https://www.hulu.com/movie/parasite-a925cc0b-bfe2-476c-9831-8e41b78eee90", quality: "HD", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/Parasite-English-Subtitled-Kang-Song/dp/B07YM14FRG", quality: "4K", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/5xH0HfJHsaY"
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
  },
  {
    id: 13,
    title: "The Shining",
    overview: "A family heads to an isolated hotel for the winter where a sinister presence influences the father into violence, while his psychic son sees horrific forebodings from both past and future.",
    posterPath: "https://image.tmdb.org/t/p/w500/b6ko0IKC8MdYBBPkkA1aBPLe2yz.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/mmd1HnuvAzFc4iuVJcnBrhDNEKr.jpg",
    releaseDate: "1980-05-23",
    voteAverage: 8.2,
    genres: ["Horror", "Thriller"],
    runtime: 146,
    director: "Stanley Kubrick",
    cast: ["Jack Nicholson", "Shelley Duvall", "Danny Lloyd"],
    streamingUrls: [
      { provider: "HBO Max", url: "https://www.hbomax.com/the-shining", quality: "HD", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/Shining-Jack-Nicholson/dp/B001EBYMIS", quality: "4K", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/S014oGZiSdI"
  },
  {
    id: 14,
    title: "Whiplash",
    overview: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
    posterPath: "https://image.tmdb.org/t/p/w500/6uSPcdGMZnLUQWrp0Jk4SICwvby.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/fRGxZuo7jJUWQsVg9PREb98Aclp.jpg",
    releaseDate: "2014-10-10",
    voteAverage: 8.5,
    genres: ["Drama", "Music"],
    runtime: 106,
    director: "Damien Chazelle",
    cast: ["Miles Teller", "J.K. Simmons", "Melissa Benoist"],
    streamingUrls: [
      { provider: "Netflix", url: "https://www.netflix.com/title/70299275", quality: "HD", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/Whiplash-Miles-Teller/dp/B00QVXGKZM", quality: "HD", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/7d_jQycdQGo"
  },
  {
    id: 15,
    title: "The Social Network",
    overview: "As Harvard student Mark Zuckerberg creates the social networking site that would become known as Facebook, he is sued by the twins who claimed he stole their idea, and by the co-founder who was later squeezed out of the business.",
    posterPath: "https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/1qOA9Re3Mfq8BoWqxZRCZfGKxvQ.jpg",
    releaseDate: "2010-10-01",
    voteAverage: 7.7,
    genres: ["Drama", "History"],
    runtime: 120,
    director: "David Fincher",
    cast: ["Jesse Eisenberg", "Andrew Garfield", "Justin Timberlake"],
    streamingUrls: [
      { provider: "Netflix", url: "https://www.netflix.com/title/70132721", quality: "HD", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/Social-Network-Jesse-Eisenberg/dp/B0041KGYHS", quality: "HD", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/lB95KLmpLR4"
  },
  {
    id: 16,
    title: "Blade Runner 2049",
    overview: "A young blade runner's discovery of a long-buried secret leads him to track down former blade runner Rick Deckard, who's been missing for thirty years.",
    posterPath: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/sAtoMqDVhNDQBc3QJL3RF6hlhGq.jpg",
    releaseDate: "2017-10-06",
    voteAverage: 8.0,
    genres: ["Sci-Fi", "Drama", "Mystery"],
    runtime: 164,
    director: "Denis Villeneuve",
    cast: ["Ryan Gosling", "Harrison Ford", "Ana de Armas"],
    streamingUrls: [
      { provider: "HBO Max", url: "https://www.hbomax.com/blade-runner-2049", quality: "4K", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/Blade-Runner-2049-Harrison-Ford/dp/B076JKZZ9Z", quality: "4K", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/gCcx85zbxz4"
  },
  {
    id: 17,
    title: "The Grand Budapest Hotel",
    overview: "The adventures of Gustave H, a legendary concierge at a famous hotel from the fictional Republic of Zubrowka between the first and second World Wars, and Zero Moustafa, the lobby boy who becomes his most trusted friend.",
    posterPath: "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/ue7d8CWUbkiFUMhw2jGNQbMGHnX.jpg",
    releaseDate: "2014-03-07",
    voteAverage: 8.1,
    genres: ["Comedy", "Drama"],
    runtime: 99,
    director: "Wes Anderson",
    cast: ["Ralph Fiennes", "F. Murray Abraham", "Mathieu Amalric"],
    streamingUrls: [
      { provider: "Disney+", url: "https://www.disneyplus.com/movies/the-grand-budapest-hotel/1ZUoYRVPkjPD", quality: "HD", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/Grand-Budapest-Hotel-Ralph-Fiennes/dp/B00JFF2ZSW", quality: "HD", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/1Fg5iWmQjwk"
  },
  {
    id: 18,
    title: "Eternal Sunshine of the Spotless Mind",
    overview: "When their relationship turns sour, a couple undergoes a medical procedure to have each other erased from their memories.",
    posterPath: "https://image.tmdb.org/t/p/w500/5MwkWH9tYHv3mV9OdYTMR5qreIz.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/7SZ8VrBDZ8k9rZk6K8DNkKlqFXH.jpg",
    releaseDate: "2004-03-19",
    voteAverage: 8.3,
    genres: ["Drama", "Romance", "Sci-Fi"],
    runtime: 108,
    director: "Michel Gondry",
    cast: ["Jim Carrey", "Kate Winslet", "Kirsten Dunst"],
    streamingUrls: [
      { provider: "Peacock", url: "https://www.peacocktv.com/watch/asset/movies/eternal-sunshine-of-the-spotless-mind/9100d41c-51f1-3a0c-89d0-9d2f4d4a3e1b", quality: "HD", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/Eternal-Sunshine-Spotless-Mind-Carrey/dp/B000JFP7JQ", quality: "HD", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/07-QBnEkgXU"
  },
  {
    id: 19,
    title: "Spider-Man: Into the Spider-Verse",
    overview: "Teen Miles Morales becomes the Spider-Man of his universe, and must join with five spider-powered individuals from other dimensions to stop a threat for all realities.",
    posterPath: "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/aUVKEgHC8l6ApWVVpZAvlIgfEyr.jpg",
    releaseDate: "2018-12-14",
    voteAverage: 8.4,
    genres: ["Animation", "Action", "Adventure"],
    runtime: 117,
    director: "Bob Persichetti",
    cast: ["Shameik Moore", "Jake Johnson", "Hailee Steinfeld"],
    streamingUrls: [
      { provider: "Netflix", url: "https://www.netflix.com/title/81002747", quality: "4K", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/Spider-Man-Into-Spider-Verse-Shameik-Moore/dp/B07L9YXWSV", quality: "4K", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/g4Hbz2jLxvQ"
  },
  {
    id: 20,
    title: "The Departed",
    overview: "An undercover cop and a mole in the police attempt to identify each other while infiltrating an Irish gang in South Boston.",
    posterPath: "https://image.tmdb.org/t/p/w500/nT97ifVT2J1yMQmeq8m6WJwBgh.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/jMFLk1EjAVzdqUGtHJMK9HaGN4a.jpg",
    releaseDate: "2006-10-06",
    voteAverage: 8.2,
    genres: ["Crime", "Drama", "Thriller"],
    runtime: 151,
    director: "Martin Scorsese",
    cast: ["Leonardo DiCaprio", "Matt Damon", "Jack Nicholson"],
    streamingUrls: [
      { provider: "HBO Max", url: "https://www.hbomax.com/the-departed", quality: "HD", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/Departed-Leonardo-DiCaprio/dp/B000NQRECA", quality: "HD", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/iojhqm0JTW4"
  },
  {
    id: 21,
    title: "Her",
    overview: "In a near future, a lonely writer develops an unlikely relationship with an operating system designed to meet his every need.",
    posterPath: "https://image.tmdb.org/t/p/w500/eCOtqtfvn7mxGl6nfmq4b1exJRc.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/nyl7z8Mf2PQYhXPQY7HfJEvHDAa.jpg",
    releaseDate: "2013-12-18",
    voteAverage: 8.0,
    genres: ["Drama", "Romance", "Sci-Fi"],
    runtime: 126,
    director: "Spike Jonze",
    cast: ["Joaquin Phoenix", "Scarlett Johansson", "Amy Adams"],
    streamingUrls: [
      { provider: "Netflix", url: "https://www.netflix.com/title/70278933", quality: "HD", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/Her-Joaquin-Phoenix/dp/B00IA3NGB4", quality: "HD", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/WzV6mXIOVl4"
  },
  {
    id: 22,
    title: "The Dark Knight Rises",
    overview: "Eight years after the Joker's reign of anarchy, Batman, with the help of the enigmatic Catwoman, is forced from his exile to save Gotham City from the brutal guerrilla terrorist Bane.",
    posterPath: "https://image.tmdb.org/t/p/w500/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/l8v2FN5TRDNZLjMSqQ9AvN9fK5Q.jpg",
    releaseDate: "2012-07-20",
    voteAverage: 7.8,
    genres: ["Action", "Crime", "Drama"],
    runtime: 165,
    director: "Christopher Nolan",
    cast: ["Christian Bale", "Tom Hardy", "Anne Hathaway"],
    streamingUrls: [
      { provider: "HBO Max", url: "https://www.hbomax.com/the-dark-knight-rises", quality: "4K", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/Dark-Knight-Rises-Christian-Bale/dp/B009LRE040", quality: "4K", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/GokKUqLcvD8"
  },
  {
    id: 23,
    title: "Mad Max: Fury Road",
    overview: "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners, a psychotic worshiper, and a drifter named Max.",
    posterPath: "https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/phszHPFVhPHhMZgo0fWTKBDQsJA.jpg",
    releaseDate: "2015-05-15",
    voteAverage: 8.1,
    genres: ["Action", "Adventure", "Sci-Fi"],
    runtime: 120,
    director: "George Miller",
    cast: ["Tom Hardy", "Charlize Theron", "Nicholas Hoult"],
    streamingUrls: [
      { provider: "HBO Max", url: "https://www.hbomax.com/mad-max-fury-road", quality: "4K", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/Mad-Max-Fury-Road-Hardy/dp/B00XOX9OFK", quality: "4K", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/hEJnMQG9ev8"
  },
  {
    id: 24,
    title: "Moonlight",
    overview: "A young African-American man grapples with his identity and sexuality while experiencing the everyday struggles of childhood, adolescence, and burgeoning adulthood.",
    posterPath: "https://image.tmdb.org/t/p/w500/qAwFbszz0kc7eqp7bV53lVWwDFb.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/A9KPbYTQvWsp51Lgz85ukVkFrKf.jpg",
    releaseDate: "2016-10-21",
    voteAverage: 7.9,
    genres: ["Drama"],
    runtime: 111,
    director: "Barry Jenkins",
    cast: ["Mahershala Ali", "Naomie Harris", "Trevante Rhodes"],
    streamingUrls: [
      { provider: "Netflix", url: "https://www.netflix.com/title/80121348", quality: "HD", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/Moonlight-Mahershala-Ali/dp/B01MXY0VCT", quality: "HD", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/9NJj12tJzqc"
  },
  {
    id: 25,
    title: "Arrival",
    overview: "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.",
    posterPath: "https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/yIZ1xendyqKvY3FGeeUYUd5X9Mm.jpg",
    releaseDate: "2016-11-11",
    voteAverage: 7.9,
    genres: ["Drama", "Sci-Fi"],
    runtime: 116,
    director: "Denis Villeneuve",
    cast: ["Amy Adams", "Jeremy Renner", "Forest Whitaker"],
    streamingUrls: [
      { provider: "Hulu", url: "https://www.hulu.com/movie/arrival-3f4f21e1-1a22-4401-bde0-43e3afd3d73c", quality: "HD", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/Arrival-Amy-Adams/dp/B01M2C4NP8", quality: "4K", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/tFMo3UJ4B4g"
  },
  {
    id: 26,
    title: "Jojo Rabbit",
    overview: "A young boy in Hitler's army finds out his mother is hiding a Jewish girl in their home.",
    posterPath: "https://image.tmdb.org/t/p/w500/7GsM4mtM0worCtIVeiQt28HieeN.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/agoBZfL1q5G79SD0npArSlJn8BH.jpg",
    releaseDate: "2019-10-18",
    voteAverage: 8.0,
    genres: ["Comedy", "Drama", "War"],
    runtime: 108,
    director: "Taika Waititi",
    cast: ["Roman Griffin Davis", "Thomasin McKenzie", "Scarlett Johansson"],
    streamingUrls: [
      { provider: "Disney+", url: "https://www.disneyplus.com/movies/jojo-rabbit/5VpgBrMYXRy4", quality: "HD", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/Jojo-Rabbit-Roman-Griffin-Davis/dp/B07ZPMW19L", quality: "HD", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/tL4McUzXfFI"
  },
  {
    id: 27,
    title: "The Lighthouse",
    overview: "Two lighthouse keepers try to maintain their sanity while living on a remote and mysterious New England island in the 1890s.",
    posterPath: "https://image.tmdb.org/t/p/w500/3nk9UoepYmv1G9oP18q6JJCeYwN.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/42tHxGwyU5KBVK5oYJWZIlQwW85.jpg",
    releaseDate: "2019-10-18",
    voteAverage: 7.5,
    genres: ["Drama", "Fantasy", "Horror"],
    runtime: 109,
    director: "Robert Eggers",
    cast: ["Robert Pattinson", "Willem Dafoe"],
    streamingUrls: [
      { provider: "Amazon Prime", url: "https://www.amazon.com/Lighthouse-Robert-Pattinson/dp/B07ZRNLZKZ", quality: "HD", price: 3.99 },
      { provider: "Netflix", url: "https://www.netflix.com/title/81028394", quality: "HD", subscriptionRequired: true }
    ],
    trailerUrl: "https://www.youtube.com/embed/Hyag7lR8CPA"
  },
  {
    id: 28,
    title: "1917",
    overview: "Two young British soldiers during the First World War are given an impossible mission: deliver a message deep in enemy territory that will stop 1,600 men, and one of the soldiers' brothers, from walking straight into a deadly trap.",
    posterPath: "https://image.tmdb.org/t/p/w500/iZf0KyrE25z1sage4SYFLCCrMi9.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/2WgieNR1tGHlpJUsolbVzbUbE1O.jpg",
    releaseDate: "2019-12-25",
    voteAverage: 8.0,
    genres: ["War", "Drama", "Action"],
    runtime: 119,
    director: "Sam Mendes",
    cast: ["George MacKay", "Dean-Charles Chapman", "Mark Strong"],
    streamingUrls: [
      { provider: "Showtime", url: "https://www.showtime.com/movies/1917", quality: "4K", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/1917-George-MacKay/dp/B082PNXVFG", quality: "4K", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/YqNYrYUiMfg"
  },
  {
    id: 29,
    title: "Knives Out",
    overview: "A detective investigates the death of a patriarch of an eccentric, combative family.",
    posterPath: "https://image.tmdb.org/t/p/w500/pThyQovXQrw2m0s9x82twj48Jq4.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/4HWAQu28e2yaWrtupFPGFkdNU7V.jpg",
    releaseDate: "2019-11-27",
    voteAverage: 7.9,
    genres: ["Comedy", "Crime", "Drama"],
    runtime: 131,
    director: "Rian Johnson",
    cast: ["Daniel Craig", "Chris Evans", "Ana de Armas"],
    streamingUrls: [
      { provider: "Amazon Prime", url: "https://www.amazon.com/Knives-Out-Daniel-Craig/dp/B07ZPTFJLM", quality: "4K", price: 3.99 },
      { provider: "Netflix", url: "https://www.netflix.com/title/81037684", quality: "4K", subscriptionRequired: true }
    ],
    trailerUrl: "https://www.youtube.com/embed/qGqiHJTsRkQ"
  },
  {
    id: 30,
    title: "Soul",
    overview: "A musician who has lost his passion for music is transported out of his body and must find his way back with the help of an infant soul learning about herself.",
    posterPath: "https://image.tmdb.org/t/p/w500/hm58Jw4Lw8OIeECIq5qyPYhAeRJ.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/kf456ZqeC45XTvo6W9pW5clYKfQ.jpg",
    releaseDate: "2020-12-25",
    voteAverage: 8.3,
    genres: ["Animation", "Comedy", "Drama"],
    runtime: 100,
    director: "Pete Docter",
    cast: ["Jamie Foxx", "Tina Fey", "Graham Norton"],
    streamingUrls: [
      { provider: "Disney+", url: "https://www.disneyplus.com/movies/soul/77zlWrb9vRYp", quality: "4K", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/Soul-Jamie-Foxx/dp/B08KQBY2QF", quality: "4K", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/xOsLIiBStEs"
  },
  {
    id: 31,
    title: "Dune",
    overview: "A noble family becomes embroiled in a war for control over the galaxy's most valuable asset while its heir becomes troubled by visions of a dark future.",
    posterPath: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/aknvFyJUQQoZFtmFnYzKi4vGv4J.jpg",
    releaseDate: "2021-10-22",
    voteAverage: 8.0,
    genres: ["Science Fiction", "Adventure"],
    runtime: 155,
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Rebecca Ferguson", "Oscar Isaac"],
    streamingUrls: [
      { provider: "HBO Max", url: "https://www.hbomax.com/dune", quality: "4K", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/Dune-Timoth%C3%A9e-Chalamet/dp/B09JNKGZ2S", quality: "4K", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/8g18jFHCLXk",
    isPremium: true,
    rentalPrice: 5.99,
    purchasePrice: 19.99
  },
  {
    id: 32,
    title: "Everything Everywhere All at Once",
    overview: "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save the world by exploring other universes connecting with the lives she could have led.",
    posterPath: "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/zxJJ3rzsZWm4IYj0vjuGOECULAq.jpg",
    releaseDate: "2022-03-25",
    voteAverage: 8.3,
    genres: ["Action", "Adventure", "Science Fiction"],
    runtime: 139,
    director: "Daniel Kwan, Daniel Scheinert",
    cast: ["Michelle Yeoh", "Stephanie Hsu", "Ke Huy Quan"],
    streamingUrls: [
      { provider: "Showtime", url: "https://www.showtime.com/movies/everything-everywhere-all-at-once", quality: "4K", subscriptionRequired: true },
      { provider: "Amazon Prime", url: "https://www.amazon.com/Everything-Everywhere-Once-Michelle-Yeoh/dp/B09WV3KCQY", quality: "4K", price: 3.99 }
    ],
    trailerUrl: "https://www.youtube.com/embed/wxN1T1uxQ2g",
    isPremium: true,
    rentalPrice: 6.99,
    purchasePrice: 24.99
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
    case 'premium':
      return movies.filter(movie => movie.isPremium);
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

export const getPremiumMovies = (): Movie[] => {
  return movies.filter(movie => movie.isPremium);
};

/**
 * Get personalized movie recommendations for a user based on their preferences and history
 * @param userId The ID of the user to get recommendations for
 * @returns Array of recommended movies with relevance scores
 */
export const getPersonalizedRecommendations = (userId: string): { movie: Movie, relevanceScore: number }[] => {
  try {
    // Get user data
    const userData = getUserData(userId);
    if (!userData) return [];
    
    // Initialize scoring factors
    const genrePreferences = userData.preferences?.favoriteGenres || [];
    const watchedMovies = [...userData.purchasedMovies, ...userData.rentedMovies].map(m => m.movieId);
    const watchlist = userData.watchlist || [];
    
    // Calculate scores for each movie
    const scoredMovies = movies.map(movie => {
      // Skip movies the user has already watched
      if (watchedMovies.includes(movie.id)) {
        return null;
      }
      
      let score = 0;
      
      // Genre match (up to 5 points)
      const genreMatchCount = movie.genres.filter(genre => 
        genrePreferences.includes(genre)
      ).length;
      score += genreMatchCount * 1.5;
      
      // Director match with previously watched movies (3 points)
      const watchedDirectors = new Set(
        movies
          .filter(m => watchedMovies.includes(m.id))
          .map(m => m.director)
      );
      if (watchedDirectors.has(movie.director)) {
        score += 3;
      }
      
      // Cast match with previously watched movies (up to 2 points)
      const watchedCast = new Set(
        movies
          .filter(m => watchedMovies.includes(m.id))
          .flatMap(m => m.cast)
      );
      const castMatchCount = movie.cast.filter(actor => watchedCast.has(actor)).length;
      score += Math.min(castMatchCount, 2);
      
      // Rating boost (up to 2 points)
      score += (movie.voteAverage / 10) * 2;
      
      // Similar to watchlist items (up to 3 points)
      const watchlistGenres = new Set(
        movies
          .filter(m => watchlist.includes(m.id))
          .flatMap(m => m.genres)
      );
      const watchlistGenreMatch = movie.genres.filter(genre => watchlistGenres.has(genre)).length;
      score += watchlistGenreMatch * 0.5;
      
      // Recency boost (up to 1 point)
      const currentYear = new Date().getFullYear();
      const movieYear = parseInt(movie.releaseDate.split('-')[0]);
      const yearDiff = currentYear - movieYear;
      if (yearDiff <= 2) {
        score += 1;
      } else if (yearDiff <= 5) {
        score += 0.5;
      }
      
      return { movie, relevanceScore: parseFloat(score.toFixed(2)) };
    }).filter(Boolean) as { movie: Movie, relevanceScore: number }[];
    
    // Sort by relevance score (highest first)
    return scoredMovies.sort((a, b) => b.relevanceScore - a.relevanceScore);
  } catch (error) {
    console.error('Failed to get personalized recommendations:', error);
    return [];
  }
};
