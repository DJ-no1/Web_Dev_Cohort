import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "cdn.hashnode.com" },
      { hostname: "img.youtube.com" },
      { hostname: "github.com" },
      { hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
