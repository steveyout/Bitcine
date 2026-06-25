import { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function robots(): Promise<MetadataRoute.Robots> {
  let host = "cineby.at";
  try {
    const headersList = await headers();
    host = headersList.get("host") || "cineby.at";
  } catch (e) {
    // Fallback for static builds
  }

  const isCineby = host.includes("cineby") || host.includes("cineby.mom") || host.includes("cineby.at");
  const baseUrl = isCineby 
    ? (host.includes("localhost") || host.includes("run.app") ? "https://cineby.at" : `https://${host}`)
    : "https://bitcine.online";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/browse", "/search"],
      disallow: ["/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
