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
    // Determine which brand to use based on the current active hostname
    const isCineby = typeof window !== "undefined" && (
      window.location.hostname.includes("cineby") ||
      window.location.hostname.includes("cineby.mom") ||
      window.location.hostname.includes("cineby.at")
    );
    const brandName = isCineby ? "Cineby Stream" : "Bitcine Stream";
    const brandShort = isCineby ? "Cineby" : "Bitcine";
    const baseKeywords = isCineby 
      ? "cineby, cineby free movies, cineby.at, cineby stream, cineby official, cineby site, cineby movies, cineby tv shows, cineby.mom, watch movies free on cineby, free movies online, watch hd movies, free streaming sites, watch tv series online"
      : "bitcine, watch movies, watch tv series, streaming service, movie catalog, free cinema, interactive api helper, HD movies online, bitcine.online";

    // 1. Determine Title based on current browsing state
    let title = isCineby
      ? "Cineby - Watch Free Movies & TV Shows Online in HD"
      : "Bitcine | Watch Movies & TV Shows Free in HD";
    let description = isCineby
      ? "Watch unlimited movies & TV shows free on Cineby (cineby.at). Stream in high-fidelity full HD with zero popups, multiple server links, and clean modern playback."
      : `Watch unlimited movies & TV shows on ${brandName}. Enjoy high-fidelity cinema playback, raw JSON analytics API testing, and detailed media indexes with no ads.`;
    let keywords = baseKeywords;
    let type = "video.movie";
    let ogImage = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=630&fit=crop"; // Default gorgeous cinematic poster representation
    const canonicalUrl = window.location.origin + (activeTab === "home" ? "" : `/${activeTab}`);

    if (modalOpen && selectedMovie) {
      const year = selectedMovie.release_date ? new Date(selectedMovie.release_date).getFullYear() : (selectedMovie.first_air_date ? new Date(selectedMovie.first_air_date).getFullYear() : "");
      const yearStr = year ? ` (${year})` : "";
      const mediaName = selectedMovie.title || selectedMovie.name;
      title = isCineby
        ? `Watch ${mediaName}${yearStr} Free Online on Cineby`
        : `Watch ${mediaName}${yearStr} Premium HD | ${brandName}`;
      description = selectedMovie.overview || `Stream ${mediaName} in full high-fidelity cinematic resolution with multi-server playback options on ${brandShort}.`;
      keywords = isCineby
        ? `watch ${mediaName} free, watch ${mediaName} online, cineby ${mediaName}, stream ${mediaName} online, watch free ${mediaName} hd, cineby movies, ${mediaName} cast, ${mediaName} download`
        : `${mediaName}, watch ${mediaName}, stream online, cast info, release date, download hd movies`;
      type = "video.movie";
      if (selectedMovie.backdrop_path) {
        ogImage = `https://image.tmdb.org/t/p/w1280${selectedMovie.backdrop_path}`;
      } else if (selectedMovie.poster_path) {
        ogImage = `https://image.tmdb.org/t/p/w780${selectedMovie.poster_path}`;
      }
    } else {
      switch (activeTab) {
        case "browse":
          title = isCineby
            ? `Cineby - Browse Movies, TV Shows, Trending Genres`
            : `Browse Movie Categories & TV Shows | ${brandName}`;
          description = isCineby
            ? "Discover trending movies, TV shows, action-packed adventures, comedies, and sci-fi on Cineby. Clean, categorized streaming directory sorted dynamically."
            : "Discover popular genres, top charts, highly-rated television shows, and experimental sci-fi catalogs sorted dynamically via TMDB data streams.";
          keywords = isCineby
            ? `cineby browse, movie catalog, free cinema list, discover tv shows on cineby, high rated movies free`
            : `browse movies, genre listing, highly rated cinema, movie discovery, tv shows sorted, ${brandShort.toLowerCase()}`;
          break;
        case "search":
          if (searchQuery) {
            title = isCineby
              ? `Watch "${searchQuery}" Free on Cineby - Streaming Results`
              : `Search Results for "${searchQuery}" | ${brandName}`;
            description = `Stream and watch your favorite titles matching "${searchQuery}" free in HD on Cineby.`;
            keywords = isCineby
              ? `watch ${searchQuery} free, cineby ${searchQuery}, stream ${searchQuery} online`
              : `search movies, query cinema catalog, find titles, actor search, ${brandShort.toLowerCase()}`;
          } else {
            title = isCineby
              ? `Search Movies & TV Series - Cineby Free Streaming`
              : `Search Premium Movies & TV Series | ${brandName}`;
            description = isCineby
              ? "Search the complete Cineby library of movies, series, anime, and documentaries. Find your favorite film or show in seconds."
              : "Search our complete streaming library instantly. Find actors, directors, movie release years, and cinematic titles with zero latency.";
            keywords = isCineby
              ? `search free movies, cineby finder, cineby stream search`
              : `search movies, query cinema catalog, find titles, actor search, ${brandShort.toLowerCase()}`;
          }
          break;
        case "history":
          title = isCineby
            ? `My Watchlist & Viewing History | Cineby`
            : `Watch History & Continued Streams | ${brandName}`;
          description = `Access and resume your watching progress on Cineby. Free personalized queue of movies and series on your active session.`;
          keywords = isCineby
            ? `cineby watchlist, cineby watch history, resume movie on cineby`
            : `stream history, continue watching, resume playback, watched episodes, movie offsets, ${brandShort.toLowerCase()}`;
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
    updateOrCreateMeta("property", "og:site_name", brandName);

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
      "name": brandName,
      "alternateName": brandShort,
      "url": window.location.origin,
      "description": "Premium multi-source cinema metadata, TV logs, and developers' sandboxed layout system.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${window.location.origin}?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };

    schemaScript.textContent = JSON.stringify(currentSchema, null, 2);

    // 4. Trigger Google Analytics (gtag) custom page view tracking
    if (typeof (window as any).gtag === "function") {
      const sanitizedName = (selectedMovie?.title || selectedMovie?.name || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-");
      const pathSuffix = modalOpen && selectedMovie 
        ? `/movie/${selectedMovie.id}-${sanitizedName}`
        : (activeTab === "home" ? "/" : `/${activeTab}`);
      
      const pageLocation = window.location.origin + pathSuffix;

      (window as any).gtag("event", "page_view", {
        page_title: title,
        page_location: pageLocation,
        page_path: pathSuffix,
        send_to: "G-4F51F8KKEP"
      });

      // Special dynamic "view_item" event tracking for movies/shows
      if (modalOpen && selectedMovie) {
        (window as any).gtag("event", "view_item", {
          currency: "USD",
          value: selectedMovie.vote_average,
          items: [{
            item_id: String(selectedMovie.id),
            item_name: selectedMovie.title || selectedMovie.name,
            item_category: selectedMovie.first_air_date ? "TV Show" : "Movie",
            index: 1
          }]
        });
      }
    }

  }, [activeTab, selectedMovie, modalOpen, searchQuery]);

  return null;
}
