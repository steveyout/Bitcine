import { useEffect } from "react";
import { Movie, ActiveTab } from "../types";

interface SEOHelmetProps {
  activeTab: ActiveTab;
  selectedMovie: Movie | null;
  modalOpen: boolean;
  searchQuery?: string;
}

export function SEOHelmet({ activeTab, selectedMovie, modalOpen, searchQuery }: SEOHelmetProps) {
  useEffect(() => {
    // 1. Determine Title based on current browsing state
    let title = "Bitcine Stream | Watch Movies & TV Shows Free in HD";
    let description = "Watch unlimited movies & TV shows on Bitcine Stream. Enjoy high-fidelity cinema playback, raw JSON analytics API testing, and detailed media indexes with no ads.";
    let keywords = "bitcine, watch movies, watch tv series, streaming service, movie catalog, free cinema, interactive api helper, HD movies online";
    let type = "website";
    let ogImage = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=630&fit=crop"; // Default gorgeous cinematic poster representation
    const canonicalUrl = window.location.origin + (activeTab === "home" ? "" : `/${activeTab}`);

    if (modalOpen && selectedMovie) {
      const year = selectedMovie.release_date ? new Date(selectedMovie.release_date).getFullYear() : (selectedMovie.first_air_date ? new Date(selectedMovie.first_air_date).getFullYear() : "");
      const yearStr = year ? ` (${year})` : "";
      title = `Watch ${selectedMovie.title || selectedMovie.name}${yearStr} Premium HD | Bitcine Stream`;
      description = selectedMovie.overview || `Stream ${selectedMovie.title || selectedMovie.name} in full high-fidelity cinematic resolution with multi-server playback options on Bitcine.`;
      keywords = `${selectedMovie.title || selectedMovie.name}, watch ${selectedMovie.title || selectedMovie.name}, stream online, cast info, release date, download hd movies`;
      type = "video.movie";
      if (selectedMovie.backdrop_path) {
        ogImage = `https://image.tmdb.org/t/p/w1280${selectedMovie.backdrop_path}`;
      } else if (selectedMovie.poster_path) {
        ogImage = `https://image.tmdb.org/t/p/w780${selectedMovie.poster_path}`;
      }
    } else {
      switch (activeTab) {
        case "browse":
          title = "Browse Movie Categories & TV Shows | Bitcine Stream";
          description = "Discover popular genres, top charts, highly-rated television shows, and experimental sci-fi catalogs sorted dynamically via TMDB data streams.";
          keywords = "browse movies, genre listing, highly rated cinema, movie discovery, tv shows sorted";
          break;
        case "search":
          if (searchQuery) {
            title = `Search Results for "${searchQuery}" | Bitcine Stream`;
            description = `Browse matching streaming titles and details found for "${searchQuery}" on Bitcine Stream search logs.`;
          } else {
            title = "Search Premium Movies & TV Series | Bitcine Stream";
            description = "Search our complete streaming library instantly. Find actors, directors, movie release years, and cinematic titles with zero latency.";
          }
          keywords = "search movies, query cinema catalog, find titles, actor search";
          break;
        case "api":
          title = "Developer API Sandbox & TMDB Logs | Bitcine Stream";
          description = "Examine Bitcine's full-stack Express proxies communicating securely with TMDB. Test movie and watch endpoints in real-time, view logs, and discover web architecture.";
          keywords = "api schema, developer sandbox, tmdb gateway, watch server proxy, developer documentation, json test suite";
          break;
        default:
          break;
      }
    }

    // 2. Direct DOM update for Document Title
    document.title = title;

    // 3. Dynamic Meta tag creator and updater
    const updateOrCreateMeta = (nameAttr: string, valueAttr: string, content: string) => {
      let element = document.querySelector(`meta[${nameAttr}="${valueAttr}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(nameAttr, valueAttr);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Update basic SEO tags
    updateOrCreateMeta("name", "description", description);
    updateOrCreateMeta("name", "keywords", keywords);
    
    // Update Open Graph (Facebook/Discord/Slack/Reddit previews)
    updateOrCreateMeta("property", "og:title", title);
    updateOrCreateMeta("property", "og:description", description);
    updateOrCreateMeta("property", "og:type", type);
    updateOrCreateMeta("property", "og:image", ogImage);
    updateOrCreateMeta("property", "og:url", canonicalUrl);
    updateOrCreateMeta("property", "og:site_name", "Bitcine Stream");

    // Update Twitter Cards formatting
    updateOrCreateMeta("name", "twitter:card", "summary_large_image");
    updateOrCreateMeta("name", "twitter:title", title);
    updateOrCreateMeta("name", "twitter:description", description);
    updateOrCreateMeta("name", "twitter:image", ogImage);

    // Update Canonical URL element
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    // Update JSON-LD Structured Schema dynamically for rich Google snippet indexing
    let schemaScript = document.getElementById("bitcine-dynamic-seo-schema") as HTMLScriptElement;
    if (!schemaScript) {
      schemaScript = document.createElement("script");
      schemaScript.id = "bitcine-dynamic-seo-schema";
      schemaScript.type = "application/ld+json";
      document.head.appendChild(schemaScript);
    }

    const currentSchema = modalOpen && selectedMovie ? {
      "@context": "https://schema.org",
      "@type": "Movie",
      "name": selectedMovie.title || selectedMovie.name,
      "description": selectedMovie.overview,
      "image": ogImage,
      "dateCreated": selectedMovie.release_date || selectedMovie.first_air_date,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": selectedMovie.vote_average,
        "bestRating": "10",
        "worstRating": "1",
        "ratingCount": selectedMovie.vote_count || 120
      }
    } : {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Bitcine Stream",
      "alternateName": "Bitcine",
      "url": window.location.origin,
      "description": "Premium multi-source cinema metadata, TV logs, and developers' sandboxed layout system.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${window.location.origin}?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };

    schemaScript.textContent = JSON.stringify(currentSchema, null, 2);

  }, [activeTab, selectedMovie, modalOpen, searchQuery]);

  return null;
}
