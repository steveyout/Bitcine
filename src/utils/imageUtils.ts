export type TMDBImageSize = "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "w1280" | "original" | (string & {});
export type TMDBFallbackType = "poster" | "backdrop" | "profile" | (string & {});

/**
 * Safely constructs a valid TMDB image URL with fallback protection.
 * Handles missing paths, missing leading slashes, "null" strings, and external URLs.
 */
export function getTMDBImageUrl(
  path: string | null | undefined,
  size: TMDBImageSize = "w342",
  fallbackType: TMDBFallbackType = "poster"
): string {
  const defaultPoster = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500";
  const defaultBackdrop = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200";
  const defaultProfile = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300";

  const defaultFallback = fallbackType === "backdrop" 
    ? defaultBackdrop 
    : (fallbackType === "profile" ? defaultProfile : defaultPoster);

  if (!path || path === "null" || path === "undefined" || typeof path !== "string" || path.trim() === "") {
    return defaultFallback;
  }

  const cleanPath = path.trim();

  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    return cleanPath;
  }

  // Ensure path starts with a leading slash `/`
  const formattedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

  return `https://image.tmdb.org/t/p/${size}${formattedPath}`;
}
