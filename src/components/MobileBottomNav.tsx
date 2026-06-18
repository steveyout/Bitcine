import React from "react";
import { ActiveTab } from "../types";
import { Home, Compass, Search, History } from "lucide-react";

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
    { id: "history", label: "History", icon: History },
  ];

  return (
    <div 
      id="mobile-bottom-nav" 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#040102]/92 backdrop-blur-xl border-t border-red-500/10 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.6)] animate-[slideUp_0.4s_ease-out]"
    >
      <div className="flex items-center justify-around py-2 px-1">
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
                className={`p-1.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? "bg-gradient-to-tr from-red-600 to-rose-600 text-white shadow-md shadow-red-500/20 scale-105" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span 
                className={`text-[9.5px] uppercase font-black tracking-widest transition-colors duration-300 ${
                  isActive ? "text-red-500" : "text-slate-500"
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
