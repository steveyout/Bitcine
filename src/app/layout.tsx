import "../index.css";
import { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Bebas_Neue, Plus_Jakarta_Sans } from "next/font/google";
import { headers } from "next/headers";

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
  let host = "cineby.at";
  try {
    const headersList = await headers();
    host = headersList.get("host") || "cineby.at";
  } catch (e) {
    // Graceful fallback for build-time static routes
  }

  const isCineby = host.includes("cineby") || host.includes("cineby.mom") || host.includes("cineby.at");
  const siteName = isCineby ? "Cineby" : "Bitcine Stream";
  const domainUrl = isCineby 
    ? (host.includes("localhost") || host.includes("run.app") ? "https://cineby.at" : `https://${host}`) 
    : "https://bitcine.online";
  
  const title = isCineby 
    ? "Cineby - Watch Free Movies & TV Shows Online HD" 
    : "Bitcine Stream | Watch Movies & TV Series in Premium HD";
    
  const description = isCineby
    ? "Watch free movies and TV shows online in full HD on Cineby (cineby.at). Enjoy fast, buffer-free streaming of popular blockbusters, classic cinema, and trending television series with zero popups."
    : "Explore and stream hundreds of premium movies, blockbuster collections, action-packed TV series, and cinematic classics on Bitcine Stream. Test APIs, query TMDB proxy databases, and experience next-gen media viewing.";
    
  const keywords = isCineby
    ? "cineby, cineby free movies, cineby.at, cineby stream, cineby official, cineby movies, cineby tv shows, cineby.mom, watch movies free online, watch free tv shows, best free streaming sites, cineby alternative, watch movies free on cineby, free online cinema"
    : "bitcine, watch movies, stream free, hd video streaming, cinema list, tmdb backend proxy, developer movie dashboard, movie index, latest tv series, bitcine.online";

  return {
    metadataBase: new URL(domainUrl),
    title,
    description,
    keywords,
    authors: [{ name: isCineby ? "Cineby Global Network" : "Bitcine Global Network" }],
    robots: "index, follow",
    alternates: {
      canonical: "/",
    },
    icons: {
      icon: "/logo.svg",
      shortcut: "/logo.svg",
      apple: "/logo.svg",
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
  let host = "cineby.at";
  try {
    const headersList = await headers();
    host = headersList.get("host") || "cineby.at";
  } catch (e) {
    // Fallback for build time
  }

  const isCineby = host.includes("cineby") || host.includes("cineby.mom") || host.includes("cineby.at");
  const brandName = isCineby ? "Cineby Stream" : "Bitcine Stream";
  const domainUrl = isCineby 
    ? (host.includes("localhost") || host.includes("run.app") ? "https://cineby.at" : `https://${host}`) 
    : "https://bitcine.online";
  const brandDesc = isCineby
    ? "Watch free movies and TV shows online in full HD on Cineby (cineby.at). Fast, high-fidelity buffer-free streaming of blockbusters and series."
    : "Explore and stream hundreds of premium movies, blockbuster collections, action-packed TV series, and cinematic classics on Bitcine Stream.";

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
      </body>
    </html>
  );
}
