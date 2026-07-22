import React, { useState, useEffect } from "react";
import { Movie, MovieDetails, Video, CastMember, CrewMember } from "../types";
import { api } from "../services/api";
import { TMDBImage } from "./TMDBImage";
import { getTMDBImageUrl } from "../utils/imageUtils";
import { 
  X, Play, Star, Clock, Globe, Film, ArrowRight, Sparkles, 
  Smile, Calendar, Volume2, Maximize, RotateCcw, AlertCircle, Tv, Server, Heart, Share2, Sliders, CheckCircle
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

  // Custom play progress values
  const [playbackProgress, setPlaybackProgress] = useState(0); // in seconds
  const [shareSuccess, setShareSuccess] = useState(false);
  const [brandLabel, setBrandLabel] = useState("Bitcine");
  const [creditsTab, setCreditsTab] = useState<"cast" | "crew">("cast");

  // Detect TV Series
  const isTV = !!(
    movie && (
      movie.first_air_date ||
      (movie.name && !movie.title) ||
      (movie as any).seasons ||
      (movie as any).number_of_seasons ||
      (movie.id >= 201 && movie.id <= 205)
    )
  );

  // Determine watchlisted state
  const isWatchlisted = movie ? watchlist.some((m) => m.id === movie.id) : false;

  const handleShare = async () => {
    const movieTitle = currentMovie?.title || currentMovie?.name || movie?.title || movie?.name || "Movie";
    const releaseYear = yearText;
    const movieId = movie?.id;
    
    // Create clean shareable slug URL
    const cleanTitle = (movieTitle || "movie").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const shareUrl = typeof window !== "undefined" 
      ? `${window.location.origin}/?watch=${movieId}-${cleanTitle}` 
      : "https://bitcine.online/";
    
    const shareText = `Check out "${movieTitle}" (${releaseYear}) on ${brandLabel} Stream! 🍿`;
    
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${brandLabel} Stream - ${movieTitle}`,
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

  const getActiveKey = () => {
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    const isCineby = hostname.includes("cineby") || hostname.includes("cineby.mom") || hostname.includes("cineby.at");
    const isFlixer = hostname.includes("flixer") || hostname.includes("flixer.ink");
    const isCineplay = hostname.includes("cineplay");
    return isFlixer 
      ? "flixer_continue_watching" 
      : (isCineby 
        ? "cineby_continue_watching" 
        : (isCineplay 
          ? "cineplay_continue_watching" 
          : "bitcine_continue_watching"));
  };

  // Helper inside modal: save current progression locally
  const saveCurrentProgressLocally = (sec: number, sNum: number = selectedSeason, eNum: number = selectedEpisode) => {
    if (!movie) return;
    try {
      const saved = localStorage.getItem(getActiveKey());
      let list: Movie[] = saved ? JSON.parse(saved) : [];
      
      const filtered = list.filter(m => m.id !== movie.id);
      
      const updatedItem: Movie = {
        ...movie,
        progressSeconds: sec,
        lastWatchedSeason: sNum,
        lastWatchedEpisode: eNum,
        lastWatchedTime: Date.now()
      };
      
      list = [updatedItem, ...filtered].slice(0, 15);
      localStorage.setItem(getActiveKey(), JSON.stringify(list));
    } catch (err) {
      console.warn("MDU: Local storage sync error:", err);
    }
  };

  // Handle load state and check domain
  useEffect(() => {
    const isCineby = typeof window !== "undefined" && (
      window.location.hostname.includes("cineby") || 
      window.location.hostname.includes("cineby.mom") ||
      window.location.hostname.includes("cineby.at")
    );
    const isFlixer = typeof window !== "undefined" && (
      window.location.hostname.includes("flixer") ||
      window.location.hostname.includes("flixer.ink")
    );
    const isCineplay = typeof window !== "undefined" && (
      window.location.hostname.includes("cineplay")
    );
    setBrandLabel(isFlixer ? "Flixer" : (isCineby ? "Cineby" : (isCineplay ? "Cineplay" : "Bitcine")));

    if (open && movie) {
      setIsPlaying(initialPlayState);
      setPlayMode("stream");
      setSelectedProvider(DEFAULT_PROVIDER_ID);
      setCreditsTab("cast");
      
      // Load saved progress state if exists in local continuing watching list!
      try {
        const saved = localStorage.getItem(getActiveKey());
        if (saved) {
          const list = JSON.parse(saved) as Movie[];
          const found = list.find(m => m.id === movie.id);
          if (found) {
            setPlaybackProgress(found.progressSeconds || 0);
            setSelectedSeason(found.lastWatchedSeason || 1);
            setSelectedEpisode(found.lastWatchedEpisode || 1);
            return;
          }
        }
      } catch (err) {
        console.warn(err);
      }

      setPlaybackProgress(0);
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
        const fallbackList = api.getFallbackMovies();
        const fallbackSeriesList = api.getFallbackSeries();
        const found = isTV 
          ? fallbackSeriesList.find(m => m.id === movie.id)
          : fallbackList.find(m => m.id === movie.id);
        
        const mockDetail: MovieDetails = {
          ...(found || movie),
          credits: {
            cast: [
              { id: 101, name: "Jessica Chastain", character: "Commander Lewis", profile_path: null },
              { id: 102, name: "Cillian Murphy", character: "Theoretical Physicist", profile_path: null },
              { id: 103, name: "Zendaya", character: "Chani", profile_path: null },
              { id: 104, name: "Tom Hardy", character: "Mercenary Outlaw", profile_path: null }
            ],
            crew: [
              { id: 201, name: "Christopher Nolan", job: "Director", department: "Directing", profile_path: null },
              { id: 202, name: "Hans Zimmer", job: "Original Music Composer", department: "Sound", profile_path: null },
              { id: 203, name: "Emma Thomas", job: "Producer", department: "Production", profile_path: null },
              { id: 204, name: "Hoyte van Hoytema", job: "Director of Photography", department: "Camera", profile_path: null }
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

  // ID resolver for direct streaming (mapping local ID lists to live servers)
  const getStreamId = (): string | number => {
    const id = movie.id;
    if (id === 1) return "135548"; // Celestial Echoes -> mapping
    if (id === 2) return "1000100";
    if (id === 3) return "157336"; // Interstellar
    if (id === 4) return "550"; // Neon Abyss -> Fight Club
    if (id === 5) return "438631"; // Dune
    if (id === 6) return "102376"; 
    if (id === 7) return "1002271";
    if (id === 8) return "1035806";
    if (id === 9) return "129";
    if (id === 201) return "135548";
    if (id === 202) return "66732"; // Stranger Things
    if (id === 203) return "211617";
    if (id === 204) return "102376";
    if (id === 205) return "218206";
    return id;
  };

  const handleNextEpButton = () => {
    const nextEp = selectedEpisode + 1;
    setSelectedEpisode(nextEp);
    setPlaybackProgress(0);
    saveCurrentProgressLocally(0, selectedSeason, nextEp);
  };

  return (
    <Dialog
      id={`movie-details-dialog-${movie.id}`}
      open={open}
      keepMounted={false}
      onClose={onClose}
      fullScreen={true}
      className="z-[99]"
      sx={{
        "& .MuiBackdrop-root": {
          backgroundColor: "rgba(3, 1, 2, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        },
        "& .MuiPaper-root": {
          backgroundColor: "#050102",
          color: "#f8fafc",
          overflowX: "hidden",
          margin: "0px !important",
          width: "100% !important",
          maxWidth: "none !important",
          height: "100% !important",
          maxHeight: "none !important",
          borderRadius: "0px",
          boxShadow: "none",
        }
      }}
    >
      <DialogContent id="modal-content-area" className="p-0 select-none relative scrollbar-none sm:scrollbar-thin sm:scrollbar-thumb-red-950 bg-[#050102]">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full"
        >
          
          {/* Share Success Toast Indicator */}
          {shareSuccess && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 bg-red-600/95 text-white text-[10px] font-black tracking-widest px-4 py-2 rounded-full shadow-xl shadow-red-950/50 border border-red-500 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] flex items-center gap-1.5 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              Copied Stream link!
            </div>
          )}

          {/* Floating Action Buttons Row */}
          <div className="absolute top-3 right-3 md:top-4 md:right-4 z-50 flex items-center gap-2">
            {/* Share Button */}
            <button
              id="modal-share-floating-btn"
              onClick={handleShare}
              aria-label="Share movie"
              className="bg-black/80 hover:bg-slate-900 text-white rounded-full p-2 md:p-2.5 hover:scale-110 active:scale-95 border border-red-500/15 cursor-pointer shadow-lg shadow-black/50 transition-all backdrop-blur-md duration-200"
            >
              <Share2 className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
            </button>
            
            {/* Watchlist Toggle Heart Button */}
            <button
              id="modal-watchlist-floating-btn"
              onClick={() => movie && onToggleWatchlist?.(movie)}
              aria-label={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
              className="bg-black/80 hover:bg-slate-900 text-white rounded-full p-2 md:p-2.5 hover:scale-110 active:scale-95 border border-red-500/15 cursor-pointer shadow-lg shadow-black/50 transition-all backdrop-blur-md duration-200"
            >
              <Heart className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${isWatchlisted ? "fill-red-600 text-red-500" : "text-white"}`} />
            </button>

            {/* Floating Close Button */}
            <button
              id="modal-close-btn"
              onClick={onClose}
              aria-label="Close"
              className="bg-black/80 hover:bg-slate-900 text-white rounded-full p-2 md:p-2.5 hover:scale-110 active:scale-95 border border-red-500/15 cursor-pointer shadow-lg shadow-black/50 transition-all backdrop-blur-md duration-200"
            >
              <X className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </button>
          </div>

        {/* --- CINEMATOGRAPHIC PLAYER FRAME WITH RED GRADIENT OVERLAYS --- */}
        <div id="modal-upper-player-frame" className="relative w-full aspect-video md:max-h-[640px] bg-black overflow-hidden border-b border-red-950/30">
          
          {isPlaying ? (
            <div id="active-theatre-player" className="w-full h-full relative bg-black animate-[fadeIn_0.5s_ease-out]">
              {playMode === "stream" ? (
                /* Direct Stream Server Playback mapping into the brand defaults */
                <iframe
                  id="direct-stream-player"
                  src={getEmbedUrl(selectedProvider, isTV ? 'tv' : 'movie', getStreamId(), selectedSeason, selectedEpisode, playbackProgress)}
                  title="Direct Stream Player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  referrerPolicy="no-referrer"
                  allowFullScreen
                  className="w-full h-full border-0 absolute inset-0"
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
                  className="w-full h-full border-0 absolute inset-0"
                />
              ) : (
                /* Cinematic simulated video element if missing embed stream */
                <div id="simulated-theatre-screen" className="w-full h-full flex flex-col justify-between p-6 bg-gradient-to-b from-red-950/20 via-black to-slate-950 relative">
                  <div className="absolute inset-0 bg-radial-gradient from-red-600/[0.08] via-transparent to-transparent pointer-events-none" />
                  <div className="flex justify-between items-center z-10">
                    <span className="text-xs font-bold text-red-500 bg-red-950/40 border border-red-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      Stream Buffering Simulator
                    </span>
                  </div>
                  <div className="text-center z-10 my-auto">
                    <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-widest mb-2 drop-shadow-[0_4px_12px_rgba(220,38,38,0.3)]">
                      {currentMovie.title || currentMovie.name}
                    </h2>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Backdrop with high gradient and Red Play Triangle overlay launcher */
            <div id="theatre-splash-backdrop" className="relative w-full h-full">
              <TMDBImage
                imagePath={currentMovie.backdrop_path || currentMovie.poster_path}
                imageSize="w1280"
                fallbackType="backdrop"
                alt={currentMovie.title || currentMovie.name || "Media"}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
                className="object-cover opacity-65"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050102] via-[#050102]/40 to-black/35" />
              <div className="absolute inset-0 bg-gradient-to-r from-red-950/20 via-transparent to-transparent" />
              
              <button
                id="modal-backdrop-play-btn"
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 m-auto w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 rounded-full flex items-center justify-center cursor-pointer shadow-lg shadow-red-500/35 hover:scale-110 active:scale-95 transition-transform duration-300 z-10 group"
              >
                <Play className="w-7 h-7 md:w-9 md:h-9 text-white fill-white ml-1 transition-transform group-hover:scale-105" />
              </button>
            </div>
          )}
        </div>

        {/* --- DETAILED INFORMATION WINDOW --- */}
        <div id="modal-lower-details-frame" className="p-4 sm:p-6 md:p-8 flex flex-col gap-6 md:gap-8 max-w-5xl mx-auto w-full">
          
          {/* Active Cinema Integration Panel (Only shows when movie is playing) */}
          {isPlaying && (
            <div className="flex flex-col gap-4 bg-[#0a0102]/85 border border-red-500/20 rounded-2xl p-4 md:p-6 shadow-xl animate-[fadeIn_0.3s_ease-out]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-red-950/25">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></div>
                  <span className="text-xs font-black tracking-widest text-[#f8fafc] uppercase flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-red-500" />
                    Now Streaming in HD (VidKing Player)
                  </span>
                </div>
                
                {/* Watch mode toggle: Stream vs Trailer */}
                <div className="flex bg-black/50 rounded-xl p-1 border border-red-550/10">
                  <button
                    onClick={() => setPlayMode("stream")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer flex items-center gap-1.5 ${
                      playMode === "stream"
                        ? "bg-red-600 text-white shadow-md shadow-red-950/50"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current text-white" />
                    Direct Stream HD
                  </button>
                  <button
                    onClick={() => setPlayMode("trailer")}
                    className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer flex items-center gap-1.5 ${
                      playMode === "trailer"
                        ? "bg-red-600 text-white shadow-md shadow-red-950/50"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Film className="w-3 h-3 text-white" />
                    Watch Trailer
                  </button>
                </div>
              </div>

              {playMode === "stream" && (
                <div className="flex flex-col gap-5">
                  {/* Server Buttons */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Select HD Streaming Server</span>
                    <div id="streaming-servers-list" className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-red-950">
                      {providers.filter(p => p.enabled).map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProvider(p.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                            selectedProvider === p.id
                              ? "bg-gradient-to-tr from-red-600 to-rose-700 border-red-500 text-white shadow-lg shadow-red-600/25 scale-[1.02]"
                              : "bg-[#0a0102]/70 border-red-500/[0.04] text-slate-400 hover:border-red-500/35 hover:bg-[#0c0203]"
                          }`}
                        >
                          <Server className="w-3.5 h-3.5" />
                          {p.id === DEFAULT_PROVIDER_ID ? `🔥 ${p.name}` : p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Modern Interactive Progress Controller for IFrame streaming */}
                  {selectedProvider === 'vidking' && (
                    <div className="bg-gradient-to-r from-[#030102] to-[#0a0103] border border-red-500/10 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs w-full">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-500 animate-pulse" />
                        <span className="font-bold text-slate-300 uppercase tracking-wider">Save Watch Progress:</span>
                        <span className="font-mono bg-red-950/45 px-2.5 py-1 text-red-400 border border-red-550/10 rounded-md font-bold text-[11px]">
                          {Math.floor(playbackProgress / 60)}m {(playbackProgress % 60).toString().padStart(2, '0')}s
                        </span>
                      </div>
                      
                      {/* Dynamic range slider allows modifying starting progress seconds inside iframe embed! */}
                      <div className="flex-1 max-w-sm flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-mono">0m</span>
                        <input 
                          type="range" 
                          min="0"
                          max={movie.runtime ? movie.runtime * 60 : 7200}
                          value={playbackProgress}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setPlaybackProgress(val);
                            saveCurrentProgressLocally(val);
                          }}
                          className="flex-1 accent-red-600 h-1 bg-slate-850 rounded-lg cursor-pointer transition-all hover:accent-red-500"
                        />
                        <span className="text-[10px] text-slate-400 font-mono">
                          {movie.runtime ? `${movie.runtime}m` : "2h"}
                        </span>
                      </div>

                      {/* TV Next Episode and selection controls */}
                      {isTV && (
                        <button
                          onClick={handleNextEpButton}
                          className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-1 cursor-pointer rounded-lg shadow-md shadow-red-950"
                        >
                          Play Next Ep <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Episodes and Seasons Controls for TV Shows (Series) */}
                  {isTV && (
                    <div className="flex flex-col gap-4 bg-black/30 p-3.5 md:p-5 rounded-xl border border-red-500/10 animate-[fadeIn_0.4s_ease-out]">
                      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="flex flex-col gap-1.5 flex-shrink-0 w-full md:w-max">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Select Season</span>
                          <select
                            value={selectedSeason}
                            onChange={(e) => {
                              const sNum = Number(e.target.value);
                              setSelectedSeason(sNum);
                              setSelectedEpisode(1);
                              setPlaybackProgress(0);
                              saveCurrentProgressLocally(0, sNum, 1);
                            }}
                            className="bg-[#050102] border border-red-500/20 text-white rounded-lg p-2 md:p-2.5 text-xs font-black focus:outline-none focus:ring-1 focus:ring-red-500 w-full min-w-[140px] cursor-pointer"
                          >
                            {Array.from({ length: currentMovie.number_of_seasons || currentMovie.seasons?.length || 5 }).map((_, i) => (
                              <option key={i + 1} value={i + 1}>Season {i + 1}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5 flex-grow min-w-0 w-full">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Select Episode</span>
                          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-red-900/40 w-full">
                            {Array.from({ 
                              length: currentMovie.seasons?.find(s => s.season_number === selectedSeason)?.episode_count || 12 
                            }).map((_, i) => {
                              const epNum = i + 1;
                              return (
                                <button
                                  key={epNum}
                                  onClick={() => {
                                    setSelectedEpisode(epNum);
                                    setPlaybackProgress(0);
                                    saveCurrentProgressLocally(0, selectedSeason, epNum);
                                  }}
                                  className={`w-9 h-9 text-xs font-black rounded-lg flex items-center justify-center flex-shrink-0 transition-all border cursor-pointer ${
                                    selectedEpisode === epNum
                                      ? "bg-gradient-to-tr from-red-600 to-rose-600 border-red-500 text-white shadow-md shadow-red-500/30 scale-105"
                                      : "bg-black/30 border-red-500/10 text-slate-400 hover:border-red-500/35 hover:text-white"
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
          <div className="flex flex-col gap-2.5 animate-[fadeIn_0.5s_ease-out]">
            <h1 id="details-movie-title" className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-2 sm:gap-3 leading-tight matches-glow">
              {isTV ? <Tv className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 flex-shrink-0" /> : <Film className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 flex-shrink-0" />}
              <span>{currentMovie.title || currentMovie.name}</span>
            </h1>
            {currentMovie.tagline && (
              <p id="details-movie-tagline" className="text-xs sm:text-sm italic text-red-400 font-medium border-l-2 border-red-500/20 pl-2.5">
                "{currentMovie.tagline}"
              </p>
            )}
          </div>

          {/* Inline quick info metrics block */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-medium border-b border-red-500/10 pb-4 md:pb-5">
            <span className="flex items-center gap-1 text-amber-400 font-extrabold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {ratingText}
            </span>
            <span className="bg-red-500/10 border border-red-500/15 px-2.5 py-1 rounded-lg text-red-450 font-bold font-mono">
              {yearText}
            </span>
            {currentMovie.runtime && (
              <span className="flex items-center gap-1 bg-red-900/10 border border-red-500/15 px-2.5 py-1 rounded-lg text-slate-300">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                {currentMovie.runtime} min
              </span>
            )}
            <span className="bg-[#050102] border border-red-950 px-2.5 py-1 rounded-lg uppercase text-[10px] font-black tracking-widest text-[#f8fafc]">
              {currentMovie.original_language || "EN"}
            </span>
            {isTV && (
              <span className="bg-red-500/10 border border-red-500/15 px-2.5 py-1 rounded-lg text-red-450 font-black text-[10px] uppercase tracking-wider">
                TV Series
              </span>
            )}
          </div>

          {/* Grid Layout splits details info / side attributes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left 2/3: Synopsis overview and Cast listing */}
            <div className="col-span-1 md:col-span-2 flex flex-col gap-8">
              
              {/* Movie overview */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs uppercase font-extrabold text-[#94a3b8] tracking-wider flex items-center gap-1.5 animate-[fadeIn_0.3s_ease-out]">
                  <Film className="w-4 h-4 text-red-500" />
                  Synopsis Overview
                </h3>
                <p id="details-movie-overview" className="text-slate-300 text-sm md:text-base leading-relaxed text-left">
                  {currentMovie.overview || "No movie synopsis description available."}
                </p>
              </div>

              {/* Cast/Credits profiles */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-red-500/10 pb-2">
                  <h3 className="text-xs uppercase font-extrabold text-[#94a3b8] tracking-wider flex items-center gap-1.5">
                    Cast & Crew
                  </h3>
                  
                  {/* Segmented Tab switches */}
                  <div className="flex bg-black/50 rounded-xl p-0.5 border border-red-500/10">
                    <button
                      type="button"
                      onClick={() => setCreditsTab("cast")}
                      className={`px-3 py-1 rounded-lg text-[9px] uppercase font-black tracking-widest transition-all cursor-pointer ${
                        creditsTab === "cast"
                          ? "bg-red-650 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Cast
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreditsTab("crew")}
                      className={`px-3 py-1 rounded-lg text-[9px] uppercase font-black tracking-widest transition-all cursor-pointer ${
                        creditsTab === "crew"
                          ? "bg-red-650 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Crew
                    </button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center gap-2 py-2">
                    <CircularProgress size={16} color="error" />
                    <span className="text-xs text-slate-400">Loading credits...</span>
                  </div>
                ) : (
                  <div>
                    {creditsTab === "cast" ? (
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
                                 key={`cast-${member.id}`} 
                                 className="flex flex-col items-center bg-black/45 hover:bg-black p-3.5 rounded-2xl border border-red-500/[0.04] text-center gap-2 relative overflow-hidden transition-all duration-300 hover:border-red-500/25 group/card"
                              >
                                <div className="w-12 h-12 rounded-full overflow-hidden relative border border-red-500/20 shadow-md">
                                  <TMDBImage 
                                    imagePath={member.profile_path}
                                    imageSize="w185"
                                    fallbackType="profile"
                                    alt={member.name}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                                  />
                                </div>
                                <div className="min-w-0 w-full">
                                  <p className="text-[11px] font-bold text-white leading-tight truncate px-1">{member.name}</p>
                                  <p className="text-[9px] text-slate-500 leading-snug truncate mt-0.5 px-1">{member.character}</p>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-xs text-slate-500">Cast profiles currently unlogged.</span>
                        )}
                      </div>
                    ) : (
                      <div id="crew-list-row" className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-[fadeIn_0.2s_ease-out]">
                        {currentMovie.credits?.crew && currentMovie.credits.crew.length > 0 ? (
                          currentMovie.credits.crew
                            .filter((member, index, self) => 
                              self.findIndex(m => m.id === member.id && m.job === member.job) === index
                            )
                            .sort((a, b) => {
                              const premiums = ["director", "writer", "screenplay", "producer", "composer"];
                              const aJob = a.job.toLowerCase();
                              const bJob = b.job.toLowerCase();
                              const aPremium = premiums.findIndex(p => aJob.includes(p));
                              const bPremium = premiums.findIndex(p => bJob.includes(p));
                              if (aPremium !== -1 && bPremium !== -1) return aPremium - bPremium;
                              if (aPremium !== -1) return -1;
                              if (bPremium !== -1) return 1;
                              return 0;
                            })
                            .slice(0, 4)
                            .map((member: CrewMember, idx: number) => {
                              return (
                                <div 
                                   key={`crew-${member.id}-${idx}`} 
                                   className="flex flex-col items-center bg-black/45 hover:bg-black p-3.5 rounded-2xl border border-red-500/[0.04] text-center gap-2 relative overflow-hidden transition-all duration-300 hover:border-red-500/25 group/card"
                                >
                                  <div className="w-12 h-12 rounded-full overflow-hidden relative border border-red-500/20 shadow-md">
                                    <TMDBImage 
                                      imagePath={member.profile_path}
                                      imageSize="w185"
                                      fallbackType="profile"
                                      alt={member.name}
                                      fill
                                      className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                                    />
                                  </div>
                                  <div className="min-w-0 w-full">
                                    <p className="text-[11px] font-bold text-white leading-tight truncate px-1">{member.name}</p>
                                    <p className="text-[9.5px] text-red-500 font-extrabold uppercase tracking-wider leading-snug truncate mt-0.5 px-1">{member.job}</p>
                                  </div>
                                </div>
                              );
                            })
                        ) : (
                          <span className="text-xs text-slate-500 col-span-full">Crew credits currently unlogged.</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right 1/3: Side technical tags */}
            <div className="col-span-1 flex flex-col gap-6 bg-slate-950/40 p-5 rounded-2xl border border-red-550/[0.03]">
              
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Global Status</span>
                <span className="text-xs font-black text-rose-500 uppercase flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  HD stream online
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Primary Genre</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {currentMovie.genres && currentMovie.genres.length > 0 ? (
                    currentMovie.genres.map(g => (
                      <span key={g.id} className="bg-red-650/15 border border-red-500/20 text-red-400 font-bold px-2 py-1 text-[10px] uppercase rounded-md">
                        {g.name}
                      </span>
                    ))
                  ) : (
                    <span className="bg-slate-900 border border-white/5 text-slate-300 font-semibold px-2 py-0.5 text-[10px] uppercase rounded">
                      Cinema
                    </span>
                  )}
                </div>
              </div>

              {currentMovie.popularity && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Global Traffic</span>
                  <p className="text-xs font-mono font-bold text-white mt-1">
                    {Math.round(currentMovie.popularity)} users active
                  </p>
                </div>
              )}

              {currentMovie.origin_country && currentMovie.origin_country.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Production Region</span>
                  <p className="text-xs font-extrabold text-[#f1f5f9] mt-0.5 uppercase flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-red-500" />
                    {currentMovie.origin_country.join(", ")}
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Similar Recommended Carousel Section */}
          <div className="flex flex-col gap-4 border-t border-red-950/20 pt-8 mt-4 animate-[fadeIn_0.5s_ease-out]">
            <h3 className="text-xs uppercase font-black text-[#94a3b8] tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-red-500" />
              People Also Streamed
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {currentMovie.similar?.results && currentMovie.similar.results.length > 0 ? (
                currentMovie.similar.results.slice(0, 4).map((m: Movie) => {
                  return (
                    <div 
                      key={m.id}
                      onClick={() => onMovieClick(m)}
                      className="group flex flex-col gap-2 rounded-xl overflow-hidden cursor-pointer"
                    >
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-red-500/[0.04] bg-[#0e0720]">
                        <TMDBImage 
                          imagePath={m.poster_path || m.backdrop_path}
                          imageSize="w342"
                          fallbackType="poster"
                          alt={m.title || m.name || "Media"}
                          fill
                          sizes="(max-width: 640px) 50vw, 20vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 pb-3 justify-center z-10">
                          <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded shadow-md">
                            Details
                          </span>
                        </div>
                      </div>
                      <p className="text-[10.5px] font-extrabold text-slate-300 truncate group-hover:text-red-400 transition-colors uppercase">
                        {m.title || m.name}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 font-medium">No recommendations listed.</p>
              )}
            </div>
          </div>

        </div>

      </motion.div>
      </DialogContent>
    </Dialog>
  );
};
