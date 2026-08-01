import React, { useEffect, useState } from "react";
import { ArrowUp, Mail, Bot, FileText, Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  const [brandLabel, setBrandLabel] = useState("Cineby");
  const [domainUrl, setDomainUrl] = useState("https://cineby.mom");
  const [contactEmail, setContactEmail] = useState("contact@cineby.mom");
  const [isCyan, setIsCyan] = useState(false);
  const [isRed, setIsRed] = useState(false);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);

  useEffect(() => {
    const host = typeof window !== "undefined" ? window.location.hostname : "";
    const isCineby = host.includes("cineby") || host.includes("cineby.mom") || host.includes("cineby.at");
    const isFlixer = host.includes("flixer") || host.includes("flixer.ink");
    const isCineplayInk = host.includes("cineplay.ink");
    const isCineplayOnline = host.includes("cineplay.online");
    const isCineplay = host.includes("cineplay");

    if (isFlixer) {
      setBrandLabel("Flixer");
      setDomainUrl("https://flixer.ink");
      setContactEmail("contact@flixer.ink");
      setIsRed(true);
      setIsCyan(false);
      setTrendingTags(["Flixer Stream", "Flixer Free Movies", "Flixer.ink Official", "Watch HD Movies", "Flixer Series", "Zero Ads Cinema"]);
    } else if (isCineby) {
      setBrandLabel("Cineby");
      const url = host.includes("cineby.at") ? "https://cineby.at" : "https://cineby.mom";
      setDomainUrl(url);
      setContactEmail("contact@cineby.mom");
      setIsRed(true);
      setIsCyan(false);
      setTrendingTags(["Cineby Stream", "Cineby.at Free Movies", "Cineby Stremio", "Cineby CC", "Cineby Free Cinema", "Stream Seriados"]);
    } else if (isCineplayInk) {
      setBrandLabel("Cineplay");
      setDomainUrl("https://cineplay.ink");
      setContactEmail("contact@cineplay.ink");
      setIsCyan(true);
      setIsRed(false);
      setTrendingTags(["Cineplay.ink Stream", "Cineplay Ink Free Movies", "Cineplay Official Site", "Watch Movies Free Cineplay Ink", "Free HD Streaming", "Cineplay Ink 2026"]);
    } else if (isCineplayOnline || isCineplay) {
      setBrandLabel("Cineplay");
      setDomainUrl("https://cineplay.online");
      setContactEmail("contact@cineplay.online");
      setIsCyan(false);
      setIsRed(false);
      setTrendingTags(["Cineplay Online", "Cineplay Stream", "Cineplay Free Movies", "Cineplay Official", "Watch HD Series Online", "Free Online Cinema"]);
    } else {
      setBrandLabel("Bitcine");
      setDomainUrl("https://bitcine.online");
      setContactEmail("contact@bitcine.online");
      setIsCyan(false);
      setIsRed(false);
      setTrendingTags(["Bitcine Stream", "Bitcine Online", "Bitcine Free HD", "Bitcine Cinema", "Latest Blockbusters", "Multi-Server Player"]);
    }
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const accentBg = isCyan ? "bg-cyan-500" : (isRed ? "bg-red-600" : "bg-purple-500");
  const accentText = isCyan ? "text-cyan-400" : (isRed ? "text-red-400" : "text-purple-400");
  const accentHover = isCyan ? "hover:bg-cyan-600" : (isRed ? "hover:bg-red-600" : "hover:bg-violet-600");

  return (
    <footer 
      id="bitcine-global-footer" 
      className="border-t border-white/10 bg-[#03010b] text-[#94a3b8] py-12 px-6 md:px-12 select-none relative z-10 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-8">
        
        {/* Left disclaimer block */}
        <div className="flex flex-col gap-3 max-w-2xl text-left">
          <h3 className="text-[#f8fafc] text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <div className={`w-1 h-4 ${accentBg} rounded-full`}></div>
            {brandLabel} Stream
          </h3>
          <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed">
            {brandLabel} does not host or store media files on our servers. All content is indexed from third-party media distribution protocols.
          </p>
          <a 
            href={`mailto:${contactEmail}`}
            className={`text-xs ${accentText} transition-colors flex items-center gap-1.5 mt-1 font-semibold hover:underline w-fit`}
          >
            <Mail className="w-3.5 h-3.5" />
            {contactEmail}
          </a>

          {/* Domain Specific Trending SEO Tags */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Trending Tags & AI Search Context
            </span>
            <div className="flex flex-wrap gap-1.5">
              {trendingTags.map((tag, idx) => (
                <a
                  key={idx}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-colors"
                >
                  #{tag}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right Navigation & AI Links */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex flex-col gap-2 text-xs text-slate-400">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Index & AI Protocols</span>
            <a href="/llms.txt" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1.5 transition-colors">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              llms.txt (AI Knowledge Base)
            </a>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1.5 transition-colors">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              Sitemap.xml Index
            </a>
          </div>

          <div className="flex items-center self-start md:self-center">
            <button
              onClick={scrollToTop}
              aria-label="Scroll to Top"
              className={`w-12 h-12 rounded-full border border-white/10 bg-[#050110] text-[#f8fafc] ${accentHover} hover:scale-110 active:scale-95 transition-all shadow-lg flex items-center justify-center cursor-pointer group`}
            >
              <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>

      {/* Trademark marker */}
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] uppercase font-bold tracking-widest text-slate-500">
        <span>© {new Date().getFullYear()} {brandLabel} Network ({domainUrl.replace("https://", "")})</span>
        <div className="flex items-center gap-4">
          <a href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</a>
          <a href="/dmca" className="hover:text-slate-300 transition-colors">DMCA Takedown</a>
        </div>
      </div>
    </footer>
  );
};

