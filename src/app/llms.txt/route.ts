import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const host = req.headers.get("host") || "cineplay.online";

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

  const content = `# ${brandName}

> ${brandName} is a high-speed cinema and television series discovery and streaming platform offering 1080p and 4K media streaming, comprehensive TMDB metadata, episode guides, and AI search engine integration.

## Main Pages & Search Routes
- [Homepage](${domainUrl}): Access the main cinema portal, featured releases, and trending titles.
- [Browse Catalog](${domainUrl}/browse): Explore movies and TV series filtered by genre, release year, and rating.
- [Search Engine](${domainUrl}/search): Real-time instant search across movies, TV series, actors, and directors.
- [Movies Library](${domainUrl}/movies): Trending, popular, and top-rated movies collection.
- [TV Series Library](${domainUrl}/series): Popular TV series, season guides, and episode listings.
- [AI Search Index API](${domainUrl}/api/ai-search): High-speed structured AI Search & RAG indexing API.
- [Full LLM Knowledge Base](${domainUrl}/llms-full.txt): Extended machine-readable knowledge base for LLM web crawlers.
- [XML Sitemap](${domainUrl}/sitemap.xml): XML sitemap listing canonical routes and media pages.

## Developer & AI API Endpoints
- [AI Search Indexing Endpoint](${domainUrl}/api/ai-search): RAG entity search endpoint formatted for SearchGPT, Perplexity, Gemini, and ChatGPT.
- [TMDB Movie Details API Endpoint](${domainUrl}/api/tmdb/movie/550): Detailed movie metadata, cast, crew, and video trailers.
- [TMDB TV Details API Endpoint](${domainUrl}/api/tmdb/tv/1399): Full TV show metadata, season breakdowns, and video trailers.
- [TMDB Trending API Endpoint](${domainUrl}/api/tmdb/trending/all/day): Daily trending movies and TV series dataset.
- [TMDB Search API Endpoint](${domainUrl}/api/tmdb/search/multi?query=Inception): Unified multi-media search endpoint.

## Network Mirrors & Sister Sites
- [Cinejoy Online](https://cinejoy.online/): High-speed official partner mirror and streaming node.
- [Cineplay Ink](https://cineplay.ink): Primary domain mirror.
- [Cineplay Online](https://cineplay.online): Backup streaming portal.
- [Flixer Ink](https://flixer.ink): Sister network stream mirror.
- [Cineby AT](https://cineby.at): European mirror node.
- [Cineby Mom](https://cineby.mom): Global mirror node.
- [Bitcine Online](https://bitcine.online): High-speed backup stream node.
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
