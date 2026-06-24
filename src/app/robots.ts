import { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function robots(): Promise<MetadataRoute.Robots> {
  let host = "bitcine.online";
  try {
    const headersList = await headers();
    host = headersList.get("host") || "bitcine.online";
  } catch (e) {
    // Fallback for static builds
  }

  const isCineby = host.includes("cineby") || host.includes("cineby.mom");
  const baseUrl = isCineby ? "https://cineby.mom" : "https://bitcine.online";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/browse", "/search"],
      disallow: ["/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
