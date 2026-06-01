import React, { useState, useEffect } from "react";
import { Movie, Genre } from "../types";
import { api } from "../services/api";
import { Compass, Film, Star, Loader2, AlertCircle } from "lucide-react";

interface BrowseViewProps {
  onMovieClick: (movie: Movie) => void;
}

export const BrowseView: React.FC<BrowseViewProps> = ({ onMovieClick }) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [activeGenreId, setActiveGenreId] = useState<number | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Load genres
  useEffect(() => {
    const fetchGenres = async () => {
      setIsLoadingGenres(true);
      try {
        const res = await api.getGenres();
        setGenres(res.genres || []);
        if (res.genres && res.genres.length > 0) {
          setActiveGenreId(res.genres[0].id);
        }
      } catch (err: any) {
        console.warn("Using offline genres data");
        const defaultGenres = api.getFallbackGenres();
        setGenres(defaultGenres);
        if (defaultGenres.length > 0) {
          setActiveGenreId(defaultGenres[0].id);
        }
      } finally {
        setIsLoadingGenres(false);
      }
    };
    fetchGenres();
  }, []);

  // Fetch movies for active genre
  useEffect(() => {
    if (activeGenreId === null) return;

    const fetchMoviesByGenre = async () => {
      setIsLoadingMovies(true);
      setErrorText(null);
      try {
        const res = await api.discoverMovies(activeGenreId);
        setMovies(res.results || []);
      } catch (err: any) {
        console.warn("Using offline movies filtering by genre");
        // Offline custom tagging filters
        const mockList = api.getFallbackMovies();
        const filtered = mockList.filter(m => {
          // If movie has genre object array:
          if (m.genres) return m.genres.some(g => g.id === activeGenreId);
          // If movie has genre_ids number array:
          if (m.genre_ids) return m.genre_ids.includes(activeGenreId);
          return true; // fallback
        });
        setMovies(filtered.length > 0 ? filtered : mockList.slice(0, 4));
      } finally {
        setIsLoadingMovies(false);
      }
    };

    fetchMoviesByGenre();
  }, [activeGenreId]);

  if (isLoadingGenres) {
    return (
      <div id="browse-loading" className="min-h-[60vh] w-full flex items-center justify-center flex-col gap-3">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        <span className="text-sm font-semibold tracking-wide text-slate-400">Syncing TMDB catalog genres...</span>
      </div>
    );
  }

  return (
    <div id="browse-view-container" className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto animate-[fadeIn_0.4s_ease-out]">
      
      {/* Title block */}
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-[#f8fafc] text-lg font-black tracking-widest flex items-center gap-2 uppercase">
          <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
          Browse Categories
        </h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">
          Filter our vast catalog using standard TMDB metadata tags.
        </p>
      </div>

      {/* Genres pill list buttons */}
      <div 
        id="genres-scroll-container" 
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-4 border-b border-purple-500/10 mb-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {genres.map((g) => {
          const isActive = activeGenreId === g.id;
          return (
            <button
              key={g.id}
              id={`genre-pill-${g.id}`}
              onClick={() => setActiveGenreId(g.id)}
              className={`px-4.5 py-2 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                isActive 
                  ? "bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 scale-102"
                  : "bg-[#0d0a1b] hover:bg-white/5 border border-purple-500/5 text-slate-400 hover:text-white"
              }`}
            >
              {g.name}
            </button>
          );
        })}
      </div>

      {/* Movie Results Grid */}
      {isLoadingMovies ? (
        <div id="genre-movies-loading" className="min-h-[30vh] w-full flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
        </div>
      ) : movies.length === 0 ? (
        <div id="genre-movies-empty" className="min-h-[30vh] w-full flex flex-col items-center justify-center gap-3 text-slate-400 text-sm">
          <AlertCircle className="w-8 h-8 text-slate-500" />
          <span>No streams currently classified under this category.</span>
        </div>
      ) : (
        <div 
          id="genre-movies-grid" 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          {movies.map((m) => {
            const yearVal = m.release_date 
              ? m.release_date.split("-")[0] 
              : (m.first_air_date ? m.first_air_date.split("-")[0] : "2026");
            const posterUrl = m.poster_path
              ? (m.poster_path.startsWith("http") 
                 ? m.poster_path 
                 : `https://image.tmdb.org/t/p/w342${m.poster_path}`)
              : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=342";

            return (
              <div
                key={m.id}
                id={`browse-grid-movie-${m.id}`}
                onClick={() => onMovieClick(m)}
                className="group cursor-pointer flex flex-col gap-2 bg-[#0d0a1b]/40 rounded-2xl overflow-hidden border border-purple-500/5 hover:border-violet-500/50 hover:bg-purple-950/20 transition-all duration-300"
              >
                {/* Media frame */}
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
                  <img
                    src={posterUrl}
                    alt={m.title || m.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Hover dark details layer */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050110] via-transparent to-transparent opacity-60 z-1" />
                  
                  {/* Rating badge */}
                  <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/75 backdrop-blur-sm border border-stone-800 text-amber-400 flex items-center gap-0.5">
                    ★ {m.vote_average.toFixed(1)}
                  </div>
                </div>

                {/* Meta details */}
                <div className="p-3 pt-1">
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-violet-400 transition-colors truncate">
                    {m.title || m.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase font-mono">
                    Air Year: {yearVal}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
