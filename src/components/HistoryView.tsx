"use client";

import React, { useState, useEffect } from "react";
import { Movie } from "../types";
import { 
  History, 
  Trash2, 
  Play, 
  Tv, 
  Film, 
  Clock, 
  Plus, 
  Minus, 
  RotateCcw, 
  Activity, 
  ChevronRight,
  TrendingUp,
  Sliders,
  CheckCircle,
  HelpCircle
} from "lucide-react";

interface HistoryViewProps {
  onMovieClick: (movie: Movie) => void;
  onPlayWithProgress?: (movie: Movie, season?: number, episode?: number, seconds?: number) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ 
  onMovieClick,
  onPlayWithProgress
}) => {
  const [historyList, setHistoryList] = useState<Movie[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "movies" | "shows">("all");
  const [showProgressModal, setShowProgressModal] = useState<number | null>(null);
  const [customMinutes, setCustomMinutes] = useState<string>("5");
  const [brandLabel, setBrandLabel] = useState("Bitcine");

  // Load history from localStorage on mount and register custom brand naming
  useEffect(() => {
    const isCineby = typeof window !== "undefined" && (
      window.location.hostname.includes("cineby") || 
      window.location.hostname.includes("cineby.mom") ||
      window.location.hostname.includes("cineby.at")
    );
    setBrandLabel(isCineby ? "Cineby" : "Bitcine");

    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem("bitcine_continue_watching");
      if (saved) {
        const parsed = JSON.parse(saved) as Movie[];
        setHistoryList(parsed);
      }
    } catch (e) {
      console.error("Failed to fetch stream logs", e);
    }
  };

  // Completely wipe entire watch logs
  const handleClearAll = () => {
    if (confirm("Are you sure you want to completely clear your cinematic stream history?")) {
      try {
        localStorage.removeItem("bitcine_continue_watching");
        setHistoryList([]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Delete a single historical log row
  const handleRemoveItem = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = historyList.filter(m => m.id !== id);
      localStorage.setItem("bitcine_continue_watching", JSON.stringify(updated));
      setHistoryList(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // Directly sets tracking progress in seconds
  const handleUpdateProgress = (id: number, seconds: number) => {
    const updated = historyList.map(movie => {
      if (movie.id === id) {
        return {
          ...movie,
          progressSeconds: Math.max(0, seconds),
          lastWatchedTime: Date.now()
        };
      }
      return movie;
    });
    localStorage.setItem("bitcine_continue_watching", JSON.stringify(updated));
    setHistoryList(updated);
    setShowProgressModal(null);
  };

  // TV Quick-Action helper: Transition TV series show log directly to NEXT episode at 0 seconds
  const handleNextEpisode = (movie: Movie, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentEp = movie.lastWatchedEpisode || 1;
    const currentSeason = movie.lastWatchedSeason || 1;
    
    // We increment episode. On history tab card, we assume default 10 episodes loop or simple sequence
    const nextEp = currentEp + 1;
    
    const updated = historyList.map(item => {
      if (item.id === movie.id) {
        return {
          ...item,
          lastWatchedEpisode: nextEp,
          progressSeconds: 0,
          lastWatchedTime: Date.now()
        };
      }
      return item;
    });

    localStorage.setItem("bitcine_continue_watching", JSON.stringify(updated));
    setHistoryList(updated);

    // Prompt user showing updated state, or play immediately
    const targetMovie = updated.find(item => item.id === movie.id);
    if (targetMovie && onPlayWithProgress) {
      onPlayWithProgress(targetMovie, currentSeason, nextEp, 0);
    } else {
      onMovieClick({ ...movie, lastWatchedEpisode: nextEp, progressSeconds: 0 });
    }
  };

  // Triggering main playback starting with correct timestamp offsets
  const handlePlayItem = (movie: Movie) => {
    const defaultS = movie.lastWatchedSeason || 1;
    const defaultE = movie.lastWatchedEpisode || 1;
    const progressS = movie.progressSeconds || 0;

    if (onPlayWithProgress) {
      onPlayWithProgress(movie, defaultS, defaultE, progressS);
    } else {
      onMovieClick(movie);
    }
  };

  // Classify film vs show based on TMDB specifications
  const isTVShow = (movie: Movie) => {
    return !!(
      movie.first_air_date ||
      (movie.name && !movie.title) ||
      (movie.id >= 201 && movie.id <= 205)
    );
  };

  const filteredHistory = historyList.filter(movie => {
    const tv = isTVShow(movie);
    if (activeFilter === "movies") return !tv;
    if (activeFilter === "shows") return tv;
    return true;
  });

  return (
    <div id="history-view-panel" className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-24 pb-12 select-none animate-[fadeIn_0.5s_ease-out]">
      
      {/* Dynamic Ambient Blur Backgrounds */}
      <div className="absolute top-12 left-1/4 w-80 h-80 bg-red-600/[0.03] filter blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-600/[0.03] filter blur-[120px] rounded-full pointer-events-none" />

      {/* Header and Filter selections */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-red-950/40 pb-5 mb-8 gap-5">
        <div className="flex flex-col gap-1.5 matches-glow">
          <span className="text-[10px] text-red-500 font-extrabold tracking-widest uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
            User Playback telemetry
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white flex items-center gap-2">
            <History className="w-6 h-6 text-red-500" />
            Continue Watching Sync
          </h1>
          <p className="text-xs text-slate-400 font-medium max-w-xl">
            Keep track of active stream pipelines on the provider server. Resume watching from the exact minutes and seasons you left off, with automated episode progression.
          </p>
        </div>

        {/* Global Action Tools */}
        <div className="flex flex-wrap items-center gap-2.5">
          {historyList.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-[10px] uppercase font-black tracking-wider border border-red-500/25 hover:border-red-500/50 bg-red-950/10 text-red-400 hover:text-white px-3.5 py-2 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer rounded-full"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset Watch History
            </button>
          )}

          {/* Sub category filter tabs */}
          <div className="bg-slate-950/90 border border-red-950/30 p-1 rounded-xl flex">
            {(["all", "movies", "shows"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setActiveFilter(mode)}
                className={`text-[9px] uppercase font-black tracking-widest px-3.5 py-2 transition-all cursor-pointer rounded-lg ${
                  activeFilter === mode 
                    ? "bg-red-600 text-white shadow-lg shadow-red-950/60" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State Banner */}
      {filteredHistory.length === 0 ? (
        <div className="bg-[#050102]/60 border border-red-500/10 rounded-3xl p-10 md:p-16 text-center max-w-lg mx-auto mt-10">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto mb-4 animate-[bounce_2s_infinite]">
            <History className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black uppercase text-white tracking-wide">No Streaming history found</h2>
          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm mx-auto mt-2">
            You haven't played any videos yet on {brandLabel}. Start exploring home page blockbusters or premium series to launch interactive tracking features.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 transition-all shadow-lg hover:shadow-red-950/50 hover:scale-[1.03] active:scale-[0.97] rounded-full cursor-pointer"
          >
            Explore Film Catalog
          </button>
        </div>
      ) : (
        /* Dynamic History Cards grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {filteredHistory.map((movie) => {
            const isTV = isTVShow(movie);
            const title = movie.title || movie.name || "Untitled Cinema";
            const curSeason = movie.lastWatchedSeason || 1;
            const curEpisode = movie.lastWatchedEpisode || 1;
            const duration = movie.runtime ? movie.runtime * 60 : 7200; // fallback default 2h
            const progSec = movie.progressSeconds || 0;
            const percentage = Math.min(100, Math.max(0, (progSec / duration) * 100));
            const fontMono = "font-mono text-[10px]";

            const progressDisplay = progSec > 0
              ? `${Math.floor(progSec / 60)}m ${Math.floor(progSec % 60)}s`
              : "0m";

            return (
              <div
                key={movie.id}
                onClick={() => handlePlayItem(movie)}
                className="group relative bg-[#090102] border border-red-500/[0.04] hover:border-red-500/30 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer flex flex-col justify-between"
              >
                {/* Upper banner content */}
                <div className="relative aspect-[16/10] bg-zinc-950 overflow-hidden">
                  <img
                    src={movie.backdrop_path 
                      ? (movie.backdrop_path.startsWith("http") ? movie.backdrop_path : `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`)
                      : (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500")}
                    alt={title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60"
                  />

                  {/* Gradient Overlay for backdrop details */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090102] to-transparent" />

                  {/* Quick Metadata Pill badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {isTV ? (
                      <span className="bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Tv className="w-2.5 h-2.5" />
                        TV series
                      </span>
                    ) : (
                      <span className="bg-slate-900 border border-white/10 text-slate-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Film className="w-2.5 h-2.5" />
                        Movie
                      </span>
                    )}

                    {progSec > 0 && (
                      <span className="bg-black/80 backdrop-blur-md border border-red-500/20 text-red-400 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-red-500" />
                        {progressDisplay}
                      </span>
                    )}
                  </div>

                  {/* Trash Hover overlay trigger */}
                  <button
                    onClick={(e) => handleRemoveItem(movie.id, e)}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/70 hover:bg-red-600 hover:text-white text-slate-400 border border-white/5 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-250 hover:scale-105"
                    title="Remove from continuing list"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Centered Large Play Overlay Icon */}
                  <div className="absolute inset-x-0 bottom-4 text-center">
                    <div className="inline-flex w-10 h-10 rounded-full bg-red-600 text-white items-center justify-center shadow-lg shadow-red-950 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
                      <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Lower metadata context */}
                <div className="p-4 flex flex-col gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-white group-hover:text-red-400 uppercase tracking-wide truncate transition-colors leading-tight">
                      {title}
                    </h3>

                    {/* Show episode labels and custom actions */}
                    {isTV && (
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold mt-1 bg-red-950/15 border border-red-500/5 px-2 py-1 rounded-md">
                        <span className="text-[10px] text-red-300">
                          S{curSeason} : Episode {curEpisode}
                        </span>
                        
                        {/* Next Episode Direct Trigger! */}
                        <button
                          onClick={(e) => handleNextEpisode(movie, e)}
                          className="text-[9px] uppercase font-black text-red-400 hover:text-white flex items-center gap-0.5 border border-red-500/10 hover:border-red-500/30 bg-black/40 px-2 py-0.5 rounded cursor-pointer transform hover:scale-[1.03]"
                          title="Skip to next episode"
                        >
                          Next Ep <ChevronRight className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Progress sliding controller block */}
                  <div className="flex flex-col gap-1.5 border-t border-red-950/20 pt-2 text-slate-500 font-medium text-[10px]">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-red-500/40" />
                        Watched Offset
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowProgressModal(movie.id);
                        }}
                        className="text-[9px] text-[#ff4d6a] hover:underline cursor-pointer"
                      >
                        Adjust
                      </button>
                    </div>

                    {/* Visual Progress bar inside history bento box list */}
                    <div className="w-full h-1.5 bg-slate-900/80 rounded-full overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600 rounded-full"
                        style={{ width: `${percentage || 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                      <span>{percentage.toFixed(0)}% watched</span>
                      {movie.lastWatchedTime && (
                        <span>
                          {new Date(movie.lastWatchedTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inlines adjustment dropdown panel inside card */}
                {showProgressModal === movie.id && (
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="absolute inset-x-2 bottom-2 bg-slate-950 border border-red-500/30 p-3.5 rounded-xl z-20 shadow-xl"
                  >
                    <p className="text-[10px] uppercase font-black tracking-wider text-slate-300 mb-2 border-b border-red-950/20 pb-1.5 flex justify-between items-center">
                      <span>Seek Progress Offset</span>
                      <button 
                        onClick={() => setShowProgressModal(null)}
                        className="text-[10px] text-slate-400 hover:text-white cursor-pointer px-1"
                      >
                        ✕
                      </button>
                    </p>
                    
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={customMinutes}
                          onChange={(e) => setCustomMinutes(e.target.value)}
                          className="bg-black border border-red-500/20 rounded p-1.5 w-16 text-xs text-white text-center focus:outline-none focus:ring-1 focus:ring-red-500"
                          placeholder="Min"
                        />
                        <span className="text-[10px] text-slate-400 font-mono">minutes</span>
                        
                        <button
                          onClick={() => {
                            const secs = parseFloat(customMinutes) * 60;
                            handleUpdateProgress(movie.id, secs);
                          }}
                          className="ml-auto bg-red-600 hover:bg-red-500 text-white text-[9px] font-extrabold uppercase px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Save
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-1 text-[9px] font-mono">
                        {[5, 15, 30, 45].map((preset) => (
                          <button
                            key={preset}
                            onClick={() => {
                              handleUpdateProgress(movie.id, preset * 60);
                            }}
                            className="bg-black border border-red-500/10 hover:border-red-500/30 hover:text-white p-1 rounded transition-colors cursor-pointer text-center"
                          >
                            {preset}m
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
