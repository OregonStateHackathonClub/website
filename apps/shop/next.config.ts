import type { NextConfig } from "next";
// @ts-expect-error - no types available
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";

// 'unsafe-eval' is only allowed in dev for React Refresh hot reload.
const isDev = process.env.NODE_ENV === "development";
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://beaverhacks.org",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  // Stripe Checkout is a top-level redirect to checkout.stripe.com, which
  // doesn't require a form-action exception. Re-add 'https://checkout.stripe.com'
  // here if a future flow uses an embedded form posting to Stripe.
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    return config;
  },
  experimental: {
    reactCompiler: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
