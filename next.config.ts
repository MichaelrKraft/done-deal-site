import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "randomuser.me" },
    ],
  },
  async redirects() {
    return [
      {
        source: '/yourcastle',
        destination: '/beta/yourcastle',
        permanent: true,
      },
      {
        source: '/exprealty',
        destination: '/beta/exprealty',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
