import React, { useState, useEffect } from "react";
import { ActiveTab } from "../types";
import { 
  Search, ChevronDown, Compass, Home as HomeIcon, History as HistoryIcon, 
  Code, X, Copy, Check, Terminal, Play, HelpCircle
} from "lucide-react";

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onSearchToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onSearchToggle
}) => {
  const [browseAnchor, setBrowseAnchor] = useState(false);
  const [brandLabel, setBrandLabel] = useState("Cineby");
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const isCineby = typeof window !== "undefined" && (
      window.location.hostname.includes("cineby") || 
      window.location.hostname.includes("cineby.mom") ||
      window.location.hostname.includes("cineby.at")
    );
    setBrandLabel(isCineby ? "Cineby" : "Bitcine");
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <header 
        id="bitcine-header" 
        className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#040102]/85 backdrop-blur-2xl border-b border-red-950/20 px-4 md:px-10 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
      >
        {/* Brand Logo - Styled precisely like the Cineby red play badge in screenshot */}
        <div 
          id="bitcine-logo-container" 
          onClick={() => {
            setActiveTab("home");
            setApiModalOpen(false);
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          {/* Circular Red Play icon */}
          <div 
            id="bitcine-logo" 
            className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e50914] to-[#af0810] flex items-center justify-center shadow-[0_0_15px_rgba(229,9,20,0.4)] transform group-hover:scale-105 group-hover:rotate-6 transition-all duration-300"
          >
            <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
          </div>
          <span 
            id="bitcine-brand-name" 
            className="text-xl font-extrabold tracking-tight text-white select-none transition-all duration-300 group-hover:text-slate-200"
          >
            {brandLabel}
          </span>
        </div>

        {/* Dynamic Capsule Navigations matching screenshot exactly */}
        <nav id="desktop-nav" className="hidden md:flex items-center gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/[0.03]">
          {/* Home Tab */}
          <button
            id="nav-item-home"
            type="button"
            onClick={() => {
              setActiveTab("home");
              setApiModalOpen(false);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] items-center font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
              activeTab === "home" && !apiModalOpen
                ? "bg-[#e50914]/15 border border-[#e50914]/30 text-white shadow-[0_0_15px_rgba(229,9,20,0.15)]"
                : "text-slate-400 hover:text-white border border-transparent hover:bg-white/[0.03]"
            }`}
          >
            <HomeIcon className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          {/* API Documentation Tab - Now opens actual endpoint definitions! */}
          <button
            id="nav-item-api-docs"
            type="button"
            onClick={() => setApiModalOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] items-center font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
              apiModalOpen
                ? "bg-[#e50914]/15 border border-[#e50914]/30 text-white shadow-[0_0_15px_rgba(229,9,20,0.15)]"
                : "text-slate-400 hover:text-white border border-transparent hover:bg-white/[0.03]"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>API</span>
          </button>

          {/* Browse Tab */}
          <button
            id="nav-item-browse"
            type="button"
            onClick={() => {
              setActiveTab("browse");
              setApiModalOpen(false);
            }}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-[10px] items-center font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
              activeTab === "browse" && !apiModalOpen
                ? "bg-[#e50914]/15 border border-[#e50914]/30 text-white shadow-[0_0_15px_rgba(229,9,20,0.15)]"
                : "text-slate-400 hover:text-white border border-transparent hover:bg-white/[0.03]"
            }`}
          >
            <Compass className="w-3.5 h-3.5 mr-0.5" />
            <span>Browse</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {/* History Tab */}
          <button
            id="nav-item-history"
            type="button"
            onClick={() => {
              setActiveTab("history");
              setApiModalOpen(false);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] items-center font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
              activeTab === "history" && !apiModalOpen
                ? "bg-[#e50914]/15 border border-[#e50914]/30 text-white shadow-[0_0_15px_rgba(229,9,20,0.15)]"
                : "text-slate-400 hover:text-white border border-transparent hover:bg-white/[0.03]"
            }`}
          >
            <HistoryIcon className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </nav>

        {/* Right Side Tools (Search, Avatar) */}
        <div id="header-actions" className="flex items-center gap-4">
          {/* Search Icon */}
          <button
            id="header-search-btn"
            onClick={() => {
              onSearchToggle();
              setApiModalOpen(false);
            }}
            aria-label="Search movies"
            className={`p-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 border ${
              activeTab === 'search' && !apiModalOpen
                ? 'bg-[#e50914]/15 text-red-400 border-red-500/35 shadow-[0_0_12px_rgba(239,68,68,0.15)]' 
                : 'hover:bg-white/5 border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <Search className="w-5 h-5 animate-[pulse_3s_infinite]" />
          </button>

          {/* Profile Avatar */}
          <div 
            id="header-user-profile" 
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#e50914] to-red-800 border border-white/10 flex items-center justify-center font-extrabold text-[10px] text-white shadow-[0_0_15px_rgba(229,9,20,0.3)] hover:shadow-[0_0_22px_rgba(229,9,20,0.5)] cursor-pointer hover:scale-105 active:scale-95 transition-all select-none"
          >
            YS
          </div>
        </div>
      </header>

      {/* --- PREMIUM DEVELOPER INTERACTIVE API REFERENCE DIALOG --- */}
      {apiModalOpen && (
        <div 
          id="api-docs-modal-overlay"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl transition-all duration-300 select-none"
        >
          {/* Modal Container */}
          <div 
            id="api-docs-modal-container"
            className="w-full max-w-4xl max-h-[85vh] bg-[#050102] border border-red-500/20 rounded-3xl shadow-2xl shadow-red-950/30 overflow-hidden flex flex-col animate-[fadeIn_0.3s_ease-out]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-red-950/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-600/10 border border-red-500/30">
                  <Terminal className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-white">
                    {brandLabel} API Reference
                  </h2>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                    Real-time developer streaming endpoints and metadata relays
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApiModalOpen(false)}
                className="bg-white/5 hover:bg-white/10 text-white rounded-full p-2 hover:scale-110 active:scale-95 cursor-pointer transition-all border border-white/5"
              >
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>

            {/* Document Content Scroll area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-red-950">
              
              {/* API Introduction Alert banner */}
              <div className="bg-[#0b0102] border border-[#e50914]/15 rounded-2xl p-4 flex gap-3">
                <HelpCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-200">Integration Guidelines</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Our API routes proxy requests through a secured backend layer directly to TMDB services and embeds. You can integration-test or scrape metadata cleanly using the following routes.
                  </p>
                </div>
              </div>

              {/* Endpoint 1: Fetch details */}
              <div className="space-y-3 pb-4 border-b border-white/[0.03]">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 uppercase font-black text-[9px] tracking-widest rounded-md">
                    GET
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wide">
                    /api/tmdb/movie/:id
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fetches detailed metadata for any movie by its unique TMDB identifier, including its credits structure, promotional trailers, and similar movies array.
                </p>
                
                {/* Shell Box */}
                <div className="bg-black/60 rounded-xl p-3 border border-red-500/[0.04] font-mono text-[10.5px] text-red-400/80 relative group">
                  <code>
                    curl -s "https://cineby.online/api/tmdb/movie/429617?append_to_response=credits"
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy('curl -s "https://cineby.online/api/tmdb/movie/429617?append_to_response=credits"', 'get-med')}
                    className="absolute right-3 top-2.5 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                    title="Copy API call"
                  >
                    {copiedId === 'get-med' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Endpoint 2: Streaming Embed Embedder */}
              <div className="space-y-3 pb-4 border-b border-white/[0.03]">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 bg-[#e50914]/15 border border-[#e50914]/30 text-red-500 uppercase font-black text-[9px] tracking-widest rounded-md">
                    IFRAME
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wide">
                    https://vidsrc.to/embed/movie/:id
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Embedding URL used inside our modal viewport to construct direct cinema streams depending on dynamic user server inputs.
                </p>
                
                {/* Shell Box */}
                <div className="bg-black/60 rounded-xl p-3 border border-red-500/[0.04] font-mono text-[10.5px] text-red-400/80 relative group">
                  <code>
                    &lt;iframe src="https://vidsrc.to/embed/movie/505642" allowfullscreen /&gt;
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy('<iframe src="https://vidsrc.to/embed/movie/505642" allowfullscreen />', 'embed-url')}
                    className="absolute right-3 top-2.5 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                    title="Copy Iframe Code"
                  >
                    {copiedId === 'embed-url' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Endpoint 3: Popular TV Stream Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 uppercase font-black text-[9px] tracking-widest rounded-md">
                    GET
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wide">
                    /api/tmdb/trending/tv/day
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fetches the top daily trending TV shows directly from our proxy layer, maintaining quick loading speeds and optimized payload overheads.
                </p>
                
                {/* Shell Box */}
                <div className="bg-black/60 rounded-xl p-3 border border-red-500/[0.04] font-mono text-[10.5px] text-red-400/80 relative group">
                  <code>
                    curl -s "https://cineby.online/api/tmdb/trending/tv/day?page=1"
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy('curl -s "https://cineby.online/api/tmdb/trending/tv/day?page=1"', 'get-tv')}
                    className="absolute right-3 top-2.5 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                    title="Copy API call"
                  >
                    {copiedId === 'get-tv' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-black/40 border-t border-red-950/30 flex justify-end">
              <button
                type="button"
                onClick={() => setApiModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-red-650 hover:bg-red-700 text-xs font-bold text-white transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
