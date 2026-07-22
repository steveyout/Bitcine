import { Metadata } from "next";
import { headers } from "next/headers";
import { getMediaDetailsServer } from "../../../services/serverApi";
import App from "../../../App";
import { getTMDBImageUrl } from "../../../utils/imageUtils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || "";
  const id = parseInt(slug.split("-")[0]);

  if (isNaN(id)) {
    return { title: "TV Show not found" };
  }

  const tv = await getMediaDetailsServer(id, "tv");
  if (!tv) {
    return { title: "TV Show not found" };
  }

  let host = "cineby.mom";
  try {
    const headersList = await headers();
    host = headersList.get("host") || "cineby.mom";
  } catch (e) {
    // Graceful fallback for static generation
  }

  const isCineby = host.includes("cineby") || host.includes("cineby.mom") || host.includes("cineby.at");
  const isFlixer = host.includes("flixer") || host.includes("flixer.ink");
  const isCineplay = host.includes("cineplay");

  const brandName = isFlixer ? "Flixer Stream" : (isCineby ? "Cineby Stream" : (isCineplay ? "Cineplay Stream" : "Bitcine Stream"));
  const brandShort = isFlixer ? "Flixer" : (isCineby ? "Cineby" : (isCineplay ? "Cineplay" : "Bitcine"));

  const yearStr = tv.first_air_date ? ` (${new Date(tv.first_air_date).getFullYear()})` : "";
  const title = isFlixer
    ? `Watch ${tv.name}${yearStr} Free Online on Flixer`
    : (isCineby
      ? `Watch ${tv.name}${yearStr} Free Online on Cineby`
      : (isCineplay
        ? `Watch ${tv.name}${yearStr} Free Online on Cineplay`
        : `Watch ${tv.name}${yearStr} Premium HD | ${brandName}`));

  const description = tv.overview || `Stream ${tv.name} in full high-fidelity cinematic resolution with multi-server playback options on ${brandShort}.`;
  
  const baseKeywords = isFlixer
    ? `watch ${tv.name} free, watch ${tv.name} online, flixer ${tv.name}, flixer movies, stream ${tv.name} online, watch free ${tv.name} hd, flixer movies tags`
    : (isCineby
      ? `watch ${tv.name} free, watch ${tv.name} online, cineby ${tv.name}, stream ${tv.name} online, watch free ${tv.name} hd, cineby movies, ${tv.name} cast, ${tv.name} download`
      : (isCineplay
        ? `watch ${tv.name} free, watch ${tv.name} online, cineplay ${tv.name}, stream ${tv.name} online, watch free ${tv.name} hd, cineplay movies, ${tv.name} cast, ${tv.name} download`
        : `${tv.name}, watch ${tv.name}, stream online, cast info, release date, download hd movies`));

  let ogImage = getTMDBImageUrl(tv.backdrop_path || tv.poster_path, "w1280", "backdrop");

  const brandCanonicalOrigin = isFlixer 
    ? "https://flixer.ink" 
    : (isCineplay ? "https://cineplay.online" : (isCineby ? (host.includes("cineby.at") ? "https://cineby.at" : "https://cineby.mom") : "https://bitcine.online"));

  const canonicalUrl = `${brandCanonicalOrigin}/tv/${slug}`;

  return {
    title,
    description,
    keywords: baseKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "video.tv_show",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: tv.name,
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    }
  };
}

export default async function TVPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || "";
  const id = parseInt(slug.split("-")[0]);

  let tv = null;
  if (!isNaN(id)) {
    tv = await getMediaDetailsServer(id, "tv");
  }

  let ogImage = "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=1200";
  if (tv) {
    if (tv.backdrop_path) {
      ogImage = tv.backdrop_path.startsWith("http") ? tv.backdrop_path : `https://image.tmdb.org/t/p/w1280${tv.backdrop_path}`;
    } else if (tv.poster_path) {
      ogImage = tv.poster_path.startsWith("http") ? tv.poster_path : `https://image.tmdb.org/t/p/w780${tv.poster_path}`;
    }
  }

  const schema = tv ? {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    "name": tv.name,
    "description": tv.overview,
    "image": ogImage,
    "dateCreated": tv.first_air_date,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": tv.vote_average || 7.5,
      "bestRating": "10",
      "worstRating": "1",
      "ratingCount": tv.vote_count || 120
    }
  } : null;

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <App initialWatchId={id} initialWatchType="tv" />
    </>
  );
}
