import React, { useState } from "react";
import { ActiveTab } from "../types";
import { Play, Search, User, Menu, ChevronDown, Cpu, Compass, Home as HomeIcon } from "lucide-react";

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

  const navItems = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "api", label: "API", icon: Cpu },
  ];

  return (
    <header 
      id="bitcine-header" 
      className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#050110]/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-10 flex items-center justify-between"
    >
      {/* Brand Logo - Bitcine */}
      <div 
        id="bitcine-logo-container" 
        onClick={() => setActiveTab("home")}
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <div id="bitcine-logo" className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.3)] group-hover:scale-105 transition-transform">
          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
        </div>
        <span id="bitcine-brand-name" className="text-xl font-black bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent tracking-tighter uppercase">
          Bitcine
        </span>
      </div>

      {/* Desktop Navigation */}
      <nav id="desktop-nav" className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-[#94a3b8]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer pb-1 ${
                isActive 
                  ? "text-white border-b-2 border-purple-500 font-black" 
                  : "hover:text-purple-400 font-bold"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
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
            className={`flex items-center gap-1 transition-colors cursor-pointer pb-1 ${
              activeTab === "browse" 
                ? "text-white border-b-2 border-purple-500 font-black" 
                : "hover:text-purple-400 font-bold"
            }`}
          >
            <Compass className="w-3.5 h-3.5 mr-1" />
            <span>Browse</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${browseAnchor ? 'rotate-180' : ''}`} />
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
          className={`p-2 rounded-full cursor-pointer transition-all ${
            activeTab === 'search' 
              ? 'bg-violet-500/20 text-violet-400' 
              : 'hover:bg-white/5 text-slate-300 hover:text-white'
          }`}
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Profile Avatar */}
        <div 
          id="header-user-profile" 
          className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 border border-white/20 flex items-center justify-center font-bold text-xs shadow-[0_0_15px_rgba(147,51,234,0.3)] cursor-pointer hover:scale-105 transition-all text-white select-none"
        >
          YS
        </div>
      </div>
    </header>
  );
};
