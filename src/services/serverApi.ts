import { cache } from "react";
import { MovieDetails } from "../types";
import { api } from "./api";

/**
 * Server-only utility to fetch details for a movie or TV show.
 * First queries the live TMDB database if TMDB_ACCESS_TOKEN is configured,
 * otherwise falls back to the local high-fidelity fallback catalogs.
 * Wrapped in React cache to prevent duplicate fetches across metadata and page render.
 */
export const getMediaDetailsServer = cache(async (
  id: number,
  type: "movie" | "tv"
): Promise<MovieDetails | null> => {
  const token = process.env.TMDB_ACCESS_TOKEN;
  const baseUrl = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";

  if (token) {
    try {
      const url = `${baseUrl}/${type}/${id}?append_to_response=credits,videos,similar`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(2500),
        next: { revalidate: 86400 }, // cache for 24 hours
      });

      if (res.ok) {
        const data = await res.json();
        return data as MovieDetails;
      } else {
        console.warn(
          `[Server API] Live fetch returned status ${res.status} for ${type}/${id}`
        );
      }
    } catch (err) {
      console.error(`[Server API] Error fetching live ${type}/${id}:`, err);
    }
  }

  // Fallback lookup if TMDB_ACCESS_TOKEN is missing or if the API request fails
  if (type === "tv") {
    const fallbacks = api.getFallbackSeries();
    const found = fallbacks.find((m) => m.id === id);
    if (found) {
      return {
        ...found,
        credits: { cast: [] },
        videos: { results: [] },
        similar: { results: [] },
      } as MovieDetails;
    }
  } else {
    const fallbacks = api.getFallbackMovies();
    const found = fallbacks.find((m) => m.id === id);
    if (found) {
      return {
        ...found,
        credits: { cast: [] },
        videos: { results: [] },
        similar: { results: [] },
      } as MovieDetails;
    }
  }

  return null;
});

