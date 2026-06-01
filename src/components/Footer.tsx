import React from "react";
import { ArrowUp, Mail } from "lucide-react";

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer 
      id="bitcine-global-footer" 
      className="border-t border-purple-500/[0.08] bg-[#03010b] text-[#94a3b8] py-12 px-6 md:px-12 select-none relative z-10 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
        
        {/* Left disclaimer block */}
        <div className="flex flex-col gap-3 max-w-2xl text-left">
          <h3 className="text-[#f8fafc] text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
            Bitcine
          </h3>
          <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed">
            This site does not store any files on our server, we only linked to the media which is hosted on 3rd party services.
          </p>
          <a 
            href="mailto:contact@bitcine.tv"
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5 mt-1 font-semibold hover:underline w-fit"
          >
            <Mail className="w-3.5 h-3.5" />
            contact@bitcine.tv
          </a>
        </div>

        {/* Right Scroll Back to Top widget */}
        <div className="flex items-center self-start md:self-center">
          <button
            onClick={scrollToTop}
            aria-label="Scroll to Top"
            className="w-12 h-12 rounded-full border border-purple-500/10 bg-[#050110] text-[#f8fafc] hover:bg-violet-600/90 hover:scale-110 active:scale-95 transition-all shadow-lg flex items-center justify-center cursor-pointer group"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

      </div>

      {/* Trademark marker */}
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-purple-500/[0.03] flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-slate-500">
        <span>© {new Date().getFullYear()} Bitcine Inc.</span>
        <span>Made for Cinephiles</span>
      </div>
    </footer>
  );
};
