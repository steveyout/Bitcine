import { MetadataRoute } from "next";
import { headers } from "next/headers";
import { api } from "../services/api";

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let host = "cineby.mom";
  try {
    const headersList = await headers();
    host = headersList.get("host") || "cineby.mom";
  } catch (e) {
    // Fallback for static builds
  }

  const isCineby = host.includes("cineby") || host.includes("cineby.mom") || host.includes("cineby.at");
  const isFlixer = host.includes("flixer") || host.includes("flixer.ink");
  const isCineplay = host.includes("cineplay");
  const baseUrl = isFlixer
    ? "https://flixer.ink"
    : (isCineplay
      ? "https://cineplay.online"
      : (isCineby 
        ? "https://cineby.mom"
        : "https://bitcine.online"));

  // Base routing index entries
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/history`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Try parsing mock film assets for direct search engine landing indices
  try {
    const fallbackMovies = api.getFallbackMovies();
    const fallbackTV = api.getFallbackSeries();

    fallbackMovies.forEach((movie) => {
      const slug = `${movie.id}-${slugify(movie.title || "movie")}`;
      routes.push({
        url: `${baseUrl}/?watch=${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });

    fallbackTV.forEach((show) => {
      const slug = `${show.id}-${slugify(show.name || "show")}`;
      routes.push({
        url: `${baseUrl}/?watch=${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });
  } catch (e) {
    // Graceful fallback
  }

  return routes;
}
