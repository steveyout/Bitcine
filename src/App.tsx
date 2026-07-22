"use client";

/**
 * Bitcine Streaming Applet Controller
 */
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Movie, ActiveTab } from "./types";
import { api } from "./services/api";

// Sub-components (critical above-the-fold components loaded synchronously)
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { MovieSlider } from "./components/MovieSlider";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { SEOHelmet } from "./components/SEOHelmet";
import type { MovieDetailsModalProps } from "./components/MovieDetailsModal";
import type { GenreTrendsChartProps } from "./components/GenreTrendsChart";
import type { BrowseViewProps } from "./components/BrowseView";
import type { HistoryViewProps } from "./components/HistoryView";
import type { SearchViewProps } from "./components/SearchView";

// Dynamic sub-components (split into separate lightweight bundles for fast initial paint)
const MovieDetailsModal = dynamic<MovieDetailsModalProps>(() => import("./components/MovieDetailsModal").then(mod => mod.MovieDetailsModal), {
  ssr: false
});

const GenreTrendsChart = dynamic<GenreTrendsChartProps>(() => import("./components/GenreTrendsChart").then(mod => mod.GenreTrendsChart), {
  ssr: false,
  loading: () => <div className="w-full h-[330px] md:h-[380px] bg-[#03010b]/60 border border-purple-500/10 rounded-2xl animate-pulse" />
});

const BrowseView = dynamic<BrowseViewProps>(() => import("./components/BrowseView").then(mod => mod.BrowseView), {
  ssr: false,
  loading: () => <div className="min-h-[600px] w-full animate-pulse bg-slate-900/10 rounded-2xl" />
});

const HistoryView = dynamic<HistoryViewProps>(() => import("./components/HistoryView").then(mod => mod.HistoryView), {
  ssr: false,
  loading: () => <div className="min-h-[600px] w-full animate-pulse bg-slate-900/10 rounded-2xl" />
});

const SearchView = dynamic<SearchViewProps>(() => import("./components/SearchView").then(mod => mod.SearchView), {
  ssr: false,
  loading: () => <div className="min-h-[600px] w-full animate-pulse bg-slate-900/10 rounded-2xl" />
});

const FloatingSocials = dynamic(() => import("./components/FloatingSocials").then(mod => mod.FloatingSocials), {
  ssr: false
});

const Footer = dynamic(() => import("./components/Footer").then(mod => mod.Footer), {
  ssr: false
});

// Icons 
import { AlertCircle, Flame, Sparkles, Film, Compass, ServerCrash, RefreshCw, History, Heart } from "lucide-react";

interface AppProps {
  initialWatchId?: number;
  initialWatchType?: "movie" | "tv";
  initialTab?: ActiveTab;
}

export default function App({ initialWatchId, initialWatchType, initialTab }: AppProps = {}) {
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab || "home");
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [brandLabel, setBrandLabel] = useState("Cineby");
  const [initialSearchQuery, setInitialSearchQuery] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoUrl, setPromoUrl] = useState("");

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (tab === "home") {
        params.delete("tab");
        params.delete("q");
        params.delete("search");
        const queryStr = params.toString();
        window.history.pushState(null, "", queryStr ? `?${queryStr}` : window.location.pathname);
      } else {
        params.set("tab", tab);
        if (tab !== "search") {
          params.delete("q");
          params.delete("search");
        }
        window.history.pushState(null, "", `?${params.toString()}`);
      }
    }
  };

  // Determine brand label on client-side mount & load SEO Promotion Mirror link
  useEffect(() => {
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    const isCineby = hostname.includes("cineby") || hostname.includes("cineby.mom") || hostname.includes("cineby.at");
    const isFlixer = hostname.includes("flixer") || hostname.includes("flixer.ink");
    const isCineplay = hostname.includes("cineplay");
    
    if (isFlixer) {
      setBrandLabel("Flixer");
    } else if (isCineby) {
      setBrandLabel("Cineby");
    } else if (isCineplay) {
      setBrandLabel("Cineplay");
    } else {
      setBrandLabel("Bitcine");
    }

    // Dynamic high-value target URLs under requested SEO domains to boost search catalog index depth
    const promoTargets = [
      "https://cineby.rest",
      "https://cineby.works",
      "https://cineby.rest/browse",
      "https://cineby.works/browse",
      "https://cineby.rest/search?q=trending",
      "https://cineby.works/search?q=blockbuster",
      "https://series.cineby.rest",
      "https://movies.cineby.works"
    ];
    const randomUrl = promoTargets[Math.floor(Math.random() * promoTargets.length)];
    setPromoUrl(randomUrl);

    const timer = setTimeout(() => {
      const hasSeenPromo = sessionStorage.getItem("seen_seo_promo");
      if (!hasSeenPromo) {
        setPromoOpen(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Categories collections
  const [trending, setTrending] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);

  // TV Series collections
  const [trendingTV, setTrendingTV] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<Movie[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<Movie[]>([]);
  
  // Local stored states initialized consistently to [] to prevent SSR/hydration mismatch (Error #418)
  const [continueWatching, setContinueWatching] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);

  // Sync Continue Watching & Watchlist from localStorage on client mount
  useEffect(() => {
    try {
      const cwKeys = ["cineby_continue_watching", "flixer_continue_watching", "bitcine_continue_watching", "cineplay_continue_watching"];
      for (const k of cwKeys) {
        const saved = localStorage.getItem(k);
        if (saved) {
          setContinueWatching(JSON.parse(saved));
          break;
        }
      }
    } catch (e) {
      console.warn("Client failed to parse Continue Watching logs:", e);
    }

    try {
      const wlKeys = ["cineby_watchlist", "flixer_watchlist", "bitcine_watchlist", "cineplay_watchlist"];
      for (const k of wlKeys) {
        const saved = localStorage.getItem(k);
        if (saved) {
          setWatchlist(JSON.parse(saved));
          break;
        }
      }
    } catch (e) {
      console.warn("Client failed to parse Watchlist logs:", e);
    }
  }, []);
  
  // Detail Overlay control
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPlayNow, setModalPlayNow] = useState(false);

  // Connection Indicators
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<{
    ok: boolean;
    reason?: string;
  }>({ ok: true });

  // Fetch collections on startup using 2-stage prioritized batching for instant paint
  useEffect(() => {
    const fetchMovieCatalog = async () => {
      setIsLoading(true);
      try {
        // Stage 1: Above-the-fold critical rows for fast LCP & low TBT
        const [trendingRes, nowPlayingRes] = await Promise.all([
          api.getTrending().catch(() => ({ results: [] })),
          api.getNowPlaying().catch(() => ({ results: [] }))
        ]);

        const trendingList = trendingRes.results || [];
        const nowPlayingList = nowPlayingRes.results || [];

        if (trendingList.length === 0 && nowPlayingList.length === 0) {
          throw new Error("No primary data returned from TMDB gateway. Activating fallback content.");
        }

        setTrending(trendingList);
        setNowPlaying(nowPlayingList);

        if (trendingList.length > 0) {
          setHeroMovie(trendingList[0]);
        } else if (nowPlayingList.length > 0) {
          setHeroMovie(nowPlayingList[0]);
        }

        setApiStatus({ ok: true });
        setIsLoading(false); // First viewport ready immediately!

        // Stage 2: Secondary rows fetched in non-blocking background task
        Promise.all([
          api.getTopRated().catch(() => ({ results: [] })),
          api.getUpcoming().catch(() => ({ results: [] })),
          api.getTrendingTV().catch(() => ({ results: [] })),
          api.getPopularTV().catch(() => ({ results: [] })),
          api.getTopRatedTV().catch(() => ({ results: [] }))
        ]).then(([topRatedRes, upcomingRes, trendingTVRes, popularTVRes, topRatedTVRes]) => {
          setTopRated(topRatedRes.results || []);
          setUpcoming(upcomingRes.results || []);
          setTrendingTV(trendingTVRes.results || []);
          setPopularTV(popularTVRes.results || []);
          setTopRatedTV(topRatedTVRes.results || []);
        }).catch(err => console.warn("Secondary catalog load error:", err));

      } catch (err: any) {
        console.warn("Bitcine Gateway Alert: Using high-fidelity fallback catalog. Reason:", err.message);
        
        const fallbacks = api.getFallbackMovies();
        const fallbackSeriesList = api.getFallbackSeries();

        setTrending(fallbacks);
        setNowPlaying(fallbacks.slice().reverse());
        setTopRated(fallbacks.filter(m => m.vote_average >= 8.2));
        setUpcoming(fallbacks.filter(m => m.vote_average < 8.0));

        setTrendingTV(fallbackSeriesList);
        setPopularTV(fallbackSeriesList.slice().reverse());
        setTopRatedTV(fallbackSeriesList.filter(m => m.vote_average >= 8.2));
        
        setHeroMovie(fallbacks[0]);
        setApiStatus({
          ok: false,
          reason: "TMDB API Access Token unconfigured. Loading offline premium film vault."
        });
        setIsLoading(false);
      }
    };

    fetchMovieCatalog();
  }, []);
  
  const toggleWatchlist = (movie: Movie) => {
    setWatchlist((prev) => {
      const isSaved = prev.some((m) => m.id === movie.id);
      let updated;
      if (isSaved) {
        updated = prev.filter((m) => m.id !== movie.id);
      } else {
        updated = [movie, ...prev];
      }
      try {
        localStorage.setItem(`${brandLabel.toLowerCase()}_watchlist`, JSON.stringify(updated));
      } catch (e) {
        console.warn("Storage client failed to save watchlist item:", e);
      }
      return updated;
    });
  };

  const addToContinueWatching = (movie: Movie) => {
    setContinueWatching((prev) => {
      // De-duplicate if the movie was already being tracked, moving it to front priority
      const filtered = prev.filter((m) => m.id !== movie.id);
      const updated = [movie, ...filtered].slice(0, 15); // Limit history tracking
      try {
        localStorage.setItem(`${brandLabel.toLowerCase()}_continue_watching`, JSON.stringify(updated));
      } catch (e) {
        console.warn("Storage quota limit exceeded. Could not save session:", e);
      }
      return updated;
    });
  };

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  // Parse Slug and deep links on initial mount
  useEffect(() => {
    if (typeof window === "undefined" || isLoading) return;

    const params = new URLSearchParams(window.location.search);
    const tabQuery = params.get("tab");
    const searchQuery = params.get("q") || params.get("search");

    if (tabQuery && ["home", "browse", "search", "history"].includes(tabQuery)) {
      setActiveTab(tabQuery as ActiveTab);
    }

    if (searchQuery) {
      setActiveTab("search");
      setInitialSearchQuery(searchQuery);
    }

    // Determine the ID and type either from Next.js server-side parameters or dynamic pathname parsing
    let targetId = initialWatchId;
    let targetType: "movie" | "tv" | null = initialWatchType || null;

    const pathname = window.location.pathname;
    const pathMatch = pathname.match(/^\/(movie|tv)\/(\d+)/);
    if (!targetId && pathMatch) {
      targetType = pathMatch[1] as "movie" | "tv";
      targetId = parseInt(pathMatch[2]);
    }

    // Also fallback to older "?watch=" query parameters if present for backward compatibility
    const watchQuery = params.get("watch") || params.get("movie");
    if (!targetId && watchQuery) {
      targetId = parseInt(watchQuery.split("-")[0]);
    }

    if (targetId && !isNaN(targetId)) {
      const allLoaded = [
        ...trending,
        ...nowPlaying,
        ...topRated,
        ...upcoming,
        ...trendingTV,
        ...popularTV,
        ...topRatedTV
      ];

      const found = allLoaded.find(m => m.id === targetId);
      if (found) {
        setSelectedMovie(found);
        setModalPlayNow(true);
        setModalOpen(true);
      } else {
        // Fetch from API gateway depending on target type
        if (targetType === "tv") {
          api.getTVDetails(targetId)
            .then(full => {
              if (full) {
                setSelectedMovie(full);
                setModalPlayNow(true);
                setModalOpen(true);
              }
            })
            .catch(() => {
              // Try movie as fallback
              api.getMovieDetails(targetId!)
                .then(full => {
                  if (full) {
                    setSelectedMovie(full);
                    setModalPlayNow(true);
                    setModalOpen(true);
                  }
                })
                .catch(err => console.warn("TV fallback details lookup failed:", err));
            });
        } else {
          api.getMovieDetails(targetId)
            .then(full => {
              if (full) {
                setSelectedMovie(full);
                setModalPlayNow(true);
                setModalOpen(true);
              }
            })
            .catch(() => {
              // Try TV details as fallback
              api.getTVDetails(targetId!)
                .then(full => {
                  if (full) {
                    setSelectedMovie(full);
                    setModalPlayNow(true);
                    setModalOpen(true);
                  }
                })
                .catch(err => console.warn("Movie fallback details lookup failed:", err));
            });
        }
      }
    }
  }, [isLoading, initialWatchId, initialWatchType, trending, nowPlaying, topRated, upcoming, trendingTV, popularTV, topRatedTV]);

  // Set modal hooks for detail viewing or action streams
  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    setModalPlayNow(false);
    setModalOpen(true);
    addToContinueWatching(movie);

    // Push good search-engine visual slugs to Browser History URL
    const title = movie.title || movie.name || "movie";
    const slug = `${movie.id}-${slugify(title)}`;
    const isTv = movie.first_air_date !== undefined || movie.name !== undefined;
    const path = isTv ? `/tv/${slug}` : `/movie/${slug}`;
    window.history.pushState(null, "", path);
  };

  const handleHeroPlay = (movie: Movie) => {
    setSelectedMovie(movie);
    setModalPlayNow(true);
    setModalOpen(true);
    addToContinueWatching(movie);

    const title = movie.title || movie.name || "movie";
    const slug = `${movie.id}-${slugify(title)}`;
    const isTv = movie.first_air_date !== undefined || movie.name !== undefined;
    const path = isTv ? `/tv/${slug}` : `/movie/${slug}`;
    window.history.pushState(null, "", path);
  };

  const handlePlayWithProgress = (movie: Movie, season?: number, episode?: number, seconds?: number) => {
    // Deeply populate matching fields
    const updatedMovie = {
      ...movie,
      lastWatchedSeason: season,
      lastWatchedEpisode: episode,
      progressSeconds: seconds
    };
    setSelectedMovie(updatedMovie);
    setModalPlayNow(true);
    setModalOpen(true);
    addToContinueWatching(updatedMovie);

    const title = movie.title || movie.name || "movie";
    const slug = `${movie.id}-${slugify(title)}`;
    const isTv = movie.first_air_date !== undefined || movie.name !== undefined;
    const path = isTv ? `/tv/${slug}` : `/movie/${slug}`;
    window.history.pushState(null, "", path);
  };

  const handleSearchToggle = () => {
    handleTabChange(activeTab === "search" ? "home" : "search");
  };

  return (
    <>
      <SEOHelmet 
        activeTab={activeTab} 
        selectedMovie={selectedMovie} 
        modalOpen={modalOpen} 
      />
      
      {/* Background radial gradient wrapper styled to provide a premium viewing experience */}
      <div 
        id="applet-core-root" 
        className={`min-h-screen ${brandLabel === "Flixer" || brandLabel === "Cineby" ? "bg-[#030000]" : "bg-[#050110]"} text-[#f8fafc] font-sans pb-24 md:pb-8 flex flex-col relative`}
      >
        {/* Subtle ambient lighting nodes to break template default feel */}
        <div className={`absolute top-0 right-0 w-[50vw] h-[50vw] ${brandLabel === "Flixer" || brandLabel === "Cineby" ? "bg-red-950/[0.04]" : "bg-purple-900/[0.03]"} rounded-full filter blur-[150px] pointer-events-none z-0`} />
        <div className={`absolute bottom-1/3 left-0 w-[40vw] h-[40vw] ${brandLabel === "Flixer" || brandLabel === "Cineby" ? "bg-rose-950/[0.04]" : "bg-indigo-900/[0.03]"} rounded-full filter blur-[120px] pointer-events-none z-0`} />

        {/* Global sticky Glassmorphic Header */}
        <Header 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          onSearchToggle={handleSearchToggle}
        />

        {/* Top telemetry notification overlay if running on mock fallback data */}
        {!apiStatus.ok && activeTab === "home" && (
          <div 
            id="offline-vault-badge" 
            className="fixed top-20 left-4 right-4 md:left-8 md:right-8 z-40 bg-purple-950/40 backdrop-blur-md border border-purple-500/20 rounded-2xl p-3.5 flex items-center justify-between text-xs text-purple-200 animate-[slideDown_0.3s_ease-out]"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-violet-400 flex-shrink-0 animate-pulse" />
              <span>
                <strong>Cinematic Vault Mode Enabled</strong> • Standard TMDB token unconfigured or expired. Showing high-fidelity pre-compiled stream representations.
              </span>
            </div>
          </div>
        )}

        {/* Main Routed Content Area */}
        <main id="applet-main-body" className="flex-grow z-10">
          {activeTab === "home" && (
            <div id="home-view-active" className="animate-[fadeIn_0.5s_ease-out]">
              {/* Dynamic cinematic Hero backdrop */}
              <Hero 
                movie={heroMovie} 
                onPlay={handleHeroPlay} 
                onSeeMore={handleMovieSelect}
                isLoading={isLoading}
              />

              {/* Rows slider collection */}
              <div id="home-sliders-wrapper" className="max-w-7xl mx-auto pb-12 px-4 md:px-8 flex flex-col gap-8 mt-6">
                {/* Row: TOP 10 Today (with large numbers) - Placed first for maximum layout stability */}
                <MovieSlider 
                  id="top-10" 
                  title="TOP 10 Today" 
                  movies={trending.slice(0, 10)} 
                  onMovieClick={handleMovieSelect}
                  isTop10={true}
                  isLoading={isLoading}
                />

                {/* Row: My Watchlist (only renders if items are present in localStorage watchlist) */}
                {watchlist.length > 0 && (
                  <div key="watchlist-section" className="animate-[fadeIn_0.4s_ease-out]">
                    <div className="flex items-center justify-between gap-4 pb-2 border-b border-purple-500/10">
                      <h2 className="text-sm md:text-md uppercase font-black tracking-widest text-[#f8fafc] flex items-center gap-2.5">
                        <Heart className="w-4.5 h-4.5 text-rose-500 fill-rose-500 animate-pulse" />
                        My Watchlist
                      </h2>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setWatchlist([]);
                          try {
                            localStorage.removeItem(`${brandLabel.toLowerCase()}_watchlist`);
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="text-[10px] uppercase font-black tracking-widest text-slate-400 hover:text-rose-400 cursor-pointer transition-colors px-2.5 py-1 rounded bg-slate-900/60 border border-slate-800 hover:border-rose-500/20"
                      >
                        Clear Watchlist
                      </button>
                    </div>

                    <MovieSlider 
                      id="my-watchlist" 
                      title="My Saved Movies & Series" 
                      movies={watchlist} 
                      onMovieClick={handleMovieSelect}
                      isLoading={isLoading}
                    />
                  </div>
                )}

                {/* Row: Continue Watching (only renders if items are present in localStorage history) */}
                {continueWatching.length > 0 && (
                  <div key="continue-watching-section" className="animate-[fadeIn_0.4s_ease-out]">
                    <div className="flex items-center justify-between gap-4 pb-2 border-b border-purple-500/10">
                      <h2 className="text-sm md:text-md uppercase font-black tracking-widest text-[#f8fafc] flex items-center gap-2.5">
                        <History className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
                        Continue Watching
                      </h2>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setContinueWatching([]);
                          try {
                            localStorage.removeItem(`${brandLabel.toLowerCase()}_continue_watching`);
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="text-[10px] uppercase font-black tracking-widest text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors px-2.5 py-1 rounded bg-slate-900/60 border border-slate-800 hover:border-emerald-500/20"
                      >
                        Clear History
                      </button>
                    </div>

                    <MovieSlider 
                      id="continue-watching" 
                      title="Recently Viewed Movies" 
                      movies={continueWatching} 
                      onMovieClick={handleMovieSelect}
                      isLoading={isLoading}
                    />
                  </div>
                )}

                {/* Section Divider: Blockbuster Movies */}
                <div className="flex items-center gap-4 pt-4 border-t border-purple-500/10">
                  <h2 className="text-sm md:text-md uppercase font-black tracking-widest text-[#f8fafc] flex items-center gap-2.5">
                    <div className="w-1.5 h-4 bg-violet-600 rounded-full"></div>
                    Exclusive Movies
                  </h2>
                  <div className="h-[1px] bg-gradient-to-r from-purple-500/10 to-transparent flex-1"></div>
                </div>

                {/* Row: Now Playing inside Bitcine */}
                <MovieSlider 
                  id="now-playing" 
                  title="Spotlight Streams" 
                  movies={nowPlaying} 
                  onMovieClick={handleMovieSelect}
                  isLoading={isLoading}
                />

                {/* Row: Upcoming catalog listings */}
                <MovieSlider 
                  id="upcoming" 
                  title="Anticipated Releases" 
                  movies={upcoming} 
                  onMovieClick={handleMovieSelect}
                  isLoading={isLoading}
                />

                {/* Row: Top Rated Movies */}
                <MovieSlider 
                  id="top-rated" 
                  title="All-Time Classics" 
                  movies={topRated} 
                  onMovieClick={handleMovieSelect}
                  isLoading={isLoading}
                />

                {/* Section Divider: TV Series */}
                <div className="flex items-center gap-4 pt-8 border-t border-purple-500/10">
                  <h2 className="text-sm md:text-md uppercase font-black tracking-widest text-[#f8fafc] flex items-center gap-2.5">
                    <div className="w-1.5 h-4 bg-fuchsia-500 rounded-full"></div>
                    Premium TV Series
                  </h2>
                  <div className="h-[1px] bg-gradient-to-r from-purple-500/10 to-transparent flex-1"></div>
                </div>

                {/* Row: Trending Series */}
                <MovieSlider 
                  id="trending-tv" 
                  title="Trending Series" 
                  movies={trendingTV} 
                  onMovieClick={handleMovieSelect}
                  isLoading={isLoading}
                />

                {/* Row: Popular Series */}
                <MovieSlider 
                  id="popular-tv" 
                  title="Must-Watch Binge Shows" 
                  movies={popularTV} 
                  onMovieClick={handleMovieSelect}
                  isLoading={isLoading}
                />

                {/* Row: Top Rated Series */}
                <MovieSlider 
                  id="top-rated-tv" 
                  title="Acclaimed Television Hits" 
                  movies={topRatedTV} 
                  onMovieClick={handleMovieSelect}
                  isLoading={isLoading}
                />

                {/* Section Divider: Cinema Intelligence */}
                <div className="flex items-center gap-4 pt-8 border-t border-purple-500/10">
                  <h2 className="text-sm md:text-md uppercase font-black tracking-widest text-[#f8fafc] flex items-center gap-2.5">
                    <div className="w-1.5 h-4 bg-purple-500 rounded-full animate-pulse"></div>
                    Dynamic Analytics
                  </h2>
                  <div className="h-[1px] bg-gradient-to-r from-purple-500/10 to-transparent flex-1"></div>
                </div>

                {/* Interactive Recharts Genre trend visualization */}
                <GenreTrendsChart 
                  trending={trending}
                  nowPlaying={nowPlaying}
                  topRated={topRated}
                  upcoming={upcoming}
                  trendingTV={trendingTV}
                  popularTV={popularTV}
                />
              </div>
            </div>
          )}

          {activeTab === "browse" && (
            <BrowseView onMovieClick={handleMovieSelect} />
          )}

          {activeTab === "search" && (
            <SearchView 
              onMovieClick={handleMovieSelect} 
              initialQuery={initialSearchQuery}
              onSearchChange={(newQuery) => {
                if (typeof window !== "undefined") {
                  const params = new URLSearchParams(window.location.search);
                  if (newQuery) {
                    params.set("q", newQuery);
                  } else {
                    params.delete("q");
                  }
                  window.history.replaceState(null, "", `?${params.toString()}`);
                }
              }}
            />
          )}

          {activeTab === "history" && (
            <HistoryView 
              onMovieClick={handleMovieSelect} 
              onPlayWithProgress={handlePlayWithProgress}
            />
          )}
        </main>

        {/* Global footer disclaimer & legal notice with back-to-top widgets */}
        {activeTab === "home" && <Footer />}

        {/* Global overlay details modal and Simulated movie streaming HUD player */}
        <MovieDetailsModal
          movie={selectedMovie}
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            // Clean up Slug in browser URL on modal close
            const path = window.location.pathname;
            if (path.startsWith("/movie/") || path.startsWith("/tv/")) {
              window.history.pushState(null, "", "/");
            } else {
              window.history.pushState(null, "", path);
            }
          }}
          onMovieClick={handleMovieSelect}
          initialPlayState={modalPlayNow}
          watchlist={watchlist}
          onToggleWatchlist={toggleWatchlist}
        />

        {/* Floating brand social link shortcuts (Discord, Telegram, showing brand-themed buttons) */}
        <FloatingSocials />

        {/* Floating Mobile Bottom Navigation bar (toggled strictly based on screen widths) */}
        <MobileBottomNav 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
        />

        {/* SEO Sister-Site Promotion Modal */}
        {promoOpen && (
          <div 
            id="seo-promo-overlay"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]"
          >
            <div 
              id="seo-promo-card"
              className={`relative max-w-md w-full rounded-3xl border ${brandLabel === "Cineplay" || brandLabel === "Bitcine" ? "border-violet-500/20 bg-[#0c0712]" : "border-red-500/20 bg-[#0d0406]"} p-6 md:p-8 shadow-2xl shadow-black/80 flex flex-col items-center text-center`}
            >
              {/* Dynamic decorative icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${brandLabel === "Cineplay" || brandLabel === "Bitcine" ? "bg-violet-500/10 text-violet-400" : "bg-red-500/10 text-red-500"}`}>
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>

              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight mb-2">
                Sister Network Spotlight
              </h3>
              
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-6">
                Looking for more servers, exclusive cinematic gems, or alternative streaming mirrors? 
                Experience our partner network site, completely free and optimized for ultra-fast speeds!
              </p>

              {/* Bot-friendly search discoverable links */}
              <div className="w-full flex flex-col gap-3 mb-6">
                <a
                  href={promoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    sessionStorage.setItem("seen_seo_promo", "true");
                    setPromoOpen(false);
                  }}
                  className={`w-full py-3.5 rounded-xl text-center text-xs font-black tracking-wider uppercase transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-white ${
                    brandLabel === "Cineplay" || brandLabel === "Bitcine"
                      ? "bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] shadow-lg shadow-violet-500/25"
                      : "bg-gradient-to-r from-[#e50914] to-[#b91c1c] shadow-lg shadow-red-500/25"
                  }`}
                >
                  Visit Sister Stream Mirror
                </a>
                
                <span className="text-[10px] text-slate-500 font-mono tracking-wider">
                  Partner Node: <span className="text-slate-300 select-all">{promoUrl}</span>
                </span>
              </div>

              <button
                onClick={() => {
                  sessionStorage.setItem("seen_seo_promo", "true");
                  setPromoOpen(false);
                }}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase font-bold tracking-widest cursor-pointer"
              >
                Continue Watching Here
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
