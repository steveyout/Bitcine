import { Metadata } from "next";
import { headers } from "next/headers";
import App from "../../App";

export async function generateMetadata(): Promise<Metadata> {
  let host = "cineby.mom";
  try {
    const headersList = await headers();
    host = headersList.get("host") || "cineby.mom";
  } catch (e) {
    // Fallback
  }

  const isCineby = host.includes("cineby") || host.includes("cineby.mom") || host.includes("cineby.at");
  const isFlixer = host.includes("flixer") || host.includes("flixer.ink");
  const isCineplay = host.includes("cineplay");

  const brandName = isFlixer ? "Flixer Stream" : (isCineby ? "Cineby Stream" : (isCineplay ? "Cineplay Stream" : "Bitcine Stream"));
  const brandCanonicalOrigin = isFlixer 
    ? "https://flixer.ink" 
    : (isCineplay ? "https://cineplay.online" : (isCineby ? (host.includes("cineby.at") ? "https://cineby.at" : "https://cineby.mom") : "https://bitcine.online"));

  const canonicalUrl = `${brandCanonicalOrigin}/series`;

  return {
    title: `Watch Free TV Series & Shows Online | ${brandName}`,
    description: `Stream trending TV shows, drama series, anime, and comedies online on ${brandName}.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Watch Free TV Series & Shows Online | ${brandName}`,
      description: `Stream trending TV shows, drama series, anime, and comedies online on ${brandName}.`,
      url: canonicalUrl,
      type: "website",
    },
  };
}

export default function SeriesPage() {
  return <App initialTab="browse" />;
}
