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
    const isFlixer = typeof window !== "undefined" && (
      window.location.hostname.includes("flixer") ||
      window.location.hostname.includes("flixer.ink")
    );
    const isCineplay = typeof window !== "undefined" && (
      window.location.hostname.includes("cineplay")
    );
    
    const brandName = isFlixer ? "Flixer Stream" : (isCineby ? "Cineby Stream" : (isCineplay ? "Cineplay Stream" : "Bitcine Stream"));
    const brandShort = isFlixer ? "Flixer" : (isCineby ? "Cineby" : (isCineplay ? "Cineplay" : "Bitcine"));
    
    let baseKeywords = "";
    if (isFlixer) {
      baseKeywords = "flixer, flixer free movies, flixer.ink, flixer movies, flixer stream, flixer official, flixer site, flixer movies tags, watch movies free on flixer, free movies online, watch hd movies, free streaming sites, watch tv series online";
    } else if (isCineby) {
      baseKeywords = "cineby, cineby free movies, cineby.mom, cineby stream, cineby official, cineby site, cineby movies, cineby tv shows, watch movies free on cineby, free movies online, watch hd movies, free streaming sites, watch tv series online";
    } else if (isCineplay) {
      baseKeywords = "cineplay, cineplay free movies, cineplay.online, cineplay stream, cineplay official, cineplay site, cineplay movies, cineplay tv shows, watch movies free on cineplay, free movies online, watch hd movies, free streaming sites, watch tv series online";
    } else {
      baseKeywords = "bitcine, watch movies, watch tv series, streaming service, movie catalog, free cinema, interactive api helper, HD movies online, bitcine.online";
    }

    // 1. Determine Title based on current browsing state
    let title = "";
    if (isFlixer) {
      title = "Flixer - Watch Free Movies & TV Shows Online in HD";
    } else if (isCineby) {
      title = "Cineby - Watch Free Movies & TV Shows Online in HD";
    } else if (isCineplay) {
      title = "Cineplay - Watch Free Movies & TV Shows Online in HD";
    } else {
      title = "Bitcine | Watch Movies & TV Shows Free in HD";
    }

    let description = "";
    if (isFlixer) {
      description = "Watch unlimited movies & TV shows free on Flixer (flixer.ink). Stream in high-fidelity full HD with zero popups, multiple server links, and clean modern playback.";
    } else if (isCineby) {
      description = "Watch unlimited movies & TV shows free on Cineby (cineby.mom). Stream in high-fidelity full HD with zero popups, multiple server links, and clean modern playback.";
    } else if (isCineplay) {
      description = "Watch unlimited movies & TV shows free on Cineplay (cineplay.online). Stream in high-fidelity full HD with zero popups, multiple server links, and clean modern playback.";
    } else {
      description = `Watch unlimited movies & TV shows on ${brandName}. Enjoy high-fidelity cinema playback, raw JSON analytics API testing, and detailed media indexes with no ads.`;
    }

    const brandCanonicalOrigin = isFlixer 
      ? "https://flixer.ink" 
      : (isCineplay ? "https://cineplay.online" : (isCineby ? "https://cineby.mom" : "https://bitcine.online"));

    let keywords = baseKeywords;
    let type = "video.movie";
    let ogImage = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=630&fit=crop"; // Default gorgeous cinematic poster representation
    const canonicalUrl = brandCanonicalOrigin + (activeTab === "home" ? "" : `/${activeTab}`);

    if (modalOpen && selectedMovie) {
      const year = selectedMovie.release_date ? new Date(selectedMovie.release_date).getFullYear() : (selectedMovie.first_air_date ? new Date(selectedMovie.first_air_date).getFullYear() : "");
      const yearStr = year ? ` (${year})` : "";
      const mediaName = selectedMovie.title || selectedMovie.name;
      title = isFlixer
        ? `Watch ${mediaName}${yearStr} Free Online on Flixer`
        : (isCineby
          ? `Watch ${mediaName}${yearStr} Free Online on Cineby`
          : (isCineplay
            ? `Watch ${mediaName}${yearStr} Free Online on Cineplay`
            : `Watch ${mediaName}${yearStr} Premium HD | ${brandName}`));
      description = selectedMovie.overview || `Stream ${mediaName} in full high-fidelity cinematic resolution with multi-server playback options on ${brandShort}.`;
      keywords = isFlixer
        ? `watch ${mediaName} free, watch ${mediaName} online, flixer ${mediaName}, flixer movies, stream ${mediaName} online, watch free ${mediaName} hd, flixer movies tags`
        : (isCineby
          ? `watch ${mediaName} free, watch ${mediaName} online, cineby ${mediaName}, stream ${mediaName} online, watch free ${mediaName} hd, cineby movies, ${mediaName} cast, ${mediaName} download`
          : (isCineplay
            ? `watch ${mediaName} free, watch ${mediaName} online, cineplay ${mediaName}, stream ${mediaName} online, watch free ${mediaName} hd, cineplay movies, ${mediaName} cast, ${mediaName} download`
            : `${mediaName}, watch ${mediaName}, stream online, cast info, release date, download hd movies`));
      type = "video.movie";
      if (selectedMovie.backdrop_path) {
        ogImage = `https://image.tmdb.org/t/p/w1280${selectedMovie.backdrop_path}`;
      } else if (selectedMovie.poster_path) {
        ogImage = `https://image.tmdb.org/t/p/w780${selectedMovie.poster_path}`;
      }
    } else {
      switch (activeTab) {
        case "browse":
          title = isFlixer
            ? `Flixer - Browse Movies, TV Shows, Trending Genres`
            : (isCineby
              ? `Cineby - Browse Movies, TV Shows, Trending Genres`
              : (isCineplay
                ? `Cineplay - Browse Movies, TV Shows, Trending Genres`
                : `Browse Movie Categories & TV Shows | ${brandName}`));
          description = isFlixer
            ? "Discover trending movies, TV shows, action-packed adventures, comedies, and sci-fi on Flixer. Clean, categorized streaming directory sorted dynamically."
            : (isCineby
              ? "Discover trending movies, TV shows, action-packed adventures, comedies, and sci-fi on Cineby. Clean, categorized streaming directory sorted dynamically."
              : (isCineplay
                ? "Discover trending movies, TV shows, action-packed adventures, comedies, and sci-fi on Cineplay. Clean, categorized streaming directory sorted dynamically."
                : "Discover popular genres, top charts, highly-rated television shows, and experimental sci-fi catalogs sorted dynamically via TMDB data streams."));
          keywords = isFlixer
            ? `flixer browse, flixer movies, free cinema list, discover tv shows on flixer, high rated movies free`
            : (isCineby
              ? `cineby browse, movie catalog, free cinema list, discover tv shows on cineby, high rated movies free`
              : (isCineplay
                ? `cineplay browse, movie catalog, free cinema list, discover tv shows on cineplay, high rated movies free`
                : `browse movies, genre listing, highly rated cinema, movie discovery, tv shows sorted, ${brandShort.toLowerCase()}`));
          break;
        case "search":
          if (searchQuery) {
            title = isFlixer
              ? `Watch "${searchQuery}" Free on Flixer - Streaming Results`
              : (isCineby
                ? `Watch "${searchQuery}" Free on Cineby - Streaming Results`
                : (isCineplay
                  ? `Watch "${searchQuery}" Free on Cineplay - Streaming Results`
                  : `Search Results for "${searchQuery}" | ${brandName}`));
            description = isFlixer
              ? `Stream and watch your favorite titles matching "${searchQuery}" free in HD on Flixer.`
              : (isCineby
                ? `Stream and watch your favorite titles matching "${searchQuery}" free in HD on Cineby.`
                : `Stream and watch your favorite titles matching "${searchQuery}" free in HD on Cineplay.`);
            keywords = isFlixer
              ? `watch ${searchQuery} free, flixer ${searchQuery}, stream ${searchQuery} online, flixer movies`
              : (isCineby
                ? `watch ${searchQuery} free, cineby ${searchQuery}, stream ${searchQuery} online`
                : (isCineplay
                  ? `watch ${searchQuery} free, cineplay ${searchQuery}, stream ${searchQuery} online`
                  : `search movies, query cinema catalog, find titles, actor search, ${brandShort.toLowerCase()}`));
          } else {
            title = isFlixer
              ? `Search Movies & TV Series - Flixer Free Streaming`
              : (isCineby
                ? `Search Movies & TV Series - Cineby Free Streaming`
                : (isCineplay
                  ? `Search Movies & TV Series - Cineplay Free Streaming`
                  : `Search Premium Movies & TV Series | ${brandName}`));
            description = isFlixer
              ? "Search the complete Flixer library of movies, series, anime, and documentaries. Find your favorite film or show in seconds."
              : (isCineby
                ? "Search the complete Cineby library of movies, series, anime, and documentaries. Find your favorite film or show in seconds."
                : (isCineplay
                  ? "Search the complete Cineplay library of movies, series, anime, and documentaries. Find your favorite film or show in seconds."
                  : "Search our complete streaming library instantly. Find actors, directors, movie release years, and cinematic titles with zero latency."));
            keywords = isFlixer
              ? `search free movies, flixer finder, flixer stream search, flixer movies`
              : (isCineby
                ? `search free movies, cineby finder, cineby stream search`
                : (isCineplay
                  ? `search free movies, cineplay finder, cineplay stream search`
                  : `search movies, query cinema catalog, find titles, actor search, ${brandShort.toLowerCase()}`));
          }
          break;
        case "history":
          title = isFlixer
            ? `My Watchlist & Viewing History | Flixer`
            : (isCineby
              ? `My Watchlist & Viewing History | Cineby`
              : (isCineplay
                ? `My Watchlist & Viewing History | Cineplay`
                : `Watch History & Continued Streams | ${brandName}`));
          description = isFlixer
            ? `Access and resume your watching progress on Flixer. Free personalized queue of movies and series on your active session.`
            : (isCineby
              ? `Access and resume your watching progress on Cineby. Free personalized queue of movies and series on your active session.`
              : `Access and resume your watching progress on Cineplay. Free personalized queue of movies and series on your active session.`);
          keywords = isFlixer
            ? `flixer watchlist, flixer watch history, resume movie on flixer, flixer movies`
            : (isCineby
              ? `cineby watchlist, cineby watch history, resume movie on cineby`
              : (isCineplay
                ? `cineplay watchlist, cineplay watch history, resume movie on cineplay`
                : `stream history, continue watching, resume playback, watched episodes, movie offsets, ${brandShort.toLowerCase()}`));
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
      "url": brandCanonicalOrigin,
      "description": "Premium multi-source cinema metadata, TV logs, and developers' sandboxed layout system.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${brandCanonicalOrigin}?q={search_term_string}`,
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
