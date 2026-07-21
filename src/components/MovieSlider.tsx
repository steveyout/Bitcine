import React, { useRef } from "react";
import Image from "next/image";
import { Movie } from "../types";
import { ChevronLeft, ChevronRight, Star, Heart } from "lucide-react";

interface MovieSliderProps {
  id: string;
  title: string;
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
  isTop10?: boolean;
  isLoading?: boolean;
}

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export const MovieSlider: React.FC<MovieSliderProps> = ({
  id,
  title,
  movies,
  onMovieClick,
  isTop10 = false,
  isLoading = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = direction === "left" 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
      
      scrollContainerRef.current.scrollTo({
        left: scrollAmount,
        behavior: "smooth"
      });
    }
  };

  if (!isLoading && (!movies || movies.length === 0)) {
    return null;
  }

  // Get poster/backdrop url safely with optimized dimensions
  const getImageUrl = (path: string | null, size: "w342" | "w780" | "original" = "w342") => {
    if (!path) {
      return size === "w780" 
        ? "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=780"
        : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=342";
    }
    if (path.startsWith("http")) return path;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  return (
    <section id={`slider-section-${id}`} aria-labelledby={`slider-title-${id}`} className="relative my-8 px-4 md:px-8 group/slider select-none">
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h2 id={`slider-title-${id}`} className="text-[#f8fafc] text-sm md:text-base font-black tracking-widest flex items-center gap-2 uppercase">
          <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
          {title}
        </h2>
      </div>

      {/* Control Navigation Arrows (visible on hover) */}
      <button
        id={`slider-arrow-left-${id}`}
        onClick={() => scroll("left")}
        aria-label="Scroll Left"
        className="absolute left-0 top-[55%] -translate-y-1/2 z-20 bg-[#050110]/85 border border-[#1a0b2e] text-white p-2 md:p-3 rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 hover:bg-violet-600/90 hover:scale-110 cursor-pointer hidden sm:flex items-center justify-center shadow-lg"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        id={`slider-arrow-right-${id}`}
        onClick={() => scroll("right")}
        aria-label="Scroll Right"
        className="absolute right-0 top-[55%] -translate-y-1/2 z-20 bg-[#050110]/85 border border-[#1a0b2e] text-white p-2 md:p-3 rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 hover:bg-violet-600/90 hover:scale-110 cursor-pointer hidden sm:flex items-center justify-center shadow-lg"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slider Scrollable Area */}
      <div
        id={`slider-scroll-${id}`}
        ref={scrollContainerRef}
        className="flex items-center gap-4 overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-hide py-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {isLoading ? (
          // Skeleton screens
          Array.from({ length: isTop10 ? 5 : 6 }).map((_, idx) => {
            if (isTop10) {
              return (
                <div
                  key={`skeleton-top-10-${idx}`}
                  id={`slider-top10-skeleton-${idx}`}
                  className="flex-shrink-0 flex items-end relative w-64 md:w-80 h-44 md:h-52 animate-pulse"
                >
                  <div
                    className="text-7xl md:text-9xl font-black text-transparent select-none absolute left-0 bottom-0 z-10 leading-none h-fit mb-[-8px]"
                    style={{
                      WebkitTextStroke: "2px rgba(139, 92, 246, 0.12)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {idx + 1}
                  </div>

                  <div className="w-[85%] ml-auto h-full relative rounded-xl overflow-hidden border border-purple-500/10 bg-gradient-to-br from-[#0c051a] via-[#080312] to-[#05010a] flex flex-col justify-end p-4">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-violet-600/[0.03] rounded-full filter blur-xl" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050110]/95 via-[#050110]/50 to-transparent" />
                    <div className="space-y-2 relative z-10">
                      <div className="h-2.5 w-1/4 bg-violet-500/20 rounded-full animate-pulse" />
                      <div className="h-4.5 w-3/4 bg-slate-800/75 rounded-md" />
                      
                      <div className="flex items-center gap-2 pt-1">
                        <div className="h-3 w-8 bg-slate-800/80 rounded" />
                        <div className="h-1 w-1 bg-slate-800 rounded-full" />
                        <div className="h-3 w-10 bg-slate-800/80 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={`skeleton-regular-${idx}`}
                id={`slider-card-skeleton-${idx}`}
                className="flex-shrink-0 w-36 sm:w-44 md:w-52"
              >
                <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden border border-purple-500/10 bg-gradient-to-b from-[#0e0724]/90 via-[#070312] to-[#030107] p-3.5 flex flex-col justify-end animate-pulse">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-purple-500/[0.02] rounded-full filter blur-lg" />
                  </div>
                  <div className="absolute top-3 right-3 h-4 w-9 bg-slate-800/60 rounded" />
                  <div className="space-y-2 relative z-10 w-full">
                    <div className="h-4 w-[85%] bg-slate-800/70 rounded" />
                    <div className="flex items-center justify-between pt-0.5">
                      <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-amber-500/10 rounded-full" />
                        <div className="h-3 w-6 bg-slate-800/70 rounded" />
                      </div>
                      <div className="h-3 w-8 bg-slate-800/70 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          movies.map((movie, index) => {
            const year = movie.release_date 
              ? movie.release_date.split("-")[0] 
              : (movie.first_air_date ? movie.first_air_date.split("-")[0] : "2026");

            const mediaType = movie.name ? "tv" : "movie";
            const titleText = movie.title || movie.name || "media";
            const slug = `${movie.id}-${slugify(titleText)}`;
            const href = `/${mediaType}/${slug}`;

            if (isTop10) {
              return (
                <article
                  key={`${movie.id}-top10`}
                  id={`slider-top10-item-${index}-${movie.id}`}
                  className="flex-shrink-0 flex items-end relative w-64 md:w-80 h-44 md:h-52 group transition-all duration-300"
                >
                  {/* Giant Digit Overlay */}
                  <div 
                    id={`top10-digit-${index}`}
                    className="text-7xl md:text-9xl font-black text-transparent stroke-white select-none absolute left-0 bottom-0 z-10 leading-none h-fit mb-[-8px] transition-all duration-300 group-hover:text-purple-500/20 group-hover:scale-105"
                    style={{
                      WebkitTextStroke: "2px rgba(139, 92, 246, 0.4)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {index + 1}
                  </div>

                  <a
                    href={href}
                    onClick={(e) => {
                      e.preventDefault();
                      onMovieClick(movie);
                    }}
                    className="w-[85%] ml-auto h-full relative rounded-xl overflow-hidden border border-purple-500/10 shadow-lg group-hover:border-violet-500/50 group-hover:shadow-violet-500/10 group-hover:scale-102 transition-all duration-300 block cursor-pointer"
                  >
                    <Image
                      id={`top10-img-${movie.id}`}
                      src={getImageUrl(movie.backdrop_path, "w780")}
                      alt={titleText}
                      referrerPolicy="no-referrer"
                      fill
                      sizes="(max-width: 768px) 218px, 272px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050110] via-transparent to-transparent z-1" />
                    
                    <div className="absolute bottom-3 left-4 right-4 z-10">
                      <span className="text-xs font-semibold uppercase text-violet-400 mb-0.5 block">
                        TOP {index + 1} Today
                      </span>
                      <h3 className="text-sm md:text-base font-bold text-white truncate">
                        {titleText}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-medium">
                        <span className="flex items-center gap-0.5 text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {movie.vote_average.toFixed(1)}
                        </span>
                        <span>•</span>
                        <span>{year}</span>
                      </div>
                    </div>
                  </a>
                </article>
              );
            }

            return (
              <article
                key={movie.id}
                id={`slider-card-${id}-${movie.id}`}
                className="flex-shrink-0 w-36 sm:w-44 md:w-52 group transition-all duration-300"
              >
                <a
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    onMovieClick(movie);
                  }}
                  className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden border border-purple-500/5 shadow-md group-hover:border-violet-500/50 group-hover:scale-105 group-hover:shadow-violet-500/15 group-hover:-translate-y-1.5 transition-all duration-300 block cursor-pointer"
                >
                  <Image
                    id={`slider-card-img-${movie.id}`}
                    src={getImageUrl(movie.poster_path, "w342")}
                    alt={titleText}
                    referrerPolicy="no-referrer"
                    fill
                    sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, 208px"
                    className="object-cover transition-transform duration-500"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050110] via-[#050110]/60 to-[#050110]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-10">
                    <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                      {titleText}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-slate-300 mt-1.5 font-medium">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{movie.vote_average.toFixed(1)}</span>
                      </div>
                      <span>{year}</span>
                    </div>
                  </div>

                  <span className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide backdrop-blur-md bg-black/60 text-stone-200 border border-white/5 uppercase">
                    {movie.original_language || "en"}
                  </span>
                </a>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};
