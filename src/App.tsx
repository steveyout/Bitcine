/**
 * Bitcine Streaming Applet Controller
 */
import { useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./theme";
import { Movie, ActiveTab } from "./types";
import { api } from "./services/api";

// Sub-components
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { MovieSlider } from "./components/MovieSlider";
import { MovieDetailsModal } from "./components/MovieDetailsModal";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { BrowseView } from "./components/BrowseView";
import { ApiExplorer } from "./components/ApiExplorer";
import { SearchView } from "./components/SearchView";
import { Footer } from "./components/Footer";
import { SEOHelmet } from "./components/SEOHelmet";
import { FloatingSocials } from "./components/FloatingSocials";

// Icons 
import { AlertCircle, Flame, Sparkles, Film, Compass, ServerCrash, RefreshCw, History } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  
  // Categories collections
  const [trending, setTrending] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);

  // TV Series collections
  const [trendingTV, setTrendingTV] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<Movie[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<Movie[]>([]);
  
  // Continue Watching stored state
  const [continueWatching, setContinueWatching] = useState<Movie[]>([]);
  
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

  // Fetch collections on startup
  useEffect(() => {
    const fetchMovieCatalog = async () => {
      setIsLoading(true);
      try {
        // Concurrently query proxied endpoints
        const [
          trendingRes, 
          nowPlayingRes, 
          topRatedRes, 
          upcomingRes,
          trendingTVRes,
          popularTVRes,
          topRatedTVRes
        ] = await Promise.all([
          api.getTrending().catch(() => ({ results: [] })),
          api.getNowPlaying().catch(() => ({ results: [] })),
          api.getTopRated().catch(() => ({ results: [] })),
          api.getUpcoming().catch(() => ({ results: [] })),
          api.getTrendingTV().catch(() => ({ results: [] })),
          api.getPopularTV().catch(() => ({ results: [] })),
          api.getTopRatedTV().catch(() => ({ results: [] }))
        ]);

        const trendingList = trendingRes.results || [];
        const nowPlayingList = nowPlayingRes.results || [];
        const topRatedList = topRatedRes.results || [];
        const upcomingList = upcomingRes.results || [];
        const trendingTVList = trendingTVRes.results || [];
        const popularTVList = popularTVRes.results || [];
        const topRatedTVList = topRatedTVRes.results || [];

        // Check if all endpoints returned empty arrays (implies TMDB unconfigured or token invalid)
        if (
          trendingList.length === 0 &&
          nowPlayingList.length === 0 &&
          topRatedList.length === 0 &&
          upcomingList.length === 0 &&
          trendingTVList.length === 0
        ) {
          throw new Error("No data returned from TMDB gateway. Activating fallback content.");
        }

        setTrending(trendingList);
        setNowPlaying(nowPlayingList);
        setTopRated(topRatedList);
        setUpcoming(upcomingList);

        setTrendingTV(trendingTVList);
        setPopularTV(popularTVList);
        setTopRatedTV(topRatedTVList);

        // Pick the top trending movie or any movie for the Hero
        if (trendingList.length > 0) {
          setHeroMovie(trendingList[0]);
        } else if (nowPlayingList.length > 0) {
          setHeroMovie(nowPlayingList[0]);
        }

        setApiStatus({ ok: true });
      } catch (err: any) {
        console.warn("Bitcine Gateway Alert: Using high-fidelity fallback catalog. Reason:", err.message);
        
        // Populate gorgeous fallback offline portfolio
        const fallbacks = api.getFallbackMovies();
        const fallbackSeriesList = api.getFallbackSeries();

        setTrending(fallbacks);
        setNowPlaying(fallbacks.slice().reverse());
        setTopRated(fallbacks.filter(m => m.vote_average >= 8.2));
        setUpcoming(fallbacks.filter(m => m.vote_average < 8.0));

        setTrendingTV(fallbackSeriesList);
        setPopularTV(fallbackSeriesList.slice().reverse());
        setTopRatedTV(fallbackSeriesList.filter(m => m.vote_average >= 8.2));
        
        setHeroMovie(fallbacks[0]); // Celestial Echoes
        setApiStatus({
          ok: false,
          reason: "TMDB API Access Token unconfigured. Loading offline premium film vault."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieCatalog();
  }, []);

  // Sync Continue Watching list from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bitcine_continue_watching");
      if (saved) {
        setContinueWatching(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Bitcine client failed to parse Continue Watching logs:", e);
    }
  }, []);

  const addToContinueWatching = (movie: Movie) => {
    setContinueWatching((prev) => {
      // De-duplicate if the movie was already being tracked, moving it to front priority
      const filtered = prev.filter((m) => m.id !== movie.id);
      const updated = [movie, ...filtered].slice(0, 15); // Limit history tracking
      try {
        localStorage.setItem("bitcine_continue_watching", JSON.stringify(updated));
      } catch (e) {
        console.warn("Storage quota limit exceeded. Could not save session:", e);
      }
      return updated;
    });
  };

  // Set modal hooks for detail viewing or action streams
  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    setModalPlayNow(false);
    setModalOpen(true);
    addToContinueWatching(movie);
  };

  const handleHeroPlay = (movie: Movie) => {
    setSelectedMovie(movie);
    setModalPlayNow(true);
    setModalOpen(true);
    addToContinueWatching(movie);
  };

  const handleSearchToggle = () => {
    setActiveTab(activeTab === "search" ? "home" : "search");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SEOHelmet 
        activeTab={activeTab} 
        selectedMovie={selectedMovie} 
        modalOpen={modalOpen} 
      />
      
      {/* Background radial gradient wrapper styled to provide a premium viewing experience */}
      <div 
        id="applet-core-root" 
        className="min-h-screen bg-[#050110] text-[#f8fafc] font-sans pb-24 md:pb-8 flex flex-col relative"
      >
        {/* Subtle ambient lighting nodes to break template default feel */}
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-purple-900/[0.03] rounded-full filter blur-[150px] pointer-events-none z-0" />
        <div className="absolute bottom-1/3 left-0 w-[40vw] h-[40vw] bg-indigo-900/[0.03] rounded-full filter blur-[120px] pointer-events-none z-0" />

        {/* Global sticky Glassmorphic Header */}
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
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
                            localStorage.removeItem("bitcine_continue_watching");
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

                {/* Row: TOP 10 Today (with large numbers) */}
                <MovieSlider 
                  id="top-10" 
                  title="TOP 10 Today" 
                  movies={trending.slice(0, 10)} 
                  onMovieClick={handleMovieSelect}
                  isTop10={true}
                  isLoading={isLoading}
                />

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
              </div>
            </div>
          )}

          {activeTab === "browse" && (
            <BrowseView onMovieClick={handleMovieSelect} />
          )}

          {activeTab === "search" && (
            <SearchView onMovieClick={handleMovieSelect} />
          )}

          {activeTab === "api" && (
            <ApiExplorer />
          )}
        </main>

        {/* Global footer disclaimer & legal notice with back-to-top widgets */}
        {activeTab === "home" && <Footer />}

        {/* Global overlay details modal and Simulated movie streaming HUD player */}
        <MovieDetailsModal
          movie={selectedMovie}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onMovieClick={handleMovieSelect}
          initialPlayState={modalPlayNow}
        />

        {/* Floating brand social link shortcuts (Discord, Telegram, showing brand-themed buttons) */}
        <FloatingSocials />

        {/* Floating Mobile Bottom Navigation bar (toggled strictly based on screen widths) */}
        <MobileBottomNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
      </div>
    </ThemeProvider>
  );
}
