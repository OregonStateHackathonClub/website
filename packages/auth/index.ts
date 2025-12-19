import { prisma } from "@repo/database";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// --- Environment Variable Validation ---
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

if (!githubClientId || !githubClientSecret) {
  throw new Error(
    "Missing GitHub OAuth credentials in .env.local or deployment environment",
  );
}
// ------------------------------------

export const auth = betterAuth({
  socialProviders: {
    github: {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
});

export type Session = typeof auth.$Infer.Session;

export { getSessionCookie } from "better-auth/cookies";
// Re-export for Next.js API routes
export { toNextJsHandler } from "better-auth/next-js";
