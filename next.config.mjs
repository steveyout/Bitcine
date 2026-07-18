/** @type {import('next').NextConfig} */
const nextConfig = {
  // Whitelisted brand domains for Next.js multi-tenant server routing:
  // - cineby.at, cineby.mom, cineby.mom, bitcine.online, flixer.ink (NEW REDDISH THEME BRAND)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
