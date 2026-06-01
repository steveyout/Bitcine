import React from "react";
import { Movie } from "../types";
import { Play, Info, Star } from "lucide-react";

interface HeroProps {
  movie: Movie | null;
  onPlay: (movie: Movie) => void;
  onSeeMore: (movie: Movie) => void;
  isLoading?: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  movie,
  onPlay,
  onSeeMore,
  isLoading = false
}) => {
  if (isLoading || !movie) {
    return (
      <div 
        id="hero-skeleton" 
        className="relative h-[85vh] w-full bg-[#06040d] flex items-center justify-center animate-pulse"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#06040d] via-transparent to-transparent z-10" />
        <div className="text-center z-20">
          <div className="h-8 w-48 bg-slate-800 rounded-full mx-auto mb-4" />
          <div className="h-4 w-96 bg-slate-800 rounded-full mx-auto mb-2" />
          <div className="h-4 w-64 bg-slate-800 rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  // Get image backdrop url safely
  const backdropUrl = movie.backdrop_path 
    ? (movie.backdrop_path.startsWith("http") 
       ? movie.backdrop_path 
       : `https://image.tmdb.org/t/p/original${movie.backdrop_path}`)
    : "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1600";

  // Get release year safely
  const yearText = movie.release_date 
    ? movie.release_date.split("-")[0] 
    : (movie.first_air_date ? movie.first_air_date.split("-")[0] : "2026");

  // Format single decimal rating
  const ratingText = movie.vote_average ? movie.vote_average.toFixed(1) : "7.0";

  // Genres text lookup or custom tag fallback
  const genresText = movie.genres 
    ? movie.genres.map(g => g.name).join(" • ")
    : "Action • Sci-Fi";

  const titleText = movie.title || movie.name || "";
  const titleWords = titleText.split(" ");
  const firstPartTitle = titleWords.slice(0, Math.max(1, titleWords.length - 1)).join(" ");
  const lastWordTitle = titleWords.length > 1 ? titleWords[titleWords.length - 1] : "";

  return (
    <div 
      id={`hero-movie-${movie.id}`} 
      className="relative h-[75vh] md:h-[82vh] lg:h-[88vh] w-full bg-[#050110] overflow-hidden flex items-end"
    >
      {/* Background Image with Bitcine custom gradient blending */}
      <div className="absolute inset-0 z-0">
        <img
          id={`hero-backdrop-img-${movie.id}`}
          src={backdropUrl}
          alt={titleText}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 filter brightness-90 animate-[fadeIn_0.5s_ease-out]"
        />
        {/* Dark vignettes & purplish ambient glows to match premium Bitcine style */}
        <div id="hero-backdrop-vignette-top" className="absolute inset-0 bg-gradient-to-b from-[#050110]/95 via-transparent to-[#050110]/30 z-1" />
        <div id="hero-backdrop-vignette-bottom" className="absolute inset-0 bg-gradient-to-t from-[#050110] via-[#050110]/40 to-transparent z-1" />
        <div id="hero-backdrop-vignette-left" className="absolute inset-0 bg-gradient-to-r from-[#050110]/90 via-transparent to-transparent z-1 hidden md:block" />
        <div id="hero-backdrop-purple-accent" className="absolute -left-40 bottom-0 w-96 h-96 bg-purple-600/15 rounded-full filter blur-[120px] pointer-events-none z-1" />
      </div>

      {/* Hero Content Overlay */}
      <div id="hero-content-container" className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 pb-12 md:pb-20 flex flex-col items-start gap-4 select-none">
        
        {/* Badges block */}
        <div className="flex gap-2">
          <span className="px-2.5 py-1 bg-purple-600/90 text-[10px] font-black rounded backdrop-blur-md uppercase tracking-wider shadow-lg text-white">
            Trending #{movie.vote_average > 8 ? "1" : "3"}
          </span>
          <span className="px-2.5 py-1 bg-white/10 text-[10px] font-bold rounded backdrop-blur-md uppercase tracking-wider border border-white/10 text-white">
            4K Ultra HD
          </span>
        </div>

        {/* Title */}
        <h1 
          id="hero-movie-title" 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white drop-shadow-md max-w-4xl leading-[0.9]"
        >
          {firstPartTitle} {lastWordTitle && <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 block sm:inline">{lastWordTitle}</span>}
        </h1>

        {/* Metadata section (Rating, Year, Genres) */}
        <div id="hero-movie-metadata" className="flex flex-wrap items-center gap-1.5 md:gap-3 text-sm font-semibold text-slate-300">
          {/* Star and rating value */}
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-4 h-4 fill-amber-400" />
            <span id="hero-rating">{ratingText}</span>
          </div>

          <span className="text-slate-600">•</span>
          <span id="hero-year">{yearText}</span>
          <span className="text-slate-600">•</span>
          <span id="hero-genres" className="text-violet-350 font-medium">{genresText}</span>
        </div>

        {/* Short Synopsis Overview text */}
        <p 
          id="hero-movie-synopsis" 
          className="text-sm md:text-base text-gray-300 max-w-2xl line-clamp-3 md:line-clamp-4 leading-relaxed font-medium text-left opacity-85"
        >
          {movie.overview || "No description overview available."}
        </p>

        {/* Control Buttons */}
        <div id="hero-control-buttons" className="flex flex-wrap items-center gap-4 mt-2">
          {/* Play CTA */}
          <button
            id="hero-play-btn"
            onClick={() => onPlay(movie)}
            className="bg-white text-black px-8 py-3 rounded-lg font-black text-sm flex items-center gap-2 hover:bg-purple-100 hover:scale-105 active:scale-95 cursor-pointer shadow-xl transition-all"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>PLAY NOW</span>
          </button>

          {/* See More CTA - Outline style */}
          <button
            id="hero-see-more-btn"
            onClick={() => onSeeMore(movie)}
            className="bg-white/10 backdrop-blur-md text-white px-8 py-3 rounded-lg font-black text-sm border border-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Info className="w-4 h-4" />
            <span>+ ADD TO LIST</span>
          </button>
        </div>
      </div>
    </div>
  );
};
