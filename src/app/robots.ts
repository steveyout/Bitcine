import { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function robots(): Promise<MetadataRoute.Robots> {
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
        ? (host.includes("cineby.at") ? "https://cineby.at" : "https://cineby.mom")
        : "https://bitcine.online"));

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/browse", "/search"],
      disallow: ["/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
