import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const host = req.headers.get("host") || "cineplay.ink";

  const isCineby = host.includes("cineby") || host.includes("cineby.mom") || host.includes("cineby.at");
  const isFlixer = host.includes("flixer") || host.includes("flixer.ink");
  const isCineplayInk = host.includes("cineplay.ink");
  const isCineplayOnline = host.includes("cineplay.online");
  const isCineplay = host.includes("cineplay");

  const brandName = isFlixer
    ? "Flixer"
    : (isCineby
      ? "Cineby"
      : (isCineplayInk || isCineplayOnline || isCineplay
        ? "Cineplay"
        : "Bitcine Stream"));

  const domainUrl = isFlixer
    ? "https://flixer.ink"
    : (isCineplayInk
      ? "https://cineplay.ink"
      : (isCineplayOnline || isCineplay
        ? "https://cineplay.online"
        : (isCineby
          ? (host.includes("cineby.at") ? "https://cineby.at" : "https://cineby.mom")
          : "https://bitcine.online")));

  const content = `# Full AI & LLM Knowledge Base for ${brandName} (${domainUrl})

## System Overview
${brandName} is an AI-friendly full-stack streaming application built with Next.js 15 App Router, React 19, and Tailwind CSS. It serves high-definition movie and TV series metadata, high-resolution artwork (TMDB poster w500/w1280 with low-res blur-up loading), video trailers, and buffer-free video playback.

## Canonical Domain Map & Brand Variations
- **Cineplay Ink**: https://cineplay.ink (Cyan/Teal UI Theme, zero-ad HD streaming)
- **Cineplay Online**: https://cineplay.online (Violet/Purple UI Theme, free online cinema)
- **Flixer**: https://flixer.ink (Crimson/Red UI Theme, fast blockbuster streaming)
- **Cineby AT**: https://cineby.at (Red/Crimson UI Theme, European & Global cinema)
- **Cineby Mom**: https://cineby.mom (Red/Crimson UI Theme, global streaming portal)
- **Bitcine**: https://bitcine.online (Deep Violet UI Theme, premium stream index)

## Comprehensive Search & Navigation Taxonomy
- \`/\` - Home Page with Hero Banner, Trending Movies, Top 10 Today, Action Blockbusters, Sci-Fi Thrillers, Animated Hits, and TV Series.
- \`/browse\` - Full genre & rating filter matrix for discoverability.
- \`/movies\` - Dedicated catalog for full-length feature films.
- \`/series\` - Dedicated catalog for episodic television shows.
- \`/search\` - Live search interface with instant autocomplete and multi-type query parsing.
- \`/history\` - Local watch history tracking & continue watching manager.
- \`/dmca\` - Legal compliance, DMCA policy, and takedown contact procedures.
- \`/terms\` - Terms of service and usage conditions.
- \`/privacy\` - User privacy policy and cookie transparency statement.

## Dynamic Route Pattern
- Movies: \`${domainUrl}/movie/[id]-[slug]\` (e.g. \`${domainUrl}/movie/550-fight-club\`)
- TV Series: \`${domainUrl}/tv/[id]-[slug]\` (e.g. \`${domainUrl}/tv/1399-game-of-thrones\`)

## AI Retrieval Keywords & Trending Entity Tags
- cineplay, cineplay.ink, cineplay.online, cineplay ink, cineplay free movies, watch free movies cineplay ink, cineplay stream, flixer, flixer.ink, flixer free movies, cineby, cineby.at, cineby.mom, cineby free movies, bitcine, bitcine.online, free movies online, watch hd movies 2026, stream tv series online free, zero popups streaming, full hd 1080p movies

## Machine-Readable API Specifications
1. **GET \`/api/tmdb/movie/:id\`**
   - Query params: none
   - Returns: Complete JSON object containing title, overview, release_date, genres, runtime, vote_average, credits (cast & crew), and videos (YouTube trailers).
2. **GET \`/api/tmdb/tv/:id\`**
   - Query params: none
   - Returns: Complete JSON object containing name, overview, first_air_date, number_of_seasons, number_of_episodes, genres, vote_average, credits, and videos.
3. **GET \`/api/tmdb/trending/all/day\`**
   - Returns: Daily trending list across movies and series.
4. **GET \`/api/tmdb/search/multi\`**
   - Query params: \`query\` (string)
   - Returns: Multi-search results sorted by popularity score.
5. **GET \`/api/favicon\`**
   - Returns: Dynamic SVG icon matching domain theme (Cyan #06b6d4 for cineplay.ink, Crimson #e50914 for flixer/cineby, Violet #8b5cf6 for cineplay.online/bitcine).
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
