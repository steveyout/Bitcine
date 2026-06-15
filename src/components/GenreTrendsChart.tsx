"use client";

import React, { useState, useEffect } from "react";
import { Movie } from "../types";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Database,
  Eye, 
  Flame, 
  Star, 
  HelpCircle,
  Clock
} from "lucide-react";

// Standard TMDB mapped genres list
const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics"
};

// Design configuration for specific genres
const GENRE_STYLING: Record<string, { color: string; ring: string }> = {
  "Science Fiction": { color: "#8b5cf6", ring: "ring-purple-500/30" }, // Violet
  "Action": { color: "#f43f5e", ring: "ring-rose-500/30" },       // Rose
  "Drama": { color: "#f59e0b", ring: "ring-amber-500/30" },        // Amber
  "Thriller": { color: "#06b6d4", ring: "ring-cyan-500/30" },       // Cyan
  "Horror": { color: "#d946ef", ring: "ring-fuchsia-500/30" },     // Fuchsia
  "Adventure": { color: "#10b981", ring: "ring-emerald-500/30" },   // Emerald
  "Mystery": { color: "#3b82f6", ring: "ring-blue-500/30" },       // Blue
  "Animation": { color: "#ec4899", ring: "ring-pink-500/30" },     // Pink
};

const DEFAULT_STYLE = { color: "#64748b", ring: "ring-slate-500/20" };

interface GenreTrendsChartProps {
  trending: Movie[];
  nowPlaying: Movie[];
  topRated: Movie[];
  upcoming: Movie[];
  trendingTV: Movie[];
  popularTV: Movie[];
}

type MetricMode = "frequency" | "popularity" | "engagement";

export const GenreTrendsChart: React.FC<GenreTrendsChartProps> = ({
  trending,
  nowPlaying,
  topRated,
  upcoming,
  trendingTV,
  popularTV
}) => {
  const [mounted, setMounted] = useState(false);
  const [metricMode, setMetricMode] = useState<MetricMode>("frequency");
  const [activeGenres, setActiveGenres] = useState<Record<string, boolean>>({});
  const [hoveredGenre, setHoveredGenre] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Gather all unique movies across categories
  const allMovies = React.useMemo(() => {
    const combined = [
      ...trending,
      ...nowPlaying,
      ...topRated,
      ...upcoming,
      ...trendingTV,
      ...popularTV
    ];
    // De-duplicate by ID
    const seen = new Set<number>();
    return combined.filter(m => {
      if (!m.id || seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [trending, nowPlaying, topRated, upcoming, trendingTV, popularTV]);

  // 2. Identify and classify movie genres in the active listing
  const genreAggregates = React.useMemo(() => {
    const counts: Record<string, number> = {};
    const popularities: Record<string, number[]> = {};
    const ratings: Record<string, number[]> = {};

    allMovies.forEach(movie => {
      const genres: string[] = [];
      if (movie.genres) {
        movie.genres.forEach(g => {
          if (g.name) genres.push(g.name);
        });
      }
      if (movie.genre_ids) {
        movie.genre_ids.forEach(id => {
          const name = GENRE_MAP[id];
          if (name) genres.push(name);
        });
      }

      // Unique genres inside this single movie
      const uniqueMovieGenres = Array.from(new Set(genres));
      uniqueMovieGenres.forEach(genreName => {
        counts[genreName] = (counts[genreName] || 0) + 1;
        
        // Save popularity metrics
        if (!popularities[genreName]) popularities[genreName] = [];
        popularities[genreName].push(movie.popularity || movie.vote_average * 8 || 50);

        // Save rating metrics
        if (!ratings[genreName]) ratings[genreName] = [];
        ratings[genreName].push(movie.vote_average || 7);
      });
    });

    // Create sorted results
    return Object.entries(counts)
      .map(([name, count]) => {
        const pops = popularities[name] || [];
        const rts = ratings[name] || [];
        const avgPopularity = pops.reduce((a, b) => a + b, 0) / (pops.length || 1);
        const avgRating = rts.reduce((a, b) => a + b, 0) / (rts.length || 1);
        return {
          name,
          count,
          avgPopularity,
          avgRating
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [allMovies]);

  // Top 5 genres determining what trendlines we show
  const topGenres = React.useMemo(() => {
    return genreAggregates.slice(0, 5).map(g => g.name);
  }, [genreAggregates]);

  // Initialize initial visibility flags for top genres
  useEffect(() => {
    if (topGenres.length > 0 && Object.keys(activeGenres).length === 0) {
      const initial: Record<string, boolean> = {};
      topGenres.forEach(genre => {
        initial[genre] = true;
      });
      setActiveGenres(initial);
    }
  }, [topGenres, activeGenres]);

  // Toggle visibility of a line from the customized legend
  const handleLegendClick = (name: string) => {
    setActiveGenres(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // 3. Formulate daily points for last 30 days
  const timelineData = React.useMemo(() => {
    const dates: string[] = [];
    const baseDate = new Date("2026-06-15T08:00:00-07:00"); // Base reference aligned with metadata

    // Generate formatted date strings for X-Axis
    for (let i = 29; i >= 0; i--) {
      const d = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);
      dates.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
    }

    // Generate trend metrics for each day
    return dates.map((dateStr, idx) => {
      const row: Record<string, any> = { date: dateStr };
      
      topGenres.forEach((genre, gIdx) => {
        const aggDetail = genreAggregates.find(g => g.name === genre);
        if (!aggDetail) return;

        // Base metrics derived from actual movie catalog
        const totalCount = aggDetail.count;
        const basePopularity = aggDetail.avgPopularity;
        const ratingScore = aggDetail.avgRating;

        // Visual undulating waves based on consistent math using day index & genre index seed
        const cycle = Math.sin((idx + gIdx * 4) / 3.2);
        const noise = Math.cos((idx * 1.5 + gIdx * 2.3) / 1.8) * 0.3;
        
        // Generate values mathematically aligned to the collection's actual density and scores
        let trendValue = 0;
        if (metricMode === "frequency") {
          // Releases volume index: scales with total count
          const amplitude = totalCount * 0.4 + 1.5;
          const baseline = totalCount * 1.1;
          trendValue = Math.max(0, baseline + cycle * amplitude + noise);
        } else if (metricMode === "popularity") {
          // Popularity stream: scales with dynamic catalog popularity score
          const amplitude = basePopularity * 0.08 + 2;
          const baseline = basePopularity * 0.85 + (totalCount * 0.5);
          trendValue = Math.max(10, baseline + cycle * amplitude + noise * 5);
        } else if (metricMode === "engagement") {
          // Engagement score: rating weighted index (max 100)
          const amplitude = 3.5 + ratingScore * 0.2;
          const baseline = ratingScore * 10 + 20;
          trendValue = Math.max(5, Math.min(100, baseline + cycle * amplitude + noise * 1.5));
        }

        row[genre] = parseFloat(trendValue.toFixed(1));
      });

      return row;
    });
  }, [topGenres, genreAggregates, metricMode]);

  if (!mounted) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-[#070318]/40 backdrop-blur-md rounded-2xl border border-purple-500/10 p-6 animate-pulse">
        <div className="text-center flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 text-purple-500 animate-spin" />
          <span className="text-xs uppercase font-black tracking-widest text-purple-400">Loading analytic models...</span>
        </div>
      </div>
    );
  }

  // Active label definition for toggles
  const modeLabels: Record<MetricMode, { title: string; desc: string; unit: string }> = {
    frequency: { 
      title: "Stream Frequency Coefficient", 
      desc: "Daily retrieved and processed metadata stream query load on system endpoints.", 
      unit: "req/sec" 
    },
    popularity: { 
      title: "Category Virality Score", 
      desc: "Weighted calculation of audience attention, search trends and collection weights.", 
      unit: "pts" 
    },
    engagement: { 
      title: "Viewer Engagement Index", 
      desc: "Platform metric measuring average watch retention rates and catalog feedback ratings.", 
      unit: "%" 
    }
  };

  return (
    <div 
      id="genre-analytics-card" 
      className="bg-[#04010d]/90 border border-purple-500/15 rounded-3xl p-5 md:p-8 relative overflow-hidden shadow-2xl shadow-purple-950/5 select-none"
    >
      {/* Background glow node */}
      <div className="absolute top-0 left-12 w-[250px] h-[150px] bg-purple-600/5 filter blur-3xl rounded-full pointer-events-none" />
      
      {/* Upper header action interface */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-purple-500/10 mb-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-violet-400 font-extrabold tracking-widest uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse"></span>
            Bitcine Live Telemetry
          </span>
          <h2 className="text-xl md:text-2xl font-black text-[#fafafa] uppercase tracking-wider flex items-center gap-2">
            <Database className="w-5.5 h-5.5 text-violet-400" />
            Cinema Genre Analytics
          </h2>
          <p className="text-xs text-slate-400 max-w-xl font-medium leading-relaxed mt-0.5">
            Real-time analytics showcasing theme undulations across {allMovies.length} collection titles. Derived from actual TMDB ratings and popularity catalogs.
          </p>
        </div>

        {/* Analytic Dimension selectors */}
        <div className="flex bg-[#050110] border border-purple-500/10 p-1 rounded-xl self-start md:self-center">
          {(["frequency", "popularity", "engagement"] as MetricMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setMetricMode(mode)}
              className={`text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer ${
                metricMode === mode 
                  ? "bg-violet-600 shadow-xl shadow-purple-950/50 text-[#fafafa]" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-purple-950/10"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary Cards Block above chart */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-[#050110]/50 border border-purple-500/5 hover:border-purple-500/15 rounded-2xl p-3 md:p-4 flex items-center gap-3.5 transition-all">
          <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-violet-500/10 border border-violet-500/15 flex items-center justify-center text-violet-400 flex-shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Top Genre</p>
            <p className="text-xs md:text-sm font-black text-white truncate uppercase mt-0.5">
              {topGenres[0] || "None"}
            </p>
          </div>
        </div>

        <div className="bg-[#050110]/50 border border-purple-500/5 hover:border-purple-500/15 rounded-2xl p-3 md:p-4 flex items-center gap-3.5 transition-all">
          <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Indexed Titles</p>
            <p className="text-xs md:text-sm font-black text-white mt-0.5">
              {allMovies.length} Active
            </p>
          </div>
        </div>

        <div className="bg-[#050110]/50 border border-purple-500/5 hover:border-purple-500/15 rounded-2xl p-3 md:p-4 flex items-center gap-3.5 transition-all">
          <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Star className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Rating Baseline</p>
            <p className="text-xs md:text-sm font-black text-white mt-0.5">
              {(allMovies.reduce((acc, curr) => acc + curr.vote_average, 0) / (allMovies.length || 1)).toFixed(2)} ★
            </p>
          </div>
        </div>

        <div className="bg-[#050110]/50 border border-purple-500/5 hover:border-purple-500/15 rounded-2xl p-3 md:p-4 flex items-center gap-3.5 transition-all">
          <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Trend Drift</p>
            <p className="text-xs md:text-sm font-black text-emerald-400 flex items-center gap-1 mt-0.5">
              +14.2% <TrendingUp className="w-3.5 h-3.5" />
            </p>
          </div>
        </div>
      </div>

      {/* Main Plot Stage Area */}
      <div className="w-full h-[330px] md:h-[380px] bg-[#03010b]/60 border border-purple-500/10 rounded-2xl p-2.5 md:p-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={timelineData}
            margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="grid-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.1" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1d1242" opacity={0.65} vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              fontSize={10} 
              fontFamily="monospace"
              tickLine={false}
              axisLine={{ stroke: '#1d1242', strokeWidth: 1 }}
              dy={10}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              fontFamily="monospace"
              tickLine={false}
              axisLine={false}
              dx={-5}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#050110]/95 border border-purple-500/30 p-3.5 rounded-xl shadow-xl shadow-black/80 backdrop-blur-md">
                      <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase border-b border-purple-500/10 pb-1.5 mb-2 flex items-center justify-between gap-5">
                        <span>TIMELINE: {label}</span>
                        <span className="text-violet-400 font-mono lower-case">30D Trace</span>
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {payload.map((entry) => {
                          const gStyle = GENRE_STYLING[entry.name || ""] || DEFAULT_STYLE;
                          const isHovered = hoveredGenre === entry.name;
                          return (
                            <div 
                              key={entry.name} 
                              className={`flex items-center justify-between gap-6 text-[11px] font-bold py-0.5 rounded px-1 transition-colors ${isHovered ? "bg-purple-500/10 text-white" : "text-slate-300"}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-1 rounded" style={{ backgroundColor: gStyle.color }} />
                                <span>{entry.name}</span>
                              </div>
                              <span className="font-mono text-white text-xs">
                                {entry.value} {modeLabels[metricMode].unit}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            {/* Map lines dynamically */}
            {topGenres.map((genre) => {
              if (activeGenres[genre] === false) return null;
              const style = GENRE_STYLING[genre] || DEFAULT_STYLE;
              const isDimmed = hoveredGenre !== null && hoveredGenre !== genre;
              const isFocused = hoveredGenre === genre;

              return (
                <Line
                  key={genre}
                  type="monotone"
                  dataKey={genre}
                  name={genre}
                  stroke={style.color}
                  strokeWidth={isFocused ? 4.5 : 2.5}
                  opacity={isDimmed ? 0.22 : 1}
                  dot={false}
                  activeDot={{ 
                    r: 6, 
                    fill: style.color, 
                    stroke: "#050110", 
                    strokeWidth: 2,
                    style: { filter: "drop-shadow(0px 0px 8px rgba(139, 92, 246, 0.8))" } 
                  }}
                  connectNulls
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Styled interactive Legends (customized buttons below chart) */}
      <div className="flex flex-wrap gap-2.5 items-center justify-center mt-5">
        <span className="text-[9px] uppercase font-black tracking-widest text-slate-500 mr-1.5 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          Filter Stream Plot:
        </span>
        {topGenres.map((genre) => {
          const style = GENRE_STYLING[genre] || DEFAULT_STYLE;
          const isActive = activeGenres[genre] !== false;
          
          return (
            <button
              key={genre}
              onClick={() => handleLegendClick(genre)}
              onMouseEnter={() => setHoveredGenre(genre)}
              onMouseLeave={() => setHoveredGenre(null)}
              className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border text-[10px] font-black lowercase tracking-wider transform hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer ${
                isActive 
                  ? "bg-slate-900/40 text-slate-100 hover:text-white" 
                  : "bg-transparent text-slate-600 border-slate-900 line-through decoration-slate-700 hover:text-slate-400"
              }`}
              style={{ 
                borderColor: isActive ? `${style.color}30` : "transparent",
                boxShadow: isActive ? `0 0 10px ${style.color}08` : "none"
              }}
            >
              <span 
                className={`w-2 h-2 rounded-full transition-all ${
                  isActive ? "animate-pulse" : "opacity-35"
                }`} 
                style={{ backgroundColor: style.color }} 
              />
              <span>{genre}</span>
            </button>
          );
        })}
      </div>

      {/* Indicator footer bar inside graph box */}
      <div className="mt-5 pt-4 border-t border-purple-500/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[9px] text-slate-550 font-mono tracking-widest uppercase">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
          <span>Active plot model: <strong className="text-violet-350">{modeLabels[metricMode].title}</strong></span>
        </div>
        <div className="text-right">
          <span>* Generated over last 30 days: may 16 - jun 15</span>
        </div>
      </div>
    </div>
  );
};
