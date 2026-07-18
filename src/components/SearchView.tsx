import React, { useState, useEffect } from "react";
import { Movie } from "../types";
import { api } from "../services/api";
import { Search, Popcorn, Star, Loader2, Compass } from "lucide-react";

interface SearchViewProps {
  onMovieClick: (movie: Movie) => void;
  initialQuery?: string;
  onSearchChange?: (newQuery: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ 
  onMovieClick,
  initialQuery = "",
  onSearchChange
}) => {
  const [query, setQuery] = useState(initialQuery);

  // Sync state if initialQuery changes dynamically
  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Bubble search query updates up for URL synchronization
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(query);
    }
  }, [query, onSearchChange]);
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "movie" | "tv">("all");

  // Trigger search with small debounce delay
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await api.search(query.trim());
        setResults(res.results || []);
      } catch (err: any) {
        console.warn("Using offline search filtering criteria");
        // Search locally in both movie and series mocks if offline/TMDB fails
        const mockMovies = api.getFallbackMovies().map(m => ({ ...m, media_type: "movie" }));
        const mockSeries = api.getFallbackSeries().map(s => ({ ...s, media_type: "tv" }));
        const mockList = [...mockMovies, ...mockSeries];
        const filtered = mockList.filter((m) => {
          const stringToMatch = `${m.title || ""} ${m.name || ""} ${m.overview || ""}`.toLowerCase();
          return stringToMatch.includes(query.toLowerCase());
        });
        setResults(filtered);
      } finally {
        setIsLoading(false);
        // Track the successful search query in Google Analytics
        if (typeof (window as any).gtag === "function") {
          (window as any).gtag("event", "search", {
            search_term: query.trim()
          });
        }
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Handle immediate search button click
  const handlePerformSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const res = await api.search(query.trim());
      setResults(res.results || []);
    } catch (err: any) {
      // Search locally in both movie and series mocks if offline/TMDB fails
      const mockMovies = api.getFallbackMovies().map(m => ({ ...m, media_type: "movie" }));
      const mockSeries = api.getFallbackSeries().map(s => ({ ...s, media_type: "tv" }));
      const mockList = [...mockMovies, ...mockSeries];
      const filtered = mockList.filter((m) => {
        const stringToMatch = `${m.title || ""} ${m.name || ""} ${m.overview || ""}`.toLowerCase();
        return stringToMatch.includes(query.toLowerCase());
      });
      setResults(filtered);
    } finally {
      setIsLoading(false);
      // Track instant manual search in Google Analytics
      if (typeof (window as any).gtag === "function") {
        (window as any).gtag("event", "search", {
          search_term: query.trim()
        });
      }
    }
  };

  // Filter display results based on the active media selection
  const displayedResults = results.filter((m) => {
    // Exclude TMDB 'person' type
    if (m.media_type === "person") return false;

    // Detect if TV Series
    const isItemTV = m.media_type === "tv" || !!m.first_air_date || (!!m.name && !m.title);
    const itemType = isItemTV ? "tv" : "movie";

    if (filterType === "all") return true;
    return itemType === filterType;
  });

  return (
    <div id="search-view-panel" className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto animate-[fadeIn_0.4s_ease-out]">
      
      {/* Search Input HUD box */}
      <div className="bg-[#0f0a1f] p-6 rounded-2xl border border-purple-500/10 mb-8 max-w-3xl mx-auto flex flex-col gap-4">
        <label className="text-sm font-bold text-white flex items-center gap-1.5">
          <Popcorn className="w-4 h-4 text-violet-400" />
          Cinematic Database Scan
        </label>
        
        <div className="flex gap-2.5">
          {/* Text input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for titles, series, synopses, characters..."
              className="w-full bg-[#050110] border border-slate-800 text-white placeholder-slate-500 text-sm rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          {/* Trigger button */}
          <button
            onClick={handlePerformSearch}
            className="bg-gradient-to-tr from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl py-2.5 px-5 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-violet-500/10 active:scale-97 cursor-pointer"
          >
            Scan
          </button>
        </div>

        {/* Media type filter pill group */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-purple-500/5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1.5">Category:</span>
          {[
            { id: "all", label: "All Media" },
            { id: "movie", label: "Movies Only" },
            { id: "tv", label: "TV Series Only" }
          ].map((item) => {
            const isActive = filterType === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setFilterType(item.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/40 shadow-sm shadow-violet-500/5"
                    : "bg-[#050110] text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading overlay spacer */}
      {isLoading ? (
        <div id="search-results-loading" className="min-h-[40vh] w-full flex flex-col justify-center items-center gap-3">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          <span className="text-sm text-slate-400 font-semibold tracking-wide">Scanning database tables...</span>
        </div>
      ) : results.length > 0 ? (
        /* Results list Grid */
        <div id="search-results-viewport">
          <h2 className="text-sm uppercase font-extrabold text-slate-400 tracking-wider mb-6 flex items-center justify-between">
            <span>Search Matches ({displayedResults.length})</span>
            {filterType !== "all" && (
              <button 
                onClick={() => setFilterType("all")}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-bold cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </h2>
          
          {displayedResults.length > 0 ? (
            <div id="search-results-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {displayedResults.map((m) => {
                const rating = m.vote_average ? m.vote_average.toFixed(1) : "7.0";
                const releaseYear = m.release_date 
                  ? m.release_date.split("-")[0] 
                  : (m.first_air_date ? m.first_air_date.split("-")[0] : "2026");
                
                const imgUrl = m.poster_path
                  ? (m.poster_path.startsWith("http") 
                     ? m.poster_path 
                     : `https://image.tmdb.org/t/p/w342${m.poster_path}`)
                  : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=342";

                const isTVItem = m.media_type === "tv" || !!m.first_air_date || (!!m.name && !m.title);

                return (
                  <div
                    key={m.id}
                    id={`search-grid-item-${m.id}`}
                    onClick={() => onMovieClick(m)}
                    className="group cursor-pointer flex flex-col gap-2 rounded-2xl overflow-hidden border border-purple-500/5 hover:border-violet-500/50 hover:bg-[#120e2a] transition-all duration-300"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
                      <img
                        src={imgUrl}
                        alt={m.title || m.name}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Dark gradient overlap card */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050110] via-transparent to-transparent opacity-60 z-1" />

                      {/* Rating sticker */}
                      <span className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/80 backdrop-blur-sm border border-stone-800 text-amber-400 flex items-center gap-0.5">
                        ★ {rating}
                      </span>

                      {/* Badge for TV Series vs Movie */}
                      <span className={`absolute bottom-2.5 left-2.5 z-10 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                        isTVItem 
                          ? "bg-fuchsia-950/90 text-fuchsia-300 border border-fuchsia-500/30" 
                          : "bg-violet-950/90 text-violet-300 border border-violet-500/30"
                      }`}>
                        {isTVItem ? "TV Show" : "Movie"}
                      </span>
                    </div>

                    <div className="p-3 pt-1">
                      <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-violet-400 truncate leading-tight transition-colors">
                        {m.title || m.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">
                        Year: {releaseYear}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div id="filter-empty-hud" className="min-h-[30vh] w-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <Popcorn className="w-8 h-8 text-slate-600" />
              <p className="font-semibold text-slate-300">No results match this filter type</p>
              <p className="text-xs text-slate-500">Try switching back to "All Media" to see results.</p>
              <button
                onClick={() => setFilterType("all")}
                className="mt-3 bg-violet-600/30 text-violet-300 hover:bg-violet-600/50 border border-violet-500/40 rounded-xl px-4 py-1.5 text-xs font-bold transition-all cursor-pointer"
              >
                Show All Media
              </button>
            </div>
          )}
        </div>
      ) : query.trim() ? (
        /* Empty results HUD */
        <div id="search-empty-hud" className="min-h-[40vh] w-full flex flex-col items-center justify-center gap-2.5 text-slate-400 text-sm">
          <Popcorn className="w-10 h-10 text-slate-500" />
          <p className="font-semibold text-slate-300 text-base">No matches found</p>
          <p className="text-xs text-slate-500 max-w-sm text-center">Verify spelling or try searching for major keys like "Andromeda", "Stranger", "Silicon", "Backrooms", or "Kyoto".</p>
        </div>
      ) : (
        /* Initial idle state */
        <div id="search-initial-hud" className="min-h-[40vh] w-full flex flex-col items-center justify-center gap-2.5 text-center text-slate-400 text-sm">
          <Compass className="w-12 h-12 text-violet-500/40 animate-spin" style={{ animationDuration: '8s' }} />
          <p className="font-bold text-slate-300">Ready for Global Scan</p>
          <span className="text-xs text-slate-500 max-w-sm">Type any key term inside the cinematic database search above. Direct access is mapped completely across TMDB.</span>
        </div>
      )}
    </div>
  );
};
