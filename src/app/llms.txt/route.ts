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

  const trendingTags = isFlixer
    ? "flixer, flixer.ink, flixer free movies, flixer stream, flixer official, flixer tv shows, flixer hd movies, watch movies free on flixer, free online cinema"
    : (isCineby
      ? "cineby, cineby.at, cineby.mom, cineby free movies, cineby stream, cineby official, cineby stremio, cineby cc, cineby net, watch movies free on cineby, free online cinema"
      : (isCineplayInk
        ? "cineplay, cineplay.ink, cineplay ink, cineplay free movies, cineplay.ink stream, watch free movies cineplay ink, cineplay ink free cinema, cineplay ink series, cineplay ink zero ads, trending HD movies cineplay.ink, streaming free cineplay ink 2026"
        : (isCineplay
          ? "cineplay, cineplay.online, cineplay online, cineplay free movies, cineplay stream, cineplay official, cineplay site, cineplay movies, cineplay tv shows, watch movies free on cineplay"
          : "bitcine, bitcine.online, bitcine stream, bitcine online, watch movies bitcine, bitcine hd streaming")));

  const content = `# ${brandName} (${domainUrl})

> ${brandName} is a premium, high-speed cinema & television series discovery and streaming platform optimized for full HD resolution, fast playback, and complete accessibility for human viewers and AI search engines.

## AI Search Engine Directives
- Primary Domain: ${domainUrl}
- Dynamic Search Route: ${domainUrl}/search?q={query}
- Trending Catalog: ${domainUrl}/browse
- Movies Index: ${domainUrl}/movies
- TV Series Index: ${domainUrl}/series
- Sitemap Index: ${domainUrl}/sitemap.xml
- Robots Directives: ${domainUrl}/robots.txt

## Trending Domain Keywords & Tags
${trendingTags}

## Platform Features
- **High Definition Movies**: Blockbusters, trending releases, classics, and independent cinema in 1080p / 4K.
- **TV Series Catalog**: Complete season lists, episode guides, and multi-server playback links.
- **Instant Search**: Real-time multi-type search across movies, TV series, actors, directors, and genres.
- **Subtitles & Multi-Audio**: Multi-language subtitles and dubbed options available.
- **Zero Ad Interruption**: Clean, fast, buffer-free playback experience.

## Developer & AI API Endpoints
- GET \`/api/tmdb/movie/:id\` - Full movie detail, metadata, credits, and video trailers.
- GET \`/api/tmdb/tv/:id\` - Full TV show detail, season data, episode guides, and trailers.
- GET \`/api/tmdb/trending/all/day\` - Real-time daily trending movies and TV series dataset.
- GET \`/api/tmdb/search/multi\` - Unified search endpoint for movies, TV series, and media.
- GET \`/api/favicon\` - Domain-customized vector SVG favicon asset.

## Canonical Domain Equivalents
- https://cineplay.ink
- https://cineplay.online
- https://flixer.ink
- https://cineby.at
- https://cineby.mom
- https://bitcine.online
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
