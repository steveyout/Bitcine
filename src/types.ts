/**
 * Strong types for TMDB and Bitcine Streaming Client
 */

export interface Movie {
  id: number;
  title?: string;
  name?: string; // TV shows use name instead of title
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number;
  tagline?: string;
  original_language?: string;
  origin_country?: string[];
  popularity?: number;
  vote_count?: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string; // e.g. "Trailer", "Teaser", "Clip"
  official: boolean;
}

export interface Season {
  id: number;
  season_number: number;
  episode_count: number;
  name: string;
  poster_path: string | null;
}

export interface MovieDetails extends Movie {
  credits?: {
    cast: CastMember[];
  };
  videos?: {
    results: Video[];
  };
  similar?: {
    results: Movie[];
  };
  number_of_seasons?: number;
  seasons?: Season[];
}

export type ActiveTab = 'home' | 'browse' | 'api' | 'search';
