import React from "react";
import { ActiveTab } from "../types";
import { Home, Compass, Search, Cpu } from "lucide-react";

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "browse", label: "Browse", icon: Compass },
    { id: "search", label: "Search", icon: Search },
    { id: "api", label: "API Catalog", icon: Cpu },
  ];

  return (
    <div 
      id="mobile-bottom-nav" 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#06040d]/90 backdrop-blur-lg border-t border-purple-500/10 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.4)]"
    >
      <div className="flex items-center justify-around py-2.5 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`mobile-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className="flex flex-col items-center justify-center gap-1 flex-1 relative py-1 cursor-pointer"
            >
              <div 
                className={`p-1.5 rounded-xl transition-all ${
                  isActive 
                    ? "bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20 scale-110" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span 
                className={`text-[10px] font-medium tracking-wide transition-colors ${
                  isActive ? "text-violet-400 font-bold" : "text-slate-500"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
