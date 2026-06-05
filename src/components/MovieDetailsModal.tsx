import React, { useState, useEffect } from "react";
import { Movie, MovieDetails, Video, CastMember } from "../types";
import { api } from "../services/api";
import { 
  X, Play, Star, Clock, Globe, Film, ArrowRight, Sparkles, 
  Smile, Calendar, Volume2, Maximize, RotateCcw, AlertCircle, Tv, Server, Heart, Share2
} from "lucide-react";
import { Dialog, DialogContent, CircularProgress } from "@mui/material";
import { providers, DEFAULT_PROVIDER_ID, getEmbedUrl } from "../config/providers";
import { motion } from "motion/react";

interface MovieDetailsModalProps {
  movie: Movie | null;
  open: boolean;
  onClose: () => void;
  onMovieClick: (movie: Movie) => void;
  initialPlayState?: boolean;
  watchlist?: Movie[];
  onToggleWatchlist?: (movie: Movie) => void;
}

// Slide up transition for standard premium entrance
export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  open,
  onClose,
  onMovieClick,
  initialPlayState = false,
  watchlist = [],
  onToggleWatchlist,
}) => {
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(initialPlayState);
  const [activePromoVideo, setActivePromoVideo] = useState<Video | null>(null);
  
  // Direct Stream Server configurations
  const [playMode, setPlayMode] = useState<"stream" | "trailer">("stream");
  const [selectedProvider, setSelectedProvider] = useState<string>(DEFAULT_PROVIDER_ID);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);

  // Custom video player simulation controls
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);

  // Detect TV Series
  const isTV = !!(movie && (movie.first_air_date || movie.name || movie.id >= 200));

  // Determine watchlisted state
  const isWatchlisted = movie ? watchlist.some((m) => m.id === movie.id) : false;

  // Keep track of play status from inputs
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleShare = async () => {
    const movieTitle = currentMovie?.title || currentMovie?.name || movie?.title || movie?.name || "Movie";
    const releaseYear = yearText;
    const movieId = movie?.id;
    
    // Fallback shareable link
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/?movie=${movieId}` : "https://bitcine.stream/";
    const shareText = `Check out "${movieTitle}" (${releaseYear}) on Bitcine Stream! 🍿`;
    
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Bitcine Stream - ${movieTitle}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.warn("Web Share failed, fallback to clipboard copy", err);
        copyToClipboard(shareUrl, shareText);
      }
    } else {
      copyToClipboard(shareUrl, shareText);
    }
  };

  const copyToClipboard = (url: string, text: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(`${text} ${url}`);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      }
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  useEffect(() => {
    if (open) {
      setIsPlaying(initialPlayState);
      setPlaybackProgress(0);
      setIsBuffering(false);
      setPlayMode("stream");
      setSelectedProvider(DEFAULT_PROVIDER_ID);
      setSelectedSeason(1);
      setSelectedEpisode(1);
    }
  }, [open, initialPlayState, movie]);

  // Load complete details on movie activation
  useEffect(() => {
    if (!open || !movie) return;

    const loadDetails = async () => {
      setIsLoading(true);
      try {
        const fullDetail = isTV 
          ? await api.getTVDetails(movie.id)
          : await api.getMovieDetails(movie.id);
        setDetails(fullDetail);
        
        // Find best trailer (YouTube/Teaser/Trailer)
        if (fullDetail.videos?.results && fullDetail.videos.results.length > 0) {
          const trailer = fullDetail.videos.results.find(
            vid => vid.site === "YouTube" && (vid.type === "Trailer" || vid.type === "Teaser")
          ) || fullDetail.videos.results[0];
          setActivePromoVideo(trailer);
        } else {
          setActivePromoVideo(null);
        }
      } catch (err) {
        console.warn("MDU: Using client mock data for movie", movie.id);
        // Fallback for demo when server-proxy gives 404 or config error
        const fallbackList = api.getFallbackMovies();
        const fallbackSeriesList = api.getFallbackSeries();
        const found = isTV 
          ? fallbackSeriesList.find(m => m.id === movie.id)
          : fallbackList.find(m => m.id === movie.id);
        
        const mockDetail: MovieDetails = {
          ...(found || movie),
          credits: {
            cast: [
              { id: 101, name: "Jessica Chastain", character: "Commander Lewis", profile_path: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120" },
              { id: 102, name: "Cillian Murphy", character: "Theoretical Physicist", profile_path: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120" },
              { id: 103, name: "Zendaya", character: "Chani", profile_path: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120" },
              { id: 104, name: "Tom Hardy", character: "Mercenary Outlaw", profile_path: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120" }
            ]
          },
          similar: { 
            results: isTV
              ? fallbackSeriesList.filter(m => m.id !== movie.id).slice(0, 4)
              : fallbackList.filter(m => m.id !== movie.id).slice(0, 4)
          }
        };
        setDetails(mockDetail);
        setActivePromoVideo(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadDetails();
  }, [open, movie]);

  if (!movie) return null;

  const currentMovie = (details || movie) as MovieDetails;
  const ratingText = currentMovie.vote_average ? currentMovie.vote_average.toFixed(1) : "7.5";
  const yearText = currentMovie.release_date 
    ? currentMovie.release_date.split("-")[0] 
    : (currentMovie.first_air_date ? currentMovie.first_air_date.split("-")[0] : "2026");

  // ID resolver for direct streaming (to map fallback mock IDs to real TMDB streamable IDs!)
  const getStreamId = (): string | number => {
    const id = movie.id;
    if (id === 1) return "135548"; // Celestial Echoes
    if (id === 2) return "1000100"; // BACKROOMS
    if (id === 3) return "157336"; // Interstellar
    if (id === 4) return "550"; // Neon Abyss -> Fight Club
    if (id === 5) return "438631"; // Dune
    if (id === 6) return "102376"; // Cyberpunk
    if (id === 7) return "1002271"; // Quiet Place
    if (id === 8) return "1035806"; // Shadows of Kyoto
    if (id === 9) return "129"; // Spirited Away
    if (id === 201) return "135548"; // Andromeda Chronicles
    if (id === 202) return "66732"; // Stranger Things
    if (id === 203) return "211617"; // Frontier Colony
    if (id === 204) return "102376"; // Silicon Dynasty / Cyberpunk
    if (id === 205) return "218206"; // Gothic Shadows
    return id;
  };

  return (
    <Dialog
      id={`movie-details-dialog-${movie.id}`}
      open={open}
      keepMounted={false}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      className="z-[99]"
      sx={{
        "& .MuiBackdrop-root": {
          backgroundColor: "rgba(5, 1, 16, 0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        },
        "& .MuiPaper-root": {
          backgroundColor: "#050110",
          borderRadius: "20px",
          border: "1px solid rgba(139, 92, 246, 0.15)",
          color: "#f8fafc",
          overflowX: "hidden",
        }
      }}
    >
      <DialogContent id="modal-content-area" className="p-0 select-none relative scrollbar-thin scrollbar-thumb-purple-900">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full h-full"
        >
          
          {/* Share Success Toast Indicator */}
          {shareSuccess && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 bg-[#10b981]/95 text-white text-[11px] font-bold tracking-widest px-4 py-2 rounded-full shadow-xl shadow-emerald-950/40 border border-emerald-400 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] flex items-center gap-1.5 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              Link Copied to Clipboard!
            </div>
          )}

          {/* Floating Share Button */}
          <button
            id="modal-share-floating-btn"
            onClick={handleShare}
            aria-label="Share movie"
            className="absolute top-4 right-28 z-50 bg-[#050110]/80 text-white rounded-full p-2.5 hover:bg-violet-600/90 hover:scale-110 active:scale-95 border border-purple-500/20 cursor-pointer shadow-lg transition-all"
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>
          
          {/* Watchlist Toggle Heart Button */}
        <button
          id="modal-watchlist-floating-btn"
          onClick={() => movie && onToggleWatchlist?.(movie)}
          aria-label={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
          className="absolute top-4 right-16 z-50 bg-[#050110]/80 text-white rounded-full p-2.5 hover:bg-rose-600/90 hover:scale-110 active:scale-95 border border-purple-500/20 cursor-pointer shadow-lg transition-all"
        >
          <Heart className={`w-5 h-5 transition-colors ${isWatchlisted ? "fill-rose-500 text-rose-500" : "text-white"}`} />
        </button>

        {/* Floating Close Button */}
        <button
          id="modal-close-btn"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-50 bg-[#050110]/80 text-white rounded-full p-2.5 hover:bg-violet-600/90 hover:scale-110 active:scale-95 border border-purple-500/20 cursor-pointer shadow-lg transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* --- CINEMATOGRAPHIC PLAYER FRAME (Trailer active OR static backdrop with play overlay) --- */}
        <div id="modal-upper-player-frame" className="relative w-full aspect-video md:max-h-[480px] bg-black overflow-hidden border-b border-purple-500/20">
          
          {isPlaying ? (
            <div id="active-theatre-player" className="w-full h-full relative bg-black">
              {playMode === "stream" ? (
                /* Direct Stream Server Playback using Providers config! */
                <iframe
                  id="direct-stream-player"
                  src={getEmbedUrl(selectedProvider, isTV ? 'tv' : 'movie', getStreamId(), selectedSeason, selectedEpisode)}
                  title="Direct Stream Player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  referrerPolicy="no-referrer"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : activePromoVideo ? (
                /* YouTube embed if valid key found on TMDB */
                <iframe
                  id="youtube-embed-player"
                  src={`https://www.youtube.com/embed/${activePromoVideo.key}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0`}
                  title="Movie Trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  referrerPolicy="no-referrer"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                /* Cinematic simulated video element with equalizers & loaders */
                <div id="simulated-theatre-screen" className="w-full h-full flex flex-col justify-between p-6 bg-gradient-to-b from-[#0e0c1f] via-black to-[#050110] relative">
                  {/* Glowing ambient ring */}
                  <div className="absolute inset-0 bg-radial-gradient from-violet-600/[0.08] via-transparent to-transparent pointer-events-none" />
                  
                  {/* Buffering/Equalizer header */}
                  <div className="flex justify-between items-center z-10">
                    <span className="text-xs font-bold text-violet-400 bg-violet-950/40 border border-violet-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      Streaming Trailer Simulator
                    </span>
                    <div className="flex gap-1 items-end h-3">
                      <span className="w-1 bg-violet-400 animate-[bounce_0.8s_infinite_100ms] h-full" />
                      <span className="w-1 bg-violet-500 animate-[bounce_0.8s_infinite_300ms] h-[60%]" />
                      <span className="w-1 bg-fuchsia-500 animate-[bounce_0.8s_infinite_500ms] h-[80%]" />
                    </div>
                  </div>

                  {/* Centered Movie Title HUD */}
                  <div className="text-center z-10 my-auto">
                    <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-widest mb-2 drop-shadow-[0_4px_12px_rgba(139,92,246,0.3)]">
                      {currentMovie.title || currentMovie.name}
                    </h2>
                    <p className="text-xs text-violet-300 font-mono italic">
                      " {currentMovie.tagline || 'Activating Stream Link Direct...'} "
                    </p>
                  </div>

                  {/* Player Controller Bar */}
                  <div className="z-10 bg-black/50 backdrop-blur-md p-3.5 border border-purple-500/10 rounded-xl flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setIsPlaying(false)}
                        className="text-white hover:text-violet-400 cursor-pointer p-1"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      
                      {/* Timeline Seek */}
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-300"
                          style={{ width: `${playbackProgress}%` }}
                        />
                      </div>
                      
                      <span className="text-[10px] font-mono text-slate-400">
                        {Math.floor(playbackProgress / 60)}:{String(Math.floor(playbackProgress % 60)).padStart(2, '0')} / 1:40
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex gap-3">
                        <Volume2 className="w-4 h-4" />
                        <span className="font-medium">Surround Sound Pro 5.1</span>
                      </div>
                      <Maximize className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Backdrop with PLAY layer overlay */
            <div id="modal-player-trigger-frame" className="w-full h-full relative group">
              <img
                id="modal-backdrop-img"
                src={currentMovie.backdrop_path 
                  ? (currentMovie.backdrop_path.startsWith("http") 
                     ? currentMovie.backdrop_path 
                     : `https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`)
                  : "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1600"}
                alt={currentMovie.title || currentMovie.name}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
              />
              {/* Bottom Blend Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050110] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-black/20" />

              {/* Big Centered Glow Play Button */}
              <button
                id="modal-backdrop-play-trigger"
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 m-auto w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-violet-600 via-indigo-600 to-fuchsia-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg shadow-violet-500/40 hover:scale-110 active:scale-95 transition-transform duration-300 z-10 group"
              >
                <Play className="w-7 h-7 md:w-9 md:h-9 text-white fill-white ml-1 transition-transform group-hover:scale-105" />
              </button>
            </div>
          )}
        </div>

        {/* --- DETAILED INFORMATION WINDOW --- */}
        <div id="modal-lower-details-frame" className="p-6 md:p-8 flex flex-col gap-8">
          
          {/* Active Cinema Integration Panel (Only shows when movie is playing) */}
          {isPlaying && (
            <div className="flex flex-col gap-4 bg-[#0a0518]/70 border border-purple-500/20 rounded-2xl p-4 md:p-6 shadow-xl animate-[fadeIn_0.3s_ease-out]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-500/10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
                  <span className="text-xs font-black tracking-widest text-[#f8fafc] uppercase flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-violet-400" />
                    Now Streaming in Full HD
                  </span>
                </div>
                
                {/* Watch mode toggle: Stream vs Trailer */}
                <div className="flex bg-black/40 rounded-xl p-1 border border-purple-500/10">
                  <button
                    onClick={() => setPlayMode("stream")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      playMode === "stream"
                        ? "bg-violet-600 text-white font-extrabold shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Direct Stream HD
                  </button>
                  <button
                    onClick={() => setPlayMode("trailer")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      playMode === "trailer"
                        ? "bg-violet-600 text-white font-extrabold shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Film className="w-3 h-3" />
                    Watch Trailer
                  </button>
                </div>
              </div>

              {playMode === "stream" && (
                <div className="flex flex-col gap-5">
                  {/* Server Buttons */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Select HD Streaming Server</span>
                    <div id="streaming-servers-list animate-[fadeIn_0.3s_ease-out]" className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-purple-900/40">
                      {providers.filter(p => p.enabled).map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProvider(p.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                            selectedProvider === p.id
                              ? "bg-gradient-to-tr from-violet-600 to-indigo-600 border-violet-500 text-white shadow-lg shadow-violet-500/25 scale-[1.02]"
                              : "bg-[#0b071e]/70 border-purple-100/[0.04] text-slate-400 hover:border-purple-500/30 hover:bg-[#0b071e]"
                          }`}
                        >
                          <Server className="w-3.5 h-3.5" />
                          {p.id === DEFAULT_PROVIDER_ID ? `⭐ ${p.name}` : p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Episodes and Seasons Controls for TV Shows (Series) */}
                  {isTV && (
                    <div className="flex flex-col gap-4 bg-black/30 p-3.5 md:p-5 rounded-xl border border-purple-500/10 animate-[fadeIn_0.4s_ease-out]">
                      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="flex flex-col gap-1.5 flex-shrink-0 w-full md:w-max">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Select Season</span>
                          <select
                            value={selectedSeason}
                            onChange={(e) => {
                              setSelectedSeason(Number(e.target.value));
                              setSelectedEpisode(1);
                            }}
                            className="bg-[#050110] border border-purple-500/20 text-white rounded-lg p-2 md:p-2.5 text-xs font-black focus:outline-none focus:ring-1 focus:ring-violet-500 w-full min-w-[140px] cursor-pointer"
                          >
                            {Array.from({ length: currentMovie.number_of_seasons || currentMovie.seasons?.length || 5 }).map((_, i) => (
                              <option key={i + 1} value={i + 1}>Season {i + 1}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5 flex-grow min-w-0 w-full">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Select Episode</span>
                          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-purple-900/40 w-full">
                            {Array.from({ 
                              length: currentMovie.seasons?.find(s => s.season_number === selectedSeason)?.episode_count || 12 
                            }).map((_, i) => {
                              const epNum = i + 1;
                              return (
                                <button
                                  key={epNum}
                                  onClick={() => setSelectedEpisode(epNum)}
                                  className={`w-9 h-9 text-xs font-black rounded-lg flex items-center justify-center flex-shrink-0 transition-all border cursor-pointer ${
                                    selectedEpisode === epNum
                                      ? "bg-gradient-to-tr from-fuchsia-600 to-violet-600 border-violet-500 text-white shadow-md shadow-violet-500/30 font-black scale-105"
                                      : "bg-black/30 border-purple-500/10 text-slate-400 hover:border-purple-500/30 hover:text-white"
                                  }`}
                                >
                                  {epNum}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Main Title & Tagline Header */}
          <div className="flex flex-col gap-2">
            <h1 id="details-movie-title" className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white flex items-center gap-3">
              {isTV ? <Tv className="w-8 h-8 text-violet-400" /> : <Film className="w-8 h-8 text-violet-400" />}
              {currentMovie.title || currentMovie.name}
            </h1>
            {currentMovie.tagline && (
              <p id="details-movie-tagline" className="text-sm italic text-violet-400 font-medium">
                "{currentMovie.tagline}"
              </p>
            )}
          </div>

          {/* Grid Layout splits details info / side attributes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left 2/3: Synopsis overview and Cast listing */}
            <div className="col-span-1 md:col-span-2 flex flex-col gap-8">
              
              {/* Movie overview */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5 animate-[fadeIn_0.3s_ease-out]">
                  <Film className="w-4 h-4 text-violet-400" />
                  Synopsis Text
                </h3>
                <p id="details-movie-overview" className="text-slate-300 text-sm md:text-base leading-relaxed text-left">
                  {currentMovie.overview || "No movie synopsis description available."}
                </p>
              </div>

              {/* Cast/Credits profiles */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                  Top Billed Cast
                </h3>
                {isLoading ? (
                  <div className="flex items-center gap-2 py-2">
                    <CircularProgress size={16} color="primary" />
                    <span className="text-xs text-slate-400">Loading cast profiles...</span>
                  </div>
                ) : (
                  <div id="cast-list-row" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {currentMovie.credits?.cast && currentMovie.credits.cast.length > 0 ? (
                      currentMovie.credits.cast.slice(0, 4).map((member: CastMember) => {
                        const avatarVal = member.profile_path 
                          ? (member.profile_path.startsWith("http") 
                             ? member.profile_path 
                             : `https://image.tmdb.org/t/p/w185${member.profile_path}`)
                          : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80";
                        return (
                          <div 
                             key={member.id} 
                             id={`cast-card-${member.id}`}
                             className="bg-purple-950/20 rounded-xl p-2.5 border border-purple-500/5 flex items-center gap-2.5 hover:border-purple-500/25 hover:bg-purple-950/30 transition-all"
                           >
                            <img
                              src={avatarVal}
                              alt={member.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-lg object-cover bg-slate-800 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate leading-tight">
                                {member.name}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                {member.character}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400">Cast details unavailable.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right 1/3: Detailed attributes metadata panels */}
            <div className="col-span-1 bg-[#0f0a1f] rounded-2xl p-5 border border-purple-500/10 flex flex-col justify-between gap-5 text-sm h-fit">
              <div className="flex flex-col gap-4">
                
                {/* Score */}
                <div id="attr-rating" className="flex items-center justify-between pb-3 border-b border-purple-500/5">
                  <span className="text-xs text-slate-400 uppercase font-semibold">User Rating</span>
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{ratingText} / 10</span>
                  </div>
                </div>

                {/* Release period */}
                <div id="attr-date" className="flex items-center justify-between pb-3 border-b border-purple-500/5">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Air Date</span>
                  <div className="flex items-center gap-1.5 text-stone-200 font-semibold">
                    <Calendar className="w-4 h-4 text-violet-400" />
                    <span>{currentMovie.release_date || currentMovie.first_air_date || "2026-06-01"}</span>
                  </div>
                </div>

                {/* Runtime length */}
                <div id="attr-runtime" className="flex items-center justify-between pb-3 border-b border-purple-500/5">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Duration</span>
                  <div className="flex items-center gap-1.5 text-blue-300 font-semibold">
                    <Clock className="w-4 h-4 text-violet-400" />
                    <span>{currentMovie.runtime ? `${currentMovie.runtime} min` : "124 min"}</span>
                  </div>
                </div>

                {/* Origin details */}
                <div id="attr-language" className="flex items-center justify-between pb-3">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Languages</span>
                  <div className="flex items-center gap-1.5 text-stone-200 uppercase font-mono">
                    <Globe className="w-4 h-4 text-violet-400" />
                    <span>{currentMovie.original_language || "EN"}</span>
                  </div>
                </div>
              </div>

              {/* Watch Now simulated redirect block */}
              <button
                id="watch-now-redirection-btn"
                onClick={() => {
                  setPlayMode("stream");
                  setIsPlaying(true);
                }}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl py-3 px-4 font-bold text-xs uppercase tracking-wider hover:from-violet-500 hover:to-indigo-500 hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/10 mt-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isPlaying && playMode === "stream" ? "Reload Active Stream" : "Trigger Stream HD"}</span>
              </button>

              {/* Watchlist secondary button block */}
              <button
                id="details-watchlist-btn"
                onClick={() => movie && onToggleWatchlist?.(movie)}
                className={`w-full border rounded-xl py-3 px-4 font-bold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all flex items-center justify-center gap-2 mt-2 ${
                  isWatchlisted
                    ? "bg-rose-950/40 border-rose-500/30 text-rose-400 hover:bg-rose-950/60"
                    : "bg-[#0b071e]/70 border-purple-500/20 text-slate-300 hover:border-purple-500/40 hover:bg-[#0b071e]"
                }`}
              >
                <Heart className={`w-4 h-4 transition-colors ${isWatchlisted ? "fill-rose-500 text-rose-500" : ""}`} />
                <span>{isWatchlisted ? "Saved to Watchlist" : "Save to Watchlist"}</span>
              </button>

              {/* Share secondary button block */}
              <button
                id="details-share-btn"
                onClick={handleShare}
                className="w-full bg-[#0b071e]/70 border border-purple-500/20 text-slate-300 hover:border-purple-500/40 hover:bg-[#0b071e] rounded-xl py-3 px-4 font-bold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all flex items-center justify-center gap-2 mt-2"
              >
                <Share2 className="w-4 h-4 text-violet-400" />
                <span>Share Movie</span>
              </button>
            </div>
          </div>

          {/* Similar Film recommendations slider */}
          <div className="flex flex-col gap-4 mt-4 border-t border-purple-500/10 pt-6">
            <h3 className="text-sm uppercase font-extrabold text-white tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-fuchsia-400" />
              Similar Film Recommendations
            </h3>
            {isLoading ? (
              <span className="text-xs text-slate-400">Loading recommended films...</span>
            ) : (
              <div id="similar-movies-row" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {currentMovie.similar?.results && currentMovie.similar.results.length > 0 ? (
                  currentMovie.similar.results.slice(0, 4).map((m: Movie) => {
                    const posterVal = m.poster_path
                      ? (m.poster_path.startsWith("http") 
                         ? m.poster_path 
                         : `https://image.tmdb.org/t/p/w342${m.poster_path}`)
                      : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=300";
                    return (
                      <div
                        key={m.id}
                        id={`similar-card-${m.id}`}
                        onClick={() => {
                          onMovieClick(m);
                          // Reset play progress
                          setIsPlaying(false);
                          setPlaybackProgress(0);
                        }}
                        className="group cursor-pointer relative overflow-hidden aspect-video rounded-xl border border-purple-500/5 bg-slate-900 transition-all duration-300 hover:border-violet-500/50 hover:scale-102"
                      >
                        <img
                          src={m.backdrop_path ? (m.backdrop_path.startsWith("http") ? m.backdrop_path : `https://image.tmdb.org/t/p/w342${m.backdrop_path}`) : posterVal}
                          alt={m.title || m.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover brightness-75 group-hover:brightness-90 transition-all"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-2 px-3">
                          <p className="text-xs font-bold text-white truncate leading-snug">
                            {m.title || m.name}
                          </p>
                          <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5 mt-0.5">
                            ★ {m.vote_average.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400">No similar companion movies detected.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </DialogContent>
  </Dialog>
  );
};
