import React, { useState, useEffect } from "react";
import { ActiveTab } from "../types";
import { Search, ChevronDown, Compass, Home as HomeIcon, History as HistoryIcon } from "lucide-react";

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
  const [brandLabel, setBrandLabel] = useState("Bitcine");

  useEffect(() => {
    const isCineby = typeof window !== "undefined" && (window.location.hostname.includes("cineby") || window.location.hostname.includes("cineby.mom"));
    setBrandLabel(isCineby ? "Cineby" : "Bitcine");
  }, []);

  const navItems = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "history", label: "History", icon: HistoryIcon },
  ];

  return (
    <header 
      id="bitcine-header" 
      className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#040102]/85 backdrop-blur-2xl border-b border-red-950/20 px-4 md:px-10 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
    >
      {/* Brand Logo - Bitcine / Cineby */}
      <div 
        id="bitcine-logo-container" 
        onClick={() => setActiveTab("home")}
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <div id="bitcine-logo" className="w-8 h-8 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
          <img src="/logo.svg" alt={`${brandLabel} Logo`} className="w-full h-full object-contain" />
        </div>
        <span 
          id="bitcine-brand-name" 
          className="text-xl font-black bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-clip-text text-transparent tracking-tighter uppercase select-none transition-all duration-300 group-hover:brightness-110"
        >
          {brandLabel}
        </span>
      </div>

      {/* Desktop Navigation with high-fidelity hover effects */}
      <nav id="desktop-nav" className="hidden md:flex items-center gap-7 text-[10.5px] font-black uppercase tracking-widest text-[#94a3b8]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`flex items-center gap-1.5 transition-all duration-300 cursor-pointer pb-1 border-b-2 hover:-translate-y-[1px] relative group ${
                isActive 
                  ? "text-white border-red-600 font-bold" 
                  : "border-transparent hover:text-red-400 hover:border-red-600/55"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-red-500' : 'text-slate-400 group-hover:text-red-400'}`} />
              <span>{item.label}</span>
              {/* Soft atmospheric backlight behind the active/hovered link */}
              {isActive && (
                <div className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-3/4 h-[8px] bg-red-600/30 filter blur-[4px] rounded-full pointer-events-none" />
              )}
            </button>
          );
        })}

        {/* Browse Dropdown item in header */}
        <div id="browse-dropdown-wrapper" className="relative">
          <button
            id="nav-item-browse"
            onClick={() => {
              setActiveTab("browse");
              setBrowseAnchor(!browseAnchor);
            }}
            className={`flex items-center gap-1 transition-all duration-300 cursor-pointer pb-1 border-b-2 hover:-translate-y-[1px] relative group ${
              activeTab === "browse" 
                ? "text-white border-red-600 font-bold" 
                : "border-transparent hover:text-red-400 hover:border-red-600/55"
            }`}
          >
            <Compass className={`w-3.5 h-3.5 mr-0.5 transition-transform duration-300 group-hover:rotate-12 ${activeTab === 'browse' ? 'text-red-500' : 'text-slate-400 group-hover:text-red-400'}`} />
            <span>Browse</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${browseAnchor ? 'rotate-180 text-red-500' : 'text-slate-400'}`} />
            {activeTab === "browse" && (
              <div className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-3/4 h-[8px] bg-red-600/30 filter blur-[4px] rounded-full pointer-events-none" />
            )}
          </button>
        </div>
      </nav>

      {/* Right Side Tools (Search, Avatar) */}
      <div id="header-actions" className="flex items-center gap-4">
        {/* Search Icon */}
        <button
          id="header-search-btn"
          onClick={onSearchToggle}
          aria-label="Search movies"
          className={`p-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 border ${
            activeTab === 'search' 
              ? 'bg-red-600/15 text-red-400 border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]' 
              : 'hover:bg-white/5 border-transparent text-slate-300 hover:text-white'
          }`}
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Profile Avatar */}
        <div 
          id="header-user-profile" 
          className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 to-rose-700 border border-white/20 flex items-center justify-center font-bold text-xs shadow-[0_0_15px_rgba(229,9,20,0.3)] hover:shadow-[0_0_22px_rgba(229,9,20,0.5)] cursor-pointer hover:scale-105 active:scale-95 transition-all text-white select-none"
        >
          YS
        </div>
      </div>
    </header>
  );
};
