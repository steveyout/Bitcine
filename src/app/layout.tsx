import "../index.css";
import { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "Bitcine Stream | Watch Movies & TV Series in Premium HD",
  description: "Explore and stream hundreds of premium movies, blockbuster collections, action-packed TV series, and cinematic classics on Bitcine Stream. Test APIs, query TMDB proxy databases, and experience next-gen media viewing.",
  keywords: "bitcine, watch movies, stream free, hd video streaming, cinema list, tmdb backend proxy, developer movie dashboard, movie index, latest tv series",
  authors: [{ name: "Bitcine Global Network" }],
  robots: "index, follow",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    type: "website",
    title: "Bitcine Stream | Watch Movies & TV Series in Premium HD",
    description: "Discover premium movie collections, stream direct action-packed HD series, and monitor TMDB backend proxies on Bitcine's ultimate cinematic hub.",
    images: [{ url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=630&fit=crop" }],
    siteName: "Bitcine Stream",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bitcine Stream | Watch Movies & TV Series in Premium HD",
    description: "Discover premium movie collections, stream direct action-packed HD series, and monitor TMDB backend proxies on Bitcine's ultimate cinematic hub.",
    images: ["https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=630&fit=crop"],
  }
};

export const viewport: Viewport = {
  themeColor: "#050110",
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Bitcine Stream",
              "url": "https://bitcine.stream/",
              "description": "Premium multi-source cinema metadata, TV logs, and developers' sandboxed layout system.",
              "genre": "Cinema & Television Streaming",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://bitcine.stream/?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className="antialiased bg-[#050110] text-[#f8fafc]">
        {children}
        <GoogleAnalytics gaId="G-4F51F8KKEP" />
      </body>
    </html>
  );
}
