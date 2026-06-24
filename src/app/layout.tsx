import "../index.css";
import { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Bebas_Neue, Plus_Jakarta_Sans } from "next/font/google";
import Script from 'next/script';
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
  let host = "bitcine.online";
  try {
    const headersList = await headers();
    host = headersList.get("host") || "bitcine.online";
  } catch (e) {
    // Graceful fallback for build-time static routes
  }

  const isCineby = host.includes("cineby") || host.includes("cineby.mom");
  const siteName = isCineby ? "Cineby Stream" : "Bitcine Stream";
  const domainUrl = isCineby ? "https://cineby.mom" : "https://bitcine.online";
  
  const title = isCineby 
    ? "Cineby Stream | Watch Unlimited Premium Movies & TV Shows in Full HD" 
    : "Bitcine Stream | Watch Movies & TV Series in Premium HD";
    
  const description = isCineby
    ? "Explore, browse, and stream hundreds of premium blockbuster movies, popular TV series and classic cinema directly on Cineby Stream. Experience high-fidelity smooth cinematic layouts with zero clutter."
    : "Explore and stream hundreds of premium movies, blockbuster collections, action-packed TV series, and cinematic classics on Bitcine Stream. Test APIs, query TMDB proxy databases, and experience next-gen media viewing.";
    
  const keywords = isCineby
    ? "cineby, watch movies online, stream free TV, hd video streaming, cinema list, interactive movie hub, browser cinema index, latest TV series, cineby.mom"
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
  let host = "bitcine.online";
  try {
    const headersList = await headers();
    host = headersList.get("host") || "bitcine.online";
  } catch (e) {
    // Fallback for build time
  }

  const isCineby = host.includes("cineby") || host.includes("cineby.mom");
  const brandName = isCineby ? "Cineby Stream" : "Bitcine Stream";
  const domainUrl = isCineby ? "https://cineby.mom" : "https://bitcine.online";
  const brandDesc = isCineby
    ? "Explore, browse, and stream hundreds of premium blockbuster movies, popular TV series and classic cinema directly on Cineby Stream."
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
        <Script
            src="//ub.fizzledesire.com/ryuVlLuQ2R5ZWT/GLGlX"
            strategy="afterInteractive"
            data-cfasync="false"
        />
        <script
            dangerouslySetInnerHTML={{
              __html: `
            atOptions = {
              'key' : 'd32c61adc427589a7600972296114b20',
              'format' : 'iframe',
              'height' : 90,
              'width' : 728,
              'params' : {}
            };
          `,
            }}
        />
        <Script
            src="https://directoryeditorweep.com/d32c61adc427589a7600972296114b20/invoke.js"
            strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
