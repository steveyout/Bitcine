import "../index.css";
import { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Bebas_Neue, Plus_Jakarta_Sans } from "next/font/google";
import { headers } from "next/headers";
import Script from "next/script";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  let host = "cineby.mom";
  try {
    const headersList = await headers();
    host = headersList.get("host") || "cineby.mom";
  } catch (e) {
    // Graceful fallback for build-time static routes
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
    ? "Watch free movies and TV shows online in full HD on Flixer (flixer.ink). Enjoy fast, buffer-free streaming of popular blockbusters, classic cinema, and trending television series with zero popups."
    : (isCineby
      ? "Stream full HD movies and TV series for free on Cineby.at (Cineby CC). Enjoy top cinema, seriados, and shows with subtitles or dubbing"
      : (isCineplay
        ? "Watch free movies and TV shows online in full HD on Cineplay (cineplay.online). Enjoy fast, buffer-free streaming of popular blockbusters, classic cinema, and trending television series with zero popups."
        : "Explore and stream hundreds of premium movies, blockbuster collections, action-packed TV series, and cinematic classics on Bitcine Stream. Test APIs, query TMDB proxy databases, and experience next-gen media viewing."));
    
  const keywords = isFlixer
    ? "flixer, flixer free movies, flixer.ink, flixer movies, flixer stream, flixer official, watch movies free online, watch free tv shows, best free streaming sites, flixer alternative, watch movies free on flixer, free online cinema, flixer movies tags"
    : (isCineby
      ? "cineby, cineby.at, movies, free movies, streamex, cineby stremio, stremio, obsession, movie sites, cine, tubi, classico, cinevibe, cineby at tv, rive, cineby net, cinebyte, cineverse, coreflix, cineby free movies, cineby stream, cineby official, cineby movies, cineby tv shows, cineby.mom, watch movies free online, watch free tv shows, best free streaming sites, cineby alternative, watch movies free on cineby, free online cinema"
      : (isCineplay
        ? "cineplay, cineplay free movies, cineplay.online, cineplay stream, cineplay official, cineplay movies, cineplay tv shows, watch movies free online, watch free tv shows, best free streaming sites, cineplay alternative, watch movies free on cineplay, free online cinema"
        : "bitcine, watch movies, stream free, hd video streaming, cinema list, tmdb backend proxy, developer movie dashboard, movie index, latest tv series, bitcine.online"));

  return {
    metadataBase: new URL(domainUrl),
    title,
    description,
    keywords,
    authors: [{ name: isFlixer ? "Flixer Global Network" : (isCineby ? "Cineby Global Network" : (isCineplay ? "Cineplay Global Network" : "Bitcine Global Network")) }],
    robots: "index, follow",
    alternates: {
      canonical: "/",
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.png", type: "image/png", sizes: "32x32" },
        { url: "/logo.svg", type: "image/svg+xml" }
      ],
      shortcut: "/favicon.ico",
      apple: "/apple-icon.png",
    },
    openGraph: {
      type: "website",
      title,
      description,
      images: [{ url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=630&fit=crop" }],
      siteName,
      url: `${domainUrl}/`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=630&fit=crop"],
    }
  };
}

export const viewport: Viewport = {
  themeColor: "#050110",
  width: "device-width",
  initialScale: 1.0,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let host = "cineby.mom";
  try {
    const headersList = await headers();
    host = headersList.get("host") || "cineby.mom";
  } catch (e) {
    // Fallback for build time
  }

  const isCineby = host.includes("cineby") || host.includes("cineby.mom") || host.includes("cineby.at");
  const isFlixer = host.includes("flixer") || host.includes("flixer.ink");
  const isCineplay = host.includes("cineplay");
  const brandName = isFlixer ? "Flixer Stream" : (isCineby ? "Cineby Stream" : (isCineplay ? "Cineplay Stream" : "Bitcine Stream"));
  const domainUrl = isFlixer
    ? "https://flixer.ink"
    : (isCineplay
      ? "https://cineplay.online"
      : (isCineby 
        ? (host.includes("cineby.at") ? "https://cineby.at" : "https://cineby.mom")
        : "https://bitcine.online"));
  const brandDesc = isFlixer
    ? "Watch free movies and TV shows online in full HD on Flixer (flixer.ink). Fast, high-fidelity buffer-free streaming of blockbusters and series."
    : (isCineby
      ? "Stream full HD movies and TV series for free on Cineby.at (Cineby CC). Enjoy top cinema, seriados, and shows with subtitles or dubbing"
      : (isCineplay
        ? "Watch free movies and TV shows online in full HD on Cineplay (cineplay.online). Fast, high-fidelity buffer-free streaming of blockbusters and series."
        : "Explore and stream hundreds of premium movies, blockbuster collections, action-packed TV series, and cinematic classics on Bitcine Stream."));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": brandName,
    "url": `${domainUrl}/`,
    "description": brandDesc,
    "genre": "Cinema & Television Streaming",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${domainUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${bebasNeue.variable}`}>
      <head>
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var originalFetch = window.fetch;
                  var currentFetch = originalFetch;
                  Object.defineProperty(window, 'fetch', {
                    get: function() {
                      return currentFetch || originalFetch;
                    },
                    set: function(val) {
                      currentFetch = val;
                    },
                    configurable: true,
                    enumerable: true
                  });
                } catch (e) {
                  console.warn("Unable to define window.fetch setter:", e);
                }
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      </head>
      <body className="antialiased bg-[#040001] text-[#f8fafc] font-sans">
        {children}
        <GoogleAnalytics gaId="G-4F51F8KKEP" />
        <Script
            src="//ys.cowergawsie.com/rDbtZOsD8SL117o/144687"
            strategy="afterInteractive"
            data-cfasync="false"
        />

        {/* 1. Define the configuration options inline */}
        <Script id="at-options" strategy="beforeInteractive">
          {`
            window.atOptions = {
              'key' : 'e77be7a01f5b1b7367422aae10511e22',
              'format' : 'iframe',
              'height' : 250,
              'width' : 300,
              'params' : {}
            };
          `}
        </Script>

        {/* 2. Load the external invoke.js script */}
        <Script
            src="https://directoryeditorweep.com/e77be7a01f5b1b7367422aae10511e22/invoke.js"
            strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
