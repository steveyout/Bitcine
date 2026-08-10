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

  const content = `# Full AI & LLM Knowledge Base for ${brandName}

> ${brandName} is an AI-friendly full-stack streaming application built with Next.js 15 App Router, React 19, and Tailwind CSS. It serves high-definition movie and TV series metadata, high-resolution artwork (TMDB poster w500/w1280 with low-res blur-up loading), video trailers, and buffer-free video playback.

## Canonical Domain Map & Network Mirrors
- [Cinejoy Online](https://cinejoy.online/): Official primary partner mirror node.
- [Cineplay Ink](https://cineplay.ink): Cyan/Teal UI Theme, zero-ad HD streaming mirror.
- [Cineplay Online](https://cineplay.online): Violet/Purple UI Theme, free online cinema portal.
- [Flixer Ink](https://flixer.ink): Crimson/Red UI Theme, fast blockbuster streaming mirror.
- [Cineby AT](https://cineby.at): European and global cinema portal.
- [Cineby Mom](https://cineby.mom): Global streaming portal.
- [Bitcine Online](https://bitcine.online): Deep Violet UI Theme, premium stream index.

## Comprehensive Search & Navigation Taxonomy
- [Homepage](${domainUrl}/): Home View featuring Hero Banner, Trending Movies, Top 10 Today, and Popular TV Series.
- [Browse Catalog](${domainUrl}/browse): Full genre and rating filter matrix for content discoverability.
- [Movies Library](${domainUrl}/movies): Dedicated catalog for full-length feature films.
- [TV Series Library](${domainUrl}/series): Dedicated catalog for episodic television shows.
- [Instant Search](${domainUrl}/search): Search interface with instant autocomplete and multi-type query parsing.
- [Watch History](${domainUrl}/history): Local watch history tracking & continue watching manager.
- [DMCA Compliance](${domainUrl}/dmca): Legal compliance, DMCA policy, and takedown procedures.
- [Terms of Service](${domainUrl}/terms): Terms of service and usage conditions.
- [Privacy Policy](${domainUrl}/privacy): User privacy policy and cookie transparency statement.

## Dynamic Route Specifications
- [Movie Pattern](${domainUrl}/movie/550-fight-club): Movie details and stream player (\`${domainUrl}/movie/[id]-[slug]\`).
- [TV Series Pattern](${domainUrl}/tv/1399-game-of-thrones): TV series details and season guides (\`${domainUrl}/tv/[id]-[slug]\`).

## Machine-Readable API Specifications
- [AI Search Index API](${domainUrl}/api/ai-search?q=Inception&format=json): Structured AI entity summaries with canonical watch links, ratings, overview, and streaming availability for LLM RAG pipelines.
- [TMDB Movie Details API](${domainUrl}/api/tmdb/movie/550): Complete JSON object containing title, overview, release_date, genres, runtime, vote_average, credits, and video trailers.
- [TMDB TV Details API](${domainUrl}/api/tmdb/tv/1399): Complete JSON object containing name, overview, first_air_date, number_of_seasons, number_of_episodes, genres, vote_average, credits, and videos.
- [TMDB Trending API](${domainUrl}/api/tmdb/trending/all/day): Daily trending list across movies and series.
- [TMDB Multi Search API](${domainUrl}/api/tmdb/search/multi?query=Inception): Multi-search results sorted by popularity score.
- [Favicon API](${domainUrl}/api/favicon): Dynamic SVG icon matching domain theme.
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
