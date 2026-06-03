import React from "react";
import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface SocialLink {
  name: string;
  url: string;
  color: string;
  glowColor: string;
  icon: React.ReactNode;
  tooltip: string;
}

export const FloatingSocials: React.FC = () => {
  const socials: SocialLink[] = [
    {
      name: "Discord",
      url: "https://discord.gg/5eWu9Vz6tQ",
      color: "bg-[#5865F2] hover:bg-[#4752C4]",
      glowColor: "shadow-[0_0_20px_rgba(88,101,242,0.45)] hover:shadow-[0_0_30px_rgba(88,101,242,0.7)]",
      tooltip: "Join our Discord Community",
      icon: (
        <svg viewBox="0 0 127.14 96.36" fill="currentColor" className="w-5.5 h-5.5 text-white">
          <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,52.8,6.83,77.19,77.19,0,0,0,49.5,0,105.15,105.15,0,0,0,19.06,8.07C2.75,32.41-1.7,56.09,.47,79.12a105.73,105.73,0,0,0,32,16.19,79,79,0,0,0,6.77-11,68.36,68.36,0,0,1-10.75-5.13c.91-.66,1.8-1.34,2.65-2a75.58,75.58,0,0,0,72,0c.85.69,1.74,1.37,2.65,2a68.29,68.29,0,0,1-10.75,5.13,79.05,79.05,0,0,0,6.77,11,105.73,105.73,0,0,0,32-16.19C129.66,50.14,124.66,26.75,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
        </svg>
      )
    },
    {
      name: "Telegram",
      url: "https://t.me/youplexannouncments",
      color: "bg-[#229ED9] hover:bg-[#1a80b0]",
      glowColor: "shadow-[0_0_20px_rgba(34,158,217,0.45)] hover:shadow-[0_0_30px_rgba(34,158,217,0.7)]",
      tooltip: "Subscribe to Telegram Channel",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white ml-[-1px]">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.93 1.22-5.46 3.61-.51.35-.98.53-1.39.52-.46-.01-1.33-.26-1.98-.48-.8-.27-1.43-.42-1.37-.89.03-.25.38-.51 1.03-.78 4.04-1.76 6.74-2.92 8.09-3.48 3.85-1.6 4.64-1.88 5.17-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.13-.03.19z" />
        </svg>
      )
    }
  ];

  return (
    <div 
      id="floating-social-rail" 
      className="fixed bottom-24 md:bottom-8 right-5 md:right-8 z-40 flex flex-col gap-3.5 select-none"
    >
      {socials.map((social) => (
        <motion.div
          key={social.name}
          initial={{ opacity: 0, scale: 0.8, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative group flex items-center justify-end"
        >
          {/* Elegant Tooltip Popover */}
          <div className="absolute right-14 mr-2 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 pointer-events-none transition-all duration-300 origin-right whitespace-nowrap bg-[#0b041a]/95 text-[#f8fafc] border border-purple-500/15 rounded-lg px-3 py-1.5 text-[11px] font-bold tracking-brand uppercase shadow-xl backdrop-blur-md">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></span>
              {social.tooltip}
            </span>
          </div>

          {/* Social Anchor button link with brand specific gradients and glowing transitions */}
          <a
            id={`social-link-${social.name.toLowerCase()}`}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-12 h-12 flex items-center justify-center rounded-full text-white cursor-pointer transition-all duration-300 border border-white/5 shadow-lg active:scale-90 ${social.color} ${social.glowColor}`}
          >
            {social.icon}
          </a>
        </motion.div>
      ))}
    </div>
  );
};
