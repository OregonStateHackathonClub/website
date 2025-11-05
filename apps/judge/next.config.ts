import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "beaverhacks.org",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      // You can add other trusted domains here
    ],
  },
  experimental: {
		useCache: true,
		authInterrupts: true,
	},
	reactCompiler: true,
};

export default nextConfig;
