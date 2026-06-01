import { Movie, Genre, MovieDetails } from "../types";

/**
 * Standalone helper to execute a proxied TMDB endpoint with search queries
 */
async function fetchFromProxy<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      query.append(key, String(val));
    }
  });

  const queryString = query.toString();
  const url = `/api/tmdb/${endpoint}${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Proxy error: status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

/**
 * TMDB API Service client proxying requests through our full-stack Express server.
 */
export const api = {
  /**
   * Gets trending movies & TV shows
   */
  async getTrending(page = 1): Promise<{ results: Movie[] }> {
    return fetchFromProxy<{ results: Movie[] }>("trending/all/day", { page });
  },

  /**
   * Gets now playing movies
   */
  async getNowPlaying(page = 1): Promise<{ results: Movie[] }> {
    return fetchFromProxy<{ results: Movie[] }>("movie/now_playing", { page });
  },

  /**
   * Gets popular movies
   */
  async getPopular(page = 1): Promise<{ results: Movie[] }> {
    return fetchFromProxy<{ results: Movie[] }>("movie/popular", { page });
  },

  /**
   * Gets top rated movies
   */
  async getTopRated(page = 1): Promise<{ results: Movie[] }> {
    return fetchFromProxy<{ results: Movie[] }>("movie/top_rated", { page });
  },

  /**
   * Gets upcoming movies
   */
  async getUpcoming(page = 1): Promise<{ results: Movie[] }> {
    return fetchFromProxy<{ results: Movie[] }>("movie/upcoming", { page });
  },

  /**
   * Gets list of movie/show genres
   */
  async getGenres(): Promise<{ genres: Genre[] }> {
    return fetchFromProxy<{ genres: Genre[] }>("genre/movie/list");
  },

  /**
   * Discovers movies by genre IDs or other specifications
   */
  async discoverMovies(genreId: number, page = 1): Promise<{ results: Movie[] }> {
    return fetchFromProxy<{ results: Movie[] }>("discover/movie", {
      with_genres: genreId,
      sort_by: "popularity.desc",
      page,
    });
  },

  /**
   * Searches for movies/TV shows by keyword query
   */
  async search(query: string, page = 1): Promise<{ results: Movie[] }> {
    return fetchFromProxy<{ results: Movie[] }>("search/movie", {
      query,
      page,
    });
  },

  /**
   * Gets all-inclusive details for a specific movie: details, credits, videos, and similar
   */
  async getMovieDetails(id: number): Promise<MovieDetails> {
    return fetchFromProxy<MovieDetails>(`movie/${id}`, {
      append_to_response: "credits,videos,similar",
    });
  },

  /**
   * Gets all-inclusive details for a specific TV show
   */
  async getTVDetails(id: number): Promise<MovieDetails> {
    return fetchFromProxy<MovieDetails>(`tv/${id}`, {
      append_to_response: "credits,videos,similar",
    });
  },

  /**
   * Gets trending TV shows
   */
  async getTrendingTV(page = 1): Promise<{ results: Movie[] }> {
    return fetchFromProxy<{ results: Movie[] }>("trending/tv/day", { page });
  },

  /**
   * Gets popular TV shows
   */
  async getPopularTV(page = 1): Promise<{ results: Movie[] }> {
    return fetchFromProxy<{ results: Movie[] }>("tv/popular", { page });
  },

  /**
   * Gets top rated TV shows
   */
  async getTopRatedTV(page = 1): Promise<{ results: Movie[] }> {
    return fetchFromProxy<{ results: Movie[] }>("tv/top_rated", { page });
  },

  /**
   * Discovers TV shows by genre ID
   */
  async discoverTV(genreId: number, page = 1): Promise<{ results: Movie[] }> {
    return fetchFromProxy<{ results: Movie[] }>("discover/tv", {
      with_genres: genreId,
      sort_by: "popularity.desc",
      page,
    });
  },

  /**
   * Fallback mock database items just in case the TMDB token is missing or fails.
   * This provides a complete, polished, beautiful viewing experience that resembles Bitcine.
   */
  getFallbackMovies(): Movie[] {
    return [
      {
        id: 1,
        title: "Celestial Echoes",
        overview: "An astrophysicist discovers a rhythmic signal from the Andromeda galaxy that predates the Big Bang, triggering a global race to decipher humanity's origin and destiny.",
        backdrop_path: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=1200",
        poster_path: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=300",
        vote_average: 9.4,
        release_date: "2026-06-01",
        tagline: "Pre-dating the cosmos.",
        runtime: 145,
        genres: [{ id: 878, name: "Science Fiction" }, { id: 9648, name: "Mystery" }]
      },
      {
        id: 2,
        title: "BACKROOMS",
        overview: "A strange doorway appears in the basement of a furniture showroom, leading to a sprawling golden-tinted labyrinth of endless empty rooms and static office lighting.",
        backdrop_path: "https://images.unsplash.com/photo-1601514332822-1efcd8efddb1?q=80&w=1600",
        poster_path: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600",
        vote_average: 6.7,
        release_date: "2026-04-18",
        tagline: "Endless rooms. No escape.",
        runtime: 114,
        genres: [{ id: 27, name: "Horror" }, { id: 9648, name: "Mystery" }]
      },
      {
        id: 3,
        title: "Interstellar: Beyond Time",
        overview: "Mankind was born on Earth. It was never meant to die here. In a future where dust bowls ravage cities, scientists look beyond space and time for answers.",
        backdrop_path: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600",
        poster_path: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=600",
        vote_average: 8.6,
        release_date: "2014-11-07",
        tagline: "The end of Earth will not be the end of us.",
        runtime: 169,
        genres: [{ id: 878, name: "Science Fiction" }, { id: 18, name: "Drama" }]
      },
      {
        id: 4,
        title: "The Neon Abyss",
        overview: "A futuristic hacker uncovers an underground syndicate running cybernetic illegal battles under the dark, neon-soaked rain towers of Neo-Shinjuku.",
        backdrop_path: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600",
        poster_path: "https://images.unsplash.com/photo-1535016120720-40c646be5580?q=80&w=600",
        vote_average: 7.9,
        release_date: "2025-09-12",
        tagline: "In the depth of neon, secrets glow.",
        runtime: 128,
        genres: [{ id: 28, name: "Action" }, { id: 878, name: "Science Fiction" }]
      },
      {
        id: 5,
        title: "Dune: Prophecy Of Sand",
        overview: "Paul Atreides unites the Fremen in a holy war of destiny across the desert world of Arrakis to block the imperial spice trade and conquer the emperor.",
        backdrop_path: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1600",
        poster_path: "https://images.unsplash.com/photo-1547483238-f400e65ccd56?q=80&w=600",
        vote_average: 8.4,
        release_date: "2024-03-01",
        tagline: "Long live the fighters.",
        runtime: 166,
        genres: [{ id: 12, name: "Adventure" }, { id: 878, name: "Science Fiction" }]
      },
      {
        id: 6,
        title: "Cyberpunk: Edgerunners",
        overview: "A street kid trying to survive on the streets of Night City — a technology-crazed and body-modification-obsessed city of the future — decides to become an outlaw mercenary.",
        backdrop_path: "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?q=80&w=1600",
        poster_path: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600",
        vote_average: 8.5,
        release_date: "2022-09-13",
        tagline: "High tech. Low life.",
        runtime: 24,
        genres: [{ id: 16, name: "Animation" }, { id: 878, name: "Science Fiction" }]
      },
      {
        id: 7,
        title: "The Quiet Place Part III",
        overview: "Following the deadly events at home, the Abbott family must now face the terrors of the outside world as they continue their fight for survival in silence.",
        backdrop_path: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600",
        poster_path: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600",
        vote_average: 7.2,
        release_date: "2025-06-20",
        tagline: "Listen closely. Survive silently.",
        runtime: 99,
        genres: [{ id: 27, name: "Horror" }, { id: 53, name: "Thriller" }]
      },
      {
        id: 8,
        title: "Shadows Of Kyoto",
        overview: "A disgraced former samurai is recruited for one last mission: tracking down a rogue master assassin hiding in the golden temples of Kyoto's imperial guard.",
        backdrop_path: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1600",
        poster_path: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=600",
        vote_average: 7.8,
        release_date: "2025-11-20",
        tagline: "Honor demands blood.",
        runtime: 132,
        genres: [{ id: 28, name: "Action" }, { id: 18, name: "Drama" }]
      },
      {
        id: 9,
        title: "Spirited Away: Sequel Chronicles",
        overview: "Ten years later, Chihiro inadvertently crosses the threshold back to the mysterious spirit realm of the gods, only to find the bathhouse facing a cosmic takeover.",
        backdrop_path: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600",
        poster_path: "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=600",
        vote_average: 8.8,
        release_date: "2026-01-10",
        tagline: "Return to the world of gods.",
        runtime: 125,
        genres: [{ id: 16, name: "Animation" }, { id: 14, name: "Fantasy" }]
      }
    ];
  },

  getFallbackSeries(): Movie[] {
    return [
      {
        id: 201,
        name: "Andromeda Chronicles",
        overview: "Mysterious acoustic signals discovered embedded deep within cosmic background radiation spark a global mission to contact the unknown creators.",
        backdrop_path: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1600",
        poster_path: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600",
        vote_average: 9.1,
        first_air_date: "2026-05-12",
        tagline: "Are we truly alone?",
        runtime: 45,
        genres: [{ id: 878, name: "Science Fiction" }, { id: 9648, name: "Mystery" }]
      },
      {
        id: 202,
        name: "Stranger Mysteries",
        overview: "A young boy vanishes into thin air. As friends, family and local police search for answers, they are drawn into an extraordinary mystery involving top-secret government experiments.",
        backdrop_path: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600",
        poster_path: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=300",
        vote_average: 8.7,
        first_air_date: "2016-07-15",
        tagline: "One door can change everything.",
        runtime: 50,
        genres: [{ id: 9648, name: "Mystery" }, { id: 18, name: "Drama" }]
      },
      {
        id: 203,
        name: "The Frontier Colony",
        overview: "Humanity's first colony ship lands on an extra-solar planet only to discover that the thriving ecosystem contains spores that rewrite biological hosts' memories.",
        backdrop_path: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600",
        poster_path: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=300",
        vote_average: 8.2,
        first_air_date: "2025-10-09",
        tagline: "Explore. Adapt. Survive.",
        runtime: 48,
        genres: [{ id: 878, name: "Science Fiction" }, { id: 12, name: "Adventure" }]
      },
      {
        id: 204,
        name: "Silicon Dynasty",
        overview: "Two rival artificial intelligence laboratories enter a fierce corporate espionage war to launch the first sentient, human-interactive mechanical avatar.",
        backdrop_path: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600",
        poster_path: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=300",
        vote_average: 8.0,
        first_air_date: "2026-02-14",
        tagline: "Consciousness has a competitor.",
        runtime: 60,
        genres: [{ id: 878, name: "Science Fiction" }, { id: 18, name: "Drama" }]
      },
      {
        id: 205,
        name: "Gothic Shadows",
        overview: "An investigator of paranormal activities is summoned to a remote coastal Victorian town to probe unexplained disappearances that align with ocean tides.",
        backdrop_path: "https://images.unsplash.com/photo-1601514332822-1efcd8efddb1?q=80&w=1600",
        poster_path: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=300",
        vote_average: 7.9,
        first_air_date: "2025-12-05",
        tagline: "The sea holds the toll.",
        runtime: 42,
        genres: [{ id: 27, name: "Horror" }, { id: 9648, name: "Mystery" }]
      }
    ];
  },
  getFallbackGenres(): Genre[] {
    return [
      { id: 28, name: "Action" },
      { id: 12, name: "Adventure" },
      { id: 16, name: "Animation" },
      { id: 35, name: "Comedy" },
      { id: 80, name: "Crime" },
      { id: 99, name: "Documentary" },
      { id: 18, name: "Drama" },
      { id: 10751, name: "Family" },
      { id: 14, name: "Fantasy" },
      { id: 36, name: "History" },
      { id: 27, name: "Horror" },
      { id: 10402, name: "Music" },
      { id: 9648, name: "Mystery" },
      { id: 10749, name: "Romance" },
      { id: 878, name: "Science Fiction" },
      { id: 10770, name: "TV Movie" },
      { id: 53, name: "Thriller" },
      { id: 10752, name: "War" },
      { id: 37, name: "Western" }
    ];
  }
};
