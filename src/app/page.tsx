import { Metadata } from "next";
import { headers } from "next/headers";
import App from "../App";

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
  
  const siteName = isFlixer ? "Flixer" : (isCineby ? "Cineby" : (isCineplay ? "Cineplay" : "Bitcine Stream"));
  const domainUrl = isFlixer
    ? "https://flixer.ink"
    : (isCineplay
      ? "https://cineplay.online"
      : (isCineby 
        ? (host.includes("cineby.at") ? "https://cineby.at" : "https://cineby.mom")
        : "https://bitcine.online"));

  const title = isFlixer
    ? "Flixer - Watch Free Movies & TV Shows Online HD"
    : (isCineby 
      ? "Cineby - Watch Free Movies & TV Shows Online HD" 
      : (isCineplay
        ? "Cineplay - Watch Free Movies & TV Shows Online HD"
        : "Bitcine Stream | Watch Movies & TV Series in Premium HD"));

  const description = isFlixer
    ? "Watch free movies and TV shows online in full HD on Flixer (flixer.ink). Fast, buffer-free streaming of popular blockbusters, classic cinema, and trending television series with zero popups."
    : (isCineby
      ? "Stream full HD movies and TV series for free on Cineby.at (Cineby CC). Enjoy top cinema, seriados, and shows with subtitles or dubbing."
      : (isCineplay
        ? "Watch free movies and TV shows online in full HD on Cineplay (cineplay.online). Fast, buffer-free streaming of popular blockbusters, classic cinema, and trending television series with zero popups."
        : "Explore and stream hundreds of premium movies, blockbuster collections, action-packed TV series, and cinematic classics on Bitcine Stream."));

  return {
    title,
    description,
    alternates: {
      canonical: domainUrl,
    },
    openGraph: {
      title,
      description,
      url: domainUrl,
      siteName,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    }
  };
}

export default function Home() {
  return <App />;
}
