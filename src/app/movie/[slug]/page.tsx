import { Metadata } from "next";
import { headers } from "next/headers";
import { getMediaDetailsServer } from "../../../services/serverApi";
import App from "../../../App";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || "";
  const id = parseInt(slug.split("-")[0]);

  if (isNaN(id)) {
    return { title: "Movie not found" };
  }

  const movie = await getMediaDetailsServer(id, "movie");
  if (!movie) {
    return { title: "Movie not found" };
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

  const yearStr = movie.release_date ? ` (${new Date(movie.release_date).getFullYear()})` : "";
  const title = isFlixer
    ? `Watch ${movie.title}${yearStr} Free Online on Flixer`
    : (isCineby
      ? `Watch ${movie.title}${yearStr} Free Online on Cineby`
      : (isCineplay
        ? `Watch ${movie.title}${yearStr} Free Online on Cineplay`
        : `Watch ${movie.title}${yearStr} Premium HD | ${brandName}`));

  const description = movie.overview || `Stream ${movie.title} in full high-fidelity cinematic resolution with multi-server playback options on ${brandShort}.`;
  
  const baseKeywords = isFlixer
    ? `watch ${movie.title} free, watch ${movie.title} online, flixer ${movie.title}, flixer movies, stream ${movie.title} online, watch free ${movie.title} hd, flixer movies tags`
    : (isCineby
      ? `watch ${movie.title} free, watch ${movie.title} online, cineby ${movie.title}, stream ${movie.title} online, watch free ${movie.title} hd, cineby movies, ${movie.title} cast, ${movie.title} download`
      : (isCineplay
        ? `watch ${movie.title} free, watch ${movie.title} online, cineplay ${movie.title}, stream ${movie.title} online, watch free ${movie.title} hd, cineplay movies, ${movie.title} cast, ${movie.title} download`
        : `${movie.title}, watch ${movie.title}, stream online, cast info, release date, download hd movies`));

  let ogImage = "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=1200";
  if (movie.backdrop_path) {
    ogImage = movie.backdrop_path.startsWith("http") ? movie.backdrop_path : `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`;
  } else if (movie.poster_path) {
    ogImage = movie.poster_path.startsWith("http") ? movie.poster_path : `https://image.tmdb.org/t/p/w780${movie.poster_path}`;
  }

  const brandCanonicalOrigin = isFlixer 
    ? "https://flixer.ink" 
    : (isCineplay ? "https://cineplay.online" : (isCineby ? (host.includes("cineby.at") ? "https://cineby.at" : "https://cineby.mom") : "https://bitcine.online"));

  const canonicalUrl = `${brandCanonicalOrigin}/movie/${slug}`;

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
      type: "video.movie",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: movie.title,
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

export default async function MoviePage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || "";
  const id = parseInt(slug.split("-")[0]);

  let movie = null;
  if (!isNaN(id)) {
    movie = await getMediaDetailsServer(id, "movie");
  }

  let ogImage = "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=1200";
  if (movie) {
    if (movie.backdrop_path) {
      ogImage = movie.backdrop_path.startsWith("http") ? movie.backdrop_path : `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`;
    } else if (movie.poster_path) {
      ogImage = movie.poster_path.startsWith("http") ? movie.poster_path : `https://image.tmdb.org/t/p/w780${movie.poster_path}`;
    }
  }

  const schema = movie ? {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": movie.title,
    "description": movie.overview,
    "image": ogImage,
    "dateCreated": movie.release_date,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": movie.vote_average || 7.5,
      "bestRating": "10",
      "worstRating": "1",
      "ratingCount": movie.vote_count || 120
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
      <App initialWatchId={id} initialWatchType="movie" />
    </>
  );
}
