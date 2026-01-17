import type { NextConfig } from "next";
// @ts-expect-error - no types available
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    return config;
  },
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
