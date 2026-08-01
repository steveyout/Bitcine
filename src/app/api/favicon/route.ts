import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const host = req.headers.get("host") || "";
  
  const isCineby = host.includes("cineby") || host.includes("cineby.mom") || host.includes("cineby.at");
  const isFlixer = host.includes("flixer") || host.includes("flixer.ink");
  const isCineplayInk = host.includes("cineplay.ink");
  const isCineplayOnline = host.includes("cineplay.online") || host.includes("cineplay");

  let gradStart = "#8b5cf6"; // Default Violet
  let gradMid = "#6d28d9";
  let gradEnd = "#4c1d95";
  let glowColor = "#8b5cf6";

  if (isFlixer || isCineby) {
    gradStart = "#ff5c62";
    gradMid = "#e50914";
    gradEnd = "#ab0409";
    glowColor = "#e50914";
  } else if (isCineplayInk) {
    // Cyan / Teal theme for cineplay.ink
    gradStart = "#22d3ee";
    gradMid = "#06b6d4";
    gradEnd = "#0e7490";
    glowColor = "#06b6d4";
  } else if (isCineplayOnline) {
    gradStart = "#a855f7";
    gradMid = "#8b5cf6";
    gradEnd = "#6d28d9";
    glowColor = "#8b5cf6";
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="100%" height="100%" fill="none">
  <defs>
    <linearGradient id="mainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${gradStart}" />
      <stop offset="60%" stop-color="${gradMid}" />
      <stop offset="100%" stop-color="${gradEnd}" />
    </linearGradient>
    <filter id="softGlow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="${glowColor}" flood-opacity="0.4" />
    </filter>
  </defs>

  <g filter="url(#softGlow)">
    <rect x="8" y="8" width="144" height="144" rx="42" fill="url(#mainGrad)" />
    <path d="M 64 50 C 64 45.5, 69 42.5, 73 45 L 112 71 C 116.5 73.5, 116.5 80.5, 112 83 L 73 109 C 69 111.5, 64 108.5, 64 104 Z" fill="#FFFFFF" />
  </g>
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
