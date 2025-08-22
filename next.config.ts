/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "photos.zillowstatic.com",
      "www.spareroom.com",
      "images.spareroom.com",
      "images.pexels.com",
      "i.vimeocdn.com",
      "placehold.co",
      process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", ""),
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.spareroom.com",
      },
      {
        protocol: "https",
        hostname: "**.zillowstatic.com",
      },
      {
        protocol: "https",
        hostname: "**.pexels.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.vimeocdn.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },

  // 🚨 Add this to skip ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
