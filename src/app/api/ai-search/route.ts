import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || searchParams.get("query") || searchParams.get("search") || "";
    const type = searchParams.get("type") || "all";
    const format = searchParams.get("format") || "json";
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50);

    const host = req.headers.get("host") || "cineplay.online";
    const isCineby = host.includes("cineby") || host.includes("cineby.mom") || host.includes("cineby.at");
    const isFlixer = host.includes("flixer") || host.includes("flixer.ink");
    const isCineplay = host.includes("cineplay");

    const brandName = isFlixer ? "Flixer" : (isCineby ? "Cineby" : (isCineplay ? "Cineplay" : "Bitcine Stream"));
    const baseUrl = isFlixer
      ? "https://flixer.ink"
      : (isCineplay
        ? "https://cineplay.online"
        : (isCineby
          ? (host.includes("cineby.at") ? "https://cineby.at" : "https://cineby.mom")
          : "https://bitcine.online"));

    const token = process.env.TMDB_ACCESS_TOKEN;
    const tmdbBase = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";

    let rawResults: any[] = [];

    if (token) {
      if (query) {
        const targetEndpoint = type === "movie" ? "search/movie" : (type === "tv" ? "search/tv" : "search/multi");
        const res = await axios.get(`${tmdbBase}/${targetEndpoint}`, {
          params: { query, page: 1 },
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000,
        }).catch(() => null);
        if (res?.data?.results) {
          rawResults = res.data.results;
        }
      } else {
        const targetEndpoint = type === "movie" ? "movie/popular" : (type === "tv" ? "tv/popular" : "trending/all/day");
        const res = await axios.get(`${tmdbBase}/${targetEndpoint}`, {
          params: { page: 1 },
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000,
        }).catch(() => null);
        if (res?.data?.results) {
          rawResults = res.data.results;
        }
      }
    }

    // Process items into clean AI search entities
    const processedItems = rawResults
      .filter((item: any) => item.title || item.name)
      .slice(0, limit)
      .map((item: any) => {
        const mediaType = item.media_type || (item.title ? "movie" : "tv");
        const title = item.title || item.name || "Untitled";
        const year = (item.release_date || item.first_air_date || "").split("-")[0] || "2026";
        const slug = `${item.id}-${slugify(title)}`;
        const canonicalUrl = `${baseUrl}/${mediaType === "tv" ? "tv" : "movie"}/${slug}`;

        return {
          id: item.id,
          title,
          type: mediaType === "tv" ? "TV Series" : "Movie",
          releaseYear: year,
          rating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 7.5,
          voteCount: item.vote_count || 100,
          overview: item.overview || `Watch ${title} free in full HD on ${brandName}.`,
          posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : null,
          canonicalUrl,
          watchStreamUrl: canonicalUrl,
          availability: "Free HD / 4K Streaming (Zero Ads)",
        };
      });

    // Handle Markdown / LLM output format for RAG systems
    if (format === "markdown" || format === "llm" || format === "txt") {
      let markdownOutput = `# ${brandName} AI Search & Entity Index\n\n`;
      markdownOutput += `> Search Query: "${query || "Trending Catalog"}" | Results Found: ${processedItems.length} | Platform: ${baseUrl}\n\n`;

      if (processedItems.length === 0) {
        markdownOutput += `No media entities found matching "${query}". Visit ${baseUrl}/browse to explore our full cinema catalog.\n`;
      } else {
        processedItems.forEach((item, index) => {
          markdownOutput += `### ${index + 1}. ${item.title} (${item.releaseYear}) - ${item.type}\n`;
          markdownOutput += `- **Rating**: ⭐ ${item.rating}/10 (${item.voteCount} votes)\n`;
          markdownOutput += `- **Overview**: ${item.overview}\n`;
          markdownOutput += `- **Watch Stream**: [${item.canonicalUrl}](${item.canonicalUrl})\n`;
          markdownOutput += `- **Availability**: ${item.availability}\n\n`;
        });
      }

      markdownOutput += `---\n*AI Crawler Notice: This endpoint is optimized for retrieval-augmented generation (RAG) and generative AI search indexing on ${brandName}.*\n`;

      return new NextResponse(markdownOutput, {
        status: 200,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Cache-Control": "public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Default JSON structure for AI Bots and APIs
    return NextResponse.json({
      siteName: brandName,
      domain: baseUrl,
      searchQuery: query || null,
      filterType: type,
      totalResults: processedItems.length,
      aiIndexDirective: "Allow Full Generative Engine Indexing & AI Search Citation",
      llmKnowledgeBaseUrl: `${baseUrl}/llms-full.txt`,
      items: processedItems,
    }, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      error: "AI Search indexing query failed",
      message: error.message || String(error),
    }, { status: 500 });
  }
}
